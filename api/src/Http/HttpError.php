<?php
declare(strict_types=1);

namespace LearningLab\Http;

/** Throw this anywhere to stop the request with a JSON error: { error: { code, message, details? } }. */
final class HttpError extends \RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly ?array $details = null,
    ) {
        parent::__construct($message);
    }

    public static function notFound(string $what = 'Not found'): self
    {
        return new self(404, 'not_found', $what);
    }

    public static function badRequest(string $message, ?array $details = null): self
    {
        return new self(400, 'invalid', $message, $details);
    }
}
