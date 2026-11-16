<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

/** Shared output formatting for the controllers. */
final class Format
{
    /** "2026-11-16 09:30:00" (UTC in the database) → "2026-11-16T09:30:00Z", or null. */
    public static function date(?string $value): ?string
    {
        return $value === null ? null : str_replace(' ', 'T', $value) . 'Z';
    }

    /** { id, name } of a joined user: the id is in column $idColumn, the name in "{$idColumn}_name" (author_id → author_name). */
    public static function person(array $row, string $idColumn): ?array
    {
        if (!isset($row[$idColumn])) return null;
        $nameColumn = preg_replace('/_id$/', '', $idColumn) . '_name';
        return ['id' => (int) $row[$idColumn], 'name' => $row[$nameColumn] ?? '(deleted user)'];
    }
}
