<?php
declare(strict_types=1);

/**
 * Loads the config, registers the autoloader and turns every uncaught error into a JSON error response.
 * Documented in the wiki: API page → Bootstrap and config.
 */

namespace LearningLab;

use LearningLab\Http\HttpError;
use LearningLab\Http\Response;

/** The site root (the folder with play.html), as a real path. */
define('LearningLab\\ROOT_DIR', dirname(__DIR__, 2));

spl_autoload_register(function (string $class): void {
    if (!str_starts_with($class, 'LearningLab\\')) return;
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen('LearningLab\\'))) . '.php';
    if (is_file($file)) require $file;
});

/**
 * The config file is looked up in this order (the first one that exists wins):
 *  1. the path in the LEARNING_LAB_CONFIG environment variable
 *  2. learning-lab.config.php one folder ABOVE the site root (outside the web root – recommended on simply.com)
 *  3. api/config.php (blocked from the web by api/.htaccess)
 */
function loadConfig(): array
{
    $candidates = array_filter([
        getenv('LEARNING_LAB_CONFIG') ?: null,
        dirname(ROOT_DIR) . '/learning-lab.config.php',
        __DIR__ . '/../config.php',
    ]);
    foreach ($candidates as $file) {
        if (is_file($file)) {
            $config = require $file;
            return array_replace_recursive(defaultConfig(), $config);
        }
    }
    throw new HttpError(500, 'not_configured', 'No config file found. Copy api/config.sample.php (see the Deployment page in the wiki).');
}

function defaultConfig(): array
{
    return [
        'db' => ['dsn' => '', 'user' => '', 'password' => ''],
        'debug' => false,
        'session_name' => 'learninglab',
        'upload_max_bytes' => 5 * 1024 * 1024,
        'media_dir' => ROOT_DIR . '/media',
        'login_max_failures' => 5,
        'login_lock_minutes' => 15,
    ];
}

set_exception_handler(function (\Throwable $e): void {
    if ($e instanceof HttpError) {
        Response::error($e->status, $e->errorCode, $e->getMessage(), $e->details);
        return;
    }
    error_log((string) $e);
    $debug = $GLOBALS['LL_CONFIG']['debug'] ?? false;
    Response::error(500, 'server_error', $debug ? $e->getMessage() : 'Something went wrong on the server.');
});

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new \ErrorException($message, 0, $severity, $file, $line);
});
