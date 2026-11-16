<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Ids;
use LearningLab\Modules;
use LearningLab\Validate;

/**
 * Assignments: one task in one module. The module's own data is stored untouched in `config`.
 * All teachers can see and edit all assignments. `version` protects against two teachers
 * overwriting each other: a PUT must send the version it started from.
 */
final class AssignmentController
{
    private const SELECT = "SELECT a.*, au.name AS author_name, ub.name AS updated_by_name,
            (SELECT COALESCE(SUM(s.count), 0) FROM learninglab_attempt_stats s WHERE s.assignment_id = a.id) AS attempts
        FROM learninglab_assignments a
        LEFT JOIN learninglab_users au ON au.id = a.author_id
        LEFT JOIN learninglab_users ub ON ub.id = a.updated_by";

    /** GET /assignments?module=&difficulty=&status=&author=me|{id}&q= */
    public static function list(Request $request): void
    {
        $user = Auth::require($request);
        $where = [];
        $args = [];
        $q = $request->query;

        if (!empty($q['module'])) { $where[] = 'a.module_key = ?'; $args[] = (string) $q['module']; }
        if (!empty($q['difficulty'])) { $where[] = 'a.difficulty = ?'; $args[] = (string) $q['difficulty']; }
        $status = (string) ($q['status'] ?? '');
        if ($status === 'all') {
            // no filter
        } elseif (in_array($status, Validate::STATUSES, true)) {
            $where[] = 'a.status = ?'; $args[] = $status;
        } else {
            $where[] = "a.status <> 'archived'";
        }
        $author = (string) ($q['author'] ?? '');
        if ($author === 'me') { $where[] = 'a.author_id = ?'; $args[] = $user['id']; }
        elseif (ctype_digit($author)) { $where[] = 'a.author_id = ?'; $args[] = (int) $author; }
        if (!empty($q['q'])) { $where[] = 'a.title LIKE ?'; $args[] = '%' . addcslashes((string) $q['q'], '%_\\') . '%'; }

        $sql = self::SELECT . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY a.updated_at DESC, a.id DESC LIMIT 500';
        $rows = Db::all($sql, $args);
        Response::json(['assignments' => array_map(fn ($r) => self::present($r, false), $rows)]);
    }

    /** GET /assignments/{id} – includes config and the courses it is used in. */
    public static function get(Request $request): void
    {
        Auth::require($request);
        Response::json(['assignment' => self::presentFull(self::find($request->intParam('id')))]);
    }

    /** POST /assignments { module, title, description?, difficulty, status?, schemaVersion, config } */
    public static function create(Request $request): void
    {
        $user = Auth::require($request);
        $data = $request->body();
        $module = Validate::text($data, 'module', 1, 40);
        if (!Modules::exists($module)) throw Validate::fail('module', "There is no module called “{$module}”.");
        $fields = self::fields($data);
        $publicId = Ids::create('learninglab_assignments');
        Db::run(
            'INSERT INTO learninglab_assignments (public_id, module_key, title, description, difficulty, status, config, schema_version, author_id, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$publicId, $module, $fields['title'], $fields['description'], $fields['difficulty'], $fields['status'],
             $fields['config'], $fields['schemaVersion'], $user['id'], $user['id']],
        );
        Response::json(['assignment' => self::presentFull(self::find(Db::lastId()))], 201);
    }

    /** PUT /assignments/{id} { title, description, difficulty, status, schemaVersion, config, version } */
    public static function update(Request $request): void
    {
        $user = Auth::require($request);
        $id = $request->intParam('id');
        self::find($id);
        $data = $request->body();
        $version = Validate::int($data, 'version', 1);
        $fields = self::fields($data);
        $changed = Db::run(
            'UPDATE learninglab_assignments SET title = ?, description = ?, difficulty = ?, status = ?, config = ?, schema_version = ?,
                    updated_by = ?, version = version + 1, updated_at = UTC_TIMESTAMP()
             WHERE id = ? AND version = ?',
            [$fields['title'], $fields['description'], $fields['difficulty'], $fields['status'], $fields['config'],
             $fields['schemaVersion'], $user['id'], $id, $version],
        );
        if ($changed === 0) throw self::conflict('learninglab_assignments', $id);
        Response::json(['assignment' => self::presentFull(self::find($id))]);
    }

    /** POST /assignments/{id}/duplicate – a draft copy owned by you. */
    public static function duplicate(Request $request): void
    {
        $user = Auth::require($request);
        $source = self::find($request->intParam('id'));
        Db::run(
            "INSERT INTO learninglab_assignments (public_id, module_key, title, description, difficulty, status, config, schema_version, author_id, updated_by)
             VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)",
            [Ids::create('learninglab_assignments'), $source['module_key'], mb_substr($source['title'] . ' (copy)', 0, 200),
             $source['description'], $source['difficulty'], $source['config'], $source['schema_version'], $user['id'], $user['id']],
        );
        Response::json(['assignment' => self::presentFull(self::find(Db::lastId()))], 201);
    }

    /** DELETE /assignments/{id} – refused (409 in_use) while a course uses it; archive it instead. */
    public static function delete(Request $request): void
    {
        Auth::require($request);
        $id = $request->intParam('id');
        self::find($id);
        $courses = self::usedIn($id);
        if ($courses) {
            throw new HttpError(409, 'in_use', 'This assignment is used in a course. Remove it from the course or archive it instead.', ['courses' => $courses]);
        }
        Db::run('DELETE FROM learninglab_assignments WHERE id = ?', [$id]);
        Response::noContent();
    }

    public static function find(int $id): array
    {
        return Db::one(self::SELECT . ' WHERE a.id = ?', [$id]) ?? throw HttpError::notFound('Assignment not found.');
    }

    /** @return array{id: int, title: string}[] */
    public static function usedIn(int $id): array
    {
        $rows = Db::all('SELECT c.id, c.title FROM learninglab_course_items i JOIN learninglab_courses c ON c.id = i.course_id WHERE i.assignment_id = ? ORDER BY c.title', [$id]);
        return array_map(fn ($r) => ['id' => (int) $r['id'], 'title' => $r['title']], $rows);
    }

    public static function present(array $row, bool $withConfig): array
    {
        $out = [
            'id' => (int) $row['id'],
            'publicId' => $row['public_id'],
            'module' => $row['module_key'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'difficulty' => $row['difficulty'],
            'status' => $row['status'],
            'schemaVersion' => (int) $row['schema_version'],
            'version' => (int) $row['version'],
            'author' => Format::person($row, 'author_id'),
            'updatedBy' => Format::person($row, 'updated_by'),
            'createdAt' => Format::date($row['created_at']),
            'updatedAt' => Format::date($row['updated_at']),
            'attempts' => (int) ($row['attempts'] ?? 0),
        ];
        if ($withConfig) $out['config'] = json_decode($row['config'], false, 512, JSON_THROW_ON_ERROR);
        return $out;
    }

    private static function presentFull(array $row): array
    {
        return self::present($row, true) + ['usedIn' => self::usedIn((int) $row['id'])];
    }

    private static function fields(array $data): array
    {
        return [
            'title' => Validate::text($data, 'title', 1, 200),
            'description' => Validate::text($data, 'description', 0, 5000, required: false) ?? '',
            'difficulty' => Validate::oneOf($data, 'difficulty', Validate::DIFFICULTIES, 'green'),
            'status' => Validate::oneOf($data, 'status', Validate::STATUSES, 'draft'),
            'schemaVersion' => Validate::int($data + ['schemaVersion' => 1], 'schemaVersion', 1),
            'config' => Validate::config($data),
        ];
    }

    /** 409 with who saved last, so the editor can tell the teacher. */
    public static function conflict(string $table, int $id): HttpError
    {
        $fresh = Db::one("SELECT t.version, t.updated_at, u.name FROM `$table` t LEFT JOIN learninglab_users u ON u.id = t.updated_by WHERE t.id = ?", [$id]);
        return new HttpError(409, 'conflict', "Someone else saved this in the meantime ({$fresh['name']}). Reload to see their changes.", [
            'version' => (int) $fresh['version'],
            'updatedBy' => $fresh['name'],
            'updatedAt' => Format::date($fresh['updated_at']),
        ]);
    }
}
