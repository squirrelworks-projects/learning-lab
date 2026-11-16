<?php
declare(strict_types=1);

namespace LearningLab;

/** Random public ids for URLs (e.g. play.html?a=k3f9xq2mzt). They can't be guessed or counted through. */
final class Ids
{
    private const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'; // no 0/o, 1/l/i
    public const LENGTH = 10;

    /** A new id that is not used yet in `$table.public_id`. */
    public static function create(string $table): string
    {
        do {
            $id = '';
            for ($i = 0; $i < self::LENGTH; $i++) {
                $id .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
        } while (Db::one("SELECT 1 FROM `$table` WHERE public_id = ?", [$id]));
        return $id;
    }

    public static function isValid(string $id): bool
    {
        return (bool) preg_match('/^[' . self::ALPHABET . ']{' . self::LENGTH . '}$/', $id);
    }
}
