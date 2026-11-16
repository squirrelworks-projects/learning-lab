<?php
declare(strict_types=1);

namespace LearningLab;

use LearningLab\Http\HttpError;

/** Input checks. Each method returns the cleaned value or throws a 400 error that names the field. */
final class Validate
{
    public const DIFFICULTIES = ['green', 'yellow', 'red', 'black'];
    public const STATUSES = ['draft', 'published', 'archived'];

    public static function text(array $data, string $field, int $min = 1, int $max = 200, bool $required = true): ?string
    {
        $value = $data[$field] ?? null;
        if ($value === null && !$required) return null;
        if (!is_string($value)) throw self::fail($field, "“{$field}” must be text.");
        $value = trim($value);
        $length = mb_strlen($value);
        if ($length < $min || $length > $max) {
            throw self::fail($field, $min > 0 ? "“{$field}” must be {$min}–{$max} characters." : "“{$field}” can be at most {$max} characters.");
        }
        return $value;
    }

    public static function oneOf(array $data, string $field, array $allowed, ?string $default = null): string
    {
        $value = $data[$field] ?? $default;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            throw self::fail($field, "“{$field}” must be one of: " . implode(', ', $allowed) . '.');
        }
        return $value;
    }

    public static function int(array $data, string $field, int $min = 0): int
    {
        $value = $data[$field] ?? null;
        if (!is_int($value) || $value < $min) throw self::fail($field, "“{$field}” must be a whole number ≥ {$min}.");
        return $value;
    }

    public static function email(array $data, string $field = 'email'): string
    {
        $value = mb_strtolower(self::text($data, $field, 3, 190));
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) throw self::fail($field, 'That is not a valid email address.');
        return $value;
    }

    /** A module config: must be a JSON object (not a list) and at most 2 MB when encoded. */
    public static function config(array $data, string $field = 'config'): string
    {
        $value = $data[$field] ?? null;
        if (!is_array($value) || (array_is_list($value) && $value !== [])) {
            throw self::fail($field, '“config” must be a JSON object.');
        }
        $json = json_encode($value === [] ? new \stdClass() : $value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        if (strlen($json) > 2 * 1024 * 1024) throw self::fail($field, 'The assignment data is too large (max 2 MB).');
        return $json;
    }

    public static function fail(string $field, string $message): HttpError
    {
        return HttpError::badRequest($message, ['field' => $field]);
    }
}
