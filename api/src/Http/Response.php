<?php
declare(strict_types=1);

namespace LearningLab\Http;

/** Sends JSON responses. Every API response goes through here, so the security headers are always set. */
final class Response
{
    public static function json(mixed $data, int $status = 200): void
    {
        self::headers($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    public static function noContent(): void
    {
        self::headers(204);
    }

    public static function error(int $status, string $code, string $message, ?array $details = null): void
    {
        $error = ['code' => $code, 'message' => $message];
        if ($details !== null) $error['details'] = $details;
        self::json(['error' => $error], $status);
    }

    private static function headers(int $status): void
    {
        if (headers_sent()) return;
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');
        header('Referrer-Policy: same-origin');
    }
}
