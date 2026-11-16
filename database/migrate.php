<?php
declare(strict_types=1);

/**
 * Database migrations. Run from the command line (the deploy does this over SSH after every upload):
 *
 *   php database/migrate.php            apply what is missing
 *   php database/migrate.php --status   only show what is applied and what is pending
 *
 * - First run on an empty database: runs schema.sql, then marks every existing migration as applied
 *   (schema.sql already contains them).
 * - Later runs: applies each new database/migrations/NNN-description.sql once, in name order, and records it
 *   in learninglab_schema_migrations.
 * Uses the same config file as the API. Documented on the Database wiki page.
 */

namespace LearningLab;

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../api/src/bootstrap.php';
restore_exception_handler();

const MIGRATIONS_TABLE = 'learninglab_schema_migrations';

$statusOnly = in_array('--status', $argv, true);

try {
    $config = loadConfig();
} catch (\Throwable $e) {
    fwrite(STDERR, 'Config error: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}
Config::set($config);
Db::connect($config['db']);
$pdo = Db::pdo();

$files = glob(__DIR__ . '/migrations/*.sql') ?: [];
sort($files, SORT_STRING);
$names = array_map('basename', $files);

$installed = (bool) Db::one("SHOW TABLES LIKE 'learninglab_users'");

if (!$installed) {
    if ($statusOnly) {
        echo "Database is empty: schema.sql and " . count($names) . " migration(s) would be installed.\n";
        exit(0);
    }
    echo "Empty database: installing schema.sql\n";
    runSqlFile($pdo, __DIR__ . '/schema.sql');
    ensureMigrationsTable($pdo);
    foreach ($names as $name) markApplied($name); // schema.sql already includes them
    echo 'Done. Marked ' . count($names) . " existing migration(s) as applied.\n";
    exit(0);
}

ensureMigrationsTable($pdo);
$applied = array_column(Db::all('SELECT name FROM ' . MIGRATIONS_TABLE), 'name');
$pending = array_values(array_diff($names, $applied));

if ($statusOnly) {
    echo 'Applied: ' . count($applied) . "\n";
    echo $pending ? 'Pending: ' . implode(', ', $pending) . "\n" : "Pending: none\n";
    exit(0);
}

if (!$pending) {
    echo "Database is up to date.\n";
    exit(0);
}

foreach ($pending as $name) {
    echo "Applying $name … ";
    try {
        runSqlFile($pdo, __DIR__ . "/migrations/$name");
    } catch (\Throwable $e) {
        // MySQL commits DDL statements at once, so a half-applied migration can't be rolled back automatically.
        echo "FAILED\n";
        fwrite(STDERR, $e->getMessage() . PHP_EOL . "Fix the database by hand, then run migrate.php again.\n");
        exit(1);
    }
    markApplied($name);
    echo "ok\n";
}
echo 'Applied ' . count($pending) . " migration(s).\n";

/** Run every statement in a .sql file. Statements end with ";" at the end of a line; "-- " comments are skipped. */
function runSqlFile(\PDO $pdo, string $file): void
{
    $sql = preg_replace('/^\s*--.*$/m', '', (string) file_get_contents($file));
    foreach (preg_split('/;\s*$/m', $sql) as $statement) {
        if (trim($statement) !== '') $pdo->exec($statement);
    }
}

function ensureMigrationsTable(\PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS ' . MIGRATIONS_TABLE . ' (
        name        VARCHAR(190) NOT NULL,
        applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
}

function markApplied(string $name): void
{
    Db::run('INSERT IGNORE INTO ' . MIGRATIONS_TABLE . ' (name) VALUES (?)', [$name]);
}
