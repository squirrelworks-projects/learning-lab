<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Config;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Ids;
use LearningLab\Validate;

/**
 * Image uploads for assignments. Files are saved as media/<publicId>.<ext> and served as static files.
 * Modules store the path ("media/k3f9xq2mzt.png") in their config.
 * SVG is not accepted: it can contain scripts.
 */
final class MediaController
{
    private const TYPES = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp'];

    /** GET /media – newest first. */
    public static function list(Request $request): void
    {
        Auth::require($request);
        $rows = Db::all('SELECT m.*, u.name AS uploaded_by_name FROM learninglab_media m LEFT JOIN learninglab_users u ON u.id = m.uploaded_by ORDER BY m.id DESC LIMIT 500');
        Response::json(['media' => array_map([self::class, 'present'], $rows)]);
    }

    /** POST /media (multipart/form-data, field "file") */
    public static function upload(Request $request): void
    {
        $user = Auth::require($request);
        $file = $_FILES['file'] ?? null;
        if (!$file || is_array($file['error'])) throw Validate::fail('file', 'Choose one image to upload.');
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > Config::get('upload_max_bytes')) {
            throw new HttpError(413, 'too_large', 'The image is too large (max ' . round(Config::get('upload_max_bytes') / 1048576) . ' MB).');
        }
        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) throw Validate::fail('file', 'The upload failed. Try again.');

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: '';
        $ext = self::TYPES[$mime] ?? throw Validate::fail('file', 'Only PNG, JPEG, GIF and WebP images can be uploaded.');
        $size = @getimagesize($file['tmp_name']);
        if (!$size) throw Validate::fail('file', 'The file is not a readable image.');

        $dir = Config::get('media_dir');
        if (!is_dir($dir) && !mkdir($dir, 0755, true)) throw new \RuntimeException("Cannot create $dir");
        $publicId = Ids::create('learninglab_media');
        $name = "$publicId.$ext";
        if (!move_uploaded_file($file['tmp_name'], "$dir/$name")) throw new \RuntimeException('Could not save the upload');

        Db::run(
            'INSERT INTO learninglab_media (public_id, path, original_name, mime, size, width, height, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [$publicId, "media/$name", mb_substr(basename((string) $file['name']), 0, 255), $mime, (int) $file['size'], $size[0], $size[1], $user['id']],
        );
        $row = Db::one('SELECT m.*, u.name AS uploaded_by_name FROM learninglab_media m LEFT JOIN learninglab_users u ON u.id = m.uploaded_by WHERE m.id = ?', [Db::lastId()]);
        Response::json(['media' => self::present($row)], 201);
    }

    /** DELETE /media/{id} – refused (409 in_use) while an assignment's config mentions the file. */
    public static function delete(Request $request): void
    {
        Auth::require($request);
        $row = Db::one('SELECT * FROM learninglab_media WHERE id = ?', [$request->intParam('id')]) ?? throw HttpError::notFound('Image not found.');
        $users = Db::all('SELECT id, title FROM learninglab_assignments WHERE config LIKE ?', ['%' . $row['path'] . '%']);
        if ($users) {
            throw new HttpError(409, 'in_use', 'This image is used in an assignment.', [
                'assignments' => array_map(fn ($a) => ['id' => (int) $a['id'], 'title' => $a['title']], $users),
            ]);
        }
        $file = Config::get('media_dir') . '/' . basename($row['path']);
        if (is_file($file)) unlink($file);
        Db::run('DELETE FROM learninglab_media WHERE id = ?', [$row['id']]);
        Response::noContent();
    }

    public static function present(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'publicId' => $row['public_id'],
            'src' => $row['path'],
            'name' => $row['original_name'],
            'mime' => $row['mime'],
            'size' => (int) $row['size'],
            'width' => $row['width'] === null ? null : (int) $row['width'],
            'height' => $row['height'] === null ? null : (int) $row['height'],
            'uploadedBy' => Format::person($row, 'uploaded_by'),
            'createdAt' => Format::date($row['created_at']),
        ];
    }
}
