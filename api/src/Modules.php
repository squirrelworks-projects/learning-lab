<?php
declare(strict_types=1);

namespace LearningLab;

/**
 * The module registry is the file system: every folder in /modules with a valid manifest.json is a module.
 * Adding a module never needs a database change.
 */
final class Modules
{
    private static ?array $cache = null;

    /** @return array<string, array{key: string, name: string, description: string, schemaVersion: int}> */
    public static function all(): array
    {
        if (self::$cache !== null) return self::$cache;
        self::$cache = [];
        foreach (glob(ROOT_DIR . '/modules/*/manifest.json') ?: [] as $file) {
            $manifest = json_decode((string) file_get_contents($file), true);
            $key = basename(dirname($file));
            if (!is_array($manifest) || ($manifest['key'] ?? null) !== $key || !self::isValidKey($key)) continue;
            self::$cache[$key] = [
                'key' => $key,
                'name' => (string) ($manifest['name'] ?? $key),
                'description' => (string) ($manifest['description'] ?? ''),
                'schemaVersion' => (int) ($manifest['schemaVersion'] ?? 1),
            ];
        }
        ksort(self::$cache);
        return self::$cache;
    }

    public static function exists(string $key): bool
    {
        return isset(self::all()[$key]);
    }

    public static function isValidKey(string $key): bool
    {
        return (bool) preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $key);
    }
}
