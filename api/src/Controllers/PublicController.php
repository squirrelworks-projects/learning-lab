<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Ids;

/**
 * What the player (play.html) reads. No login and no cookies for students.
 * Only published items are served – except to a logged-in teacher, who can preview drafts.
 * No student data is stored: the attempts endpoint only adds 1 to an anonymous daily counter.
 */
final class PublicController
{
    /** GET /public/assignments/{publicId} */
    public static function assignment(Request $request): void
    {
        $row = self::findAssignment($request->params['publicId'] ?? '');
        Response::json(['assignment' => [
            'publicId' => $row['public_id'],
            'module' => $row['module_key'],
            'title' => $row['title'],
            'description' => $row['description'] ?? '',
            'difficulty' => $row['difficulty'],
            'status' => $row['status'],
            'schemaVersion' => (int) $row['schema_version'],
            'config' => json_decode($row['config'], false, 512, JSON_THROW_ON_ERROR),
        ]]);
    }

    /** GET /public/courses/{publicId} – the course and the (published) assignments in it, without their config. */
    public static function course(Request $request): void
    {
        $preview = self::isPreview();
        $course = self::findPublished('learninglab_courses', $request->params['publicId'] ?? '', $preview);
        $items = Db::all(
            "SELECT a.public_id, a.title, a.module_key, a.difficulty, a.status
             FROM learninglab_course_items i JOIN learninglab_assignments a ON a.id = i.assignment_id
             WHERE i.course_id = ? " . ($preview ? "AND a.status <> 'archived'" : "AND a.status = 'published'") . '
             ORDER BY i.position',
            [$course['id']],
        );
        Response::json(['course' => [
            'publicId' => $course['public_id'],
            'title' => $course['title'],
            'description' => $course['description'] ?? '',
            'status' => $course['status'],
            'items' => array_map(fn ($a) => [
                'publicId' => $a['public_id'],
                'title' => $a['title'],
                'module' => $a['module_key'],
                'difficulty' => $a['difficulty'],
                'status' => $a['status'],
            ], $items),
        ]]);
    }

    /** POST /public/attempts { assignment: publicId, course?: publicId } → 204. Counts published items only. */
    public static function attempt(Request $request): void
    {
        $assignmentPid = (string) $request->input('assignment', '');
        $coursePid = (string) $request->input('course', '');
        if (!Ids::isValid($assignmentPid)) throw HttpError::badRequest('Unknown assignment.');
        $assignment = Db::one("SELECT id FROM learninglab_assignments WHERE public_id = ? AND status = 'published'", [$assignmentPid]);
        if (!$assignment) {
            Response::noContent(); // drafts (teacher previews) are not counted
            return;
        }
        $courseId = 0;
        if ($coursePid !== '' && Ids::isValid($coursePid)) {
            $course = Db::one(
                "SELECT c.id FROM learninglab_courses c JOIN learninglab_course_items i ON i.course_id = c.id
                 WHERE c.public_id = ? AND c.status = 'published' AND i.assignment_id = ?",
                [$coursePid, $assignment['id']],
            );
            $courseId = $course ? (int) $course['id'] : 0;
        }
        Db::run(
            'INSERT INTO learninglab_attempt_stats (assignment_id, course_id, day, count) VALUES (?, ?, UTC_DATE(), 1)
             ON DUPLICATE KEY UPDATE count = count + 1',
            [$assignment['id'], $courseId],
        );
        Response::noContent();
    }

    private static function findAssignment(string $publicId): array
    {
        return self::findPublished('learninglab_assignments', $publicId, self::isPreview());
    }

    private static function findPublished(string $table, string $publicId, bool $preview): array
    {
        if (!Ids::isValid($publicId)) throw HttpError::notFound('Not found.');
        $row = Db::one("SELECT * FROM `$table` WHERE public_id = ?", [$publicId]);
        if (!$row || ($row['status'] !== 'published' && !$preview)) {
            throw HttpError::notFound($table === 'learninglab_courses' ? 'This course is not available.' : 'This assignment is not available.');
        }
        return $row;
    }

    /** A logged-in teacher may open drafts (preview in the admin). */
    private static function isPreview(): bool
    {
        return Auth::user() !== null;
    }
}
