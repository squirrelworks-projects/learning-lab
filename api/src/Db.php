<?php
declare(strict_types=1);

namespace LearningLab;

use PDO;

/** One shared PDO connection with exceptions on, real prepared statements and associative rows. */
final class Db
{
    private static ?PDO $pdo = null;

    public static function connect(array $config): void
    {
        self::$pdo = new PDO($config['dsn'], $config['user'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
        self::$pdo->exec("SET time_zone = '+00:00'");
    }

    public static function pdo(): PDO
    {
        return self::$pdo ?? throw new \LogicException('Db::connect() was not called');
    }

    /** Run a query and return all rows. */
    public static function all(string $sql, array $args = []): array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($args);
        return $stmt->fetchAll();
    }

    /** Run a query and return the first row, or null. */
    public static function one(string $sql, array $args = []): ?array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($args);
        return $stmt->fetch() ?: null;
    }

    /** Run a statement and return the number of affected rows. */
    public static function run(string $sql, array $args = []): int
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($args);
        return $stmt->rowCount();
    }

    public static function lastId(): int
    {
        return (int) self::pdo()->lastInsertId();
    }

    /** @template T @param callable(): T $fn @return T */
    public static function transaction(callable $fn): mixed
    {
        $pdo = self::pdo();
        $pdo->beginTransaction();
        try {
            $result = $fn();
            $pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
