<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Ids;
use LearningLab\Validate;

/** Courses: an ordered list of assignments from any modules. All teachers can edit all courses. */
final class CourseController
{
    private const SELECT = "SELECT c.*, au.name AS author_name, ub.name AS updated_by_name,
            (SELECT COUNT(*) FROM learninglab_course_items i WHERE i.course_id = c.id) AS item_count,
            (SELECT COALESCE(SUM(s.count), 0) FROM learninglab_attempt_stats s WHERE s.course_id = c.id) AS attempts
        FROM learninglab_courses c
        LEFT JOIN learninglab_users au ON au.id = c.author_id
        LEFT JOIN learninglab_users ub ON ub.id = c.updated_by";

    /** GET /courses?status=&author=me|{id}&q= */
    public static function list(Request $request): void
    {
        $user = Auth::require($request);
        $where = [];
        $args = [];
        $q = $request->query;
        $status = (string) ($q['status'] ?? '');
        if ($status === 'all') {
            // no filter
        } elseif (in_array($status, Validate::STATUSES, true)) {
            $where[] = 'c.status = ?'; $args[] = $status;
        } else {
            $where[] = "c.status <> 'archived'";
        }
        $author = (string) ($q['author'] ?? '');
        if ($author === 'me') { $where[] = 'c.author_id = ?'; $args[] = $user['id']; }
        elseif (ctype_digit($author)) { $where[] = 'c.author_id = ?'; $args[] = (int) $author; }
        if (!empty($q['q'])) { $where[] = 'c.title LIKE ?'; $args[] = '%' . addcslashes((string) $q['q'], '%_\\') . '%'; }

        $rows = Db::all(self::SELECT . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY c.updated_at DESC, c.id DESC LIMIT 500', $args);
        Response::json(['courses' => array_map([self::class, 'present'], $rows)]);
    }

    /** GET /courses/{id} – with its items in order. */
    public static function get(Request $request): void
    {
        Auth::require($request);
        Response::json(['course' => self::presentFull(self::find($request->intParam('id')))]);
    }

    /** POST /courses { title, description?, status?, items?: assignmentId[] } */
    public static function create(Request $request): void
    {
        $user = Auth::require($request);
        $data = $request->body();
        $fields = self::fields($data);
        $items = self::items($data);
        $id = Db::transaction(function () use ($fields, $items, $user) {
            Db::run(
                'INSERT INTO learninglab_courses (public_id, title, description, status, author_id, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
                [Ids::create('learninglab_courses'), $fields['title'], $fields['description'], $fields['status'], $user['id'], $user['id']],
            );
            $id = Db::lastId();
            self::saveItems($id, $items);
            return $id;
        });
        Response::json(['course' => self::presentFull(self::find($id))], 201);
    }

    /** PUT /courses/{id} { title, description, status, items: assignmentId[], version } – items replace the old list. */
    public static function update(Request $request): void
    {
        $user = Auth::require($request);
        $id = $request->intParam('id');
        self::find($id);
        $data = $request->body();
        $version = Validate::int($data, 'version', 1);
        $fields = self::fields($data);
        $items = self::items($data);
        Db::transaction(function () use ($id, $version, $fields, $items, $user) {
            $changed = Db::run(
                'UPDATE learninglab_courses SET title = ?, description = ?, status = ?, updated_by = ?, version = version + 1, updated_at = UTC_TIMESTAMP()
                 WHERE id = ? AND version = ?',
                [$fields['title'], $fields['description'], $fields['status'], $user['id'], $id, $version],
            );
            if ($changed === 0) throw AssignmentController::conflict('learninglab_courses', $id);
            Db::run('DELETE FROM learninglab_course_items WHERE course_id = ?', [$id]);
            self::saveItems($id, $items);
        });
        Response::json(['course' => self::presentFull(self::find($id))]);
    }

    /** DELETE /courses/{id} – the assignments are kept. */
    public static function delete(Request $request): void
    {
        Auth::require($request);
        $id = $request->intParam('id');
        self::find($id);
        Db::run('DELETE FROM learninglab_courses WHERE id = ?', [$id]);
        Response::noContent();
    }

    public static function find(int $id): array
    {
        return Db::one(self::SELECT . ' WHERE c.id = ?', [$id]) ?? throw HttpError::notFound('Course not found.');
    }

    public static function present(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'publicId' => $row['public_id'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'status' => $row['status'],
            'version' => (int) $row['version'],
            'author' => Format::person($row, 'author_id'),
            'updatedBy' => Format::person($row, 'updated_by'),
            'createdAt' => Format::date($row['created_at']),
            'updatedAt' => Format::date($row['updated_at']),
            'itemCount' => (int) $row['item_count'],
            'attempts' => (int) $row['attempts'],
        ];
    }

    private static function presentFull(array $row): array
    {
        $items = Db::all(
            'SELECT i.position, a.id, a.public_id, a.title, a.module_key, a.difficulty, a.status,
                    (SELECT COALESCE(SUM(s.count), 0) FROM learninglab_attempt_stats s WHERE s.assignment_id = a.id AND s.course_id = i.course_id) AS attempts
             FROM learninglab_course_items i JOIN learninglab_assignments a ON a.id = i.assignment_id
             WHERE i.course_id = ? ORDER BY i.position',
            [$row['id']],
        );
        return self::present($row) + ['items' => array_map(fn ($i) => [
            'position' => (int) $i['position'],
            'attempts' => (int) $i['attempts'],
            'assignment' => [
                'id' => (int) $i['id'],
                'publicId' => $i['public_id'],
                'title' => $i['title'],
                'module' => $i['module_key'],
                'difficulty' => $i['difficulty'],
                'status' => $i['status'],
            ],
        ], $items)];
    }

    private static function fields(array $data): array
    {
        return [
            'title' => Validate::text($data, 'title', 1, 200),
            'description' => Validate::text($data, 'description', 0, 5000, required: false) ?? '',
            'status' => Validate::oneOf($data, 'status', Validate::STATUSES, 'draft'),
        ];
    }

    /** @return int[] assignment ids in order, checked to exist and to be unique */
    private static function items(array $data): array
    {
        $items = $data['items'] ?? [];
        if (!is_array($items) || !array_is_list($items) || count($items) > 200) throw Validate::fail('items', '“items” must be a list of assignment ids.');
        foreach ($items as $id) {
            if (!is_int($id)) throw Validate::fail('items', '“items” must be a list of assignment ids.');
        }
        if (count(array_unique($items)) !== count($items)) throw Validate::fail('items', 'An assignment can only be in a course once.');
        if ($items) {
            $found = Db::all('SELECT id FROM learninglab_assignments WHERE id IN (' . implode(',', array_fill(0, count($items), '?')) . ')', $items);
            if (count($found) !== count($items)) throw Validate::fail('items', 'One of the assignments no longer exists.');
        }
        return $items;
    }

    private static function saveItems(int $courseId, array $items): void
    {
        foreach ($items as $position => $assignmentId) {
            Db::run('INSERT INTO learninglab_course_items (course_id, position, assignment_id) VALUES (?, ?, ?)', [$courseId, $position + 1, $assignmentId]);
        }
    }
}
