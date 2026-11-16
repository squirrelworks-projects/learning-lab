<?php
/**
 * Local development without Apache:  php -S localhost:8000 dev-router.php
 * Sends /api/* to api/index.php (like api/.htaccess does) and serves everything else as static files.
 * Not used in production (blocked by the root .htaccess).
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

if (preg_match('#^/api(/|$)#', $path)) {
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    require __DIR__ . '/api/index.php';
    return true;
}

// Mirror the production rules that matter while developing.
if (preg_match('#^/(database|api/src|\.git|\.wiki)(/|$)|\.(md|sql)$#', $path)) {
    http_response_code(404);
    return true;
}
if (str_starts_with($path, '/media/') && !preg_match('#\.(png|jpe?g|gif|webp)$#i', $path)) {
    http_response_code(403);
    return true;
}
return false; // let the built-in server serve the static file
