<?php
/**
 * Learning Lab config. Copy this file to ONE of these places and fill it in:
 *   - production: learning-lab.config.php in the folder ABOVE the site root (outside the web root;
 *     the automatic deploy never uploads or deletes it)
 *   - local development: api/config.php (ignored by git, never deployed, unreachable from the web)
 * See the Deployment page in the wiki.
 */
return [
    'db' => [
        // simply.com: the host, database name and user are in the control panel under Databases.
        // The database may be shared with other sites: all Learning Lab tables are prefixed learninglab_.
        'dsn' => 'mysql:host=mysqlXX.unoeuro.com;dbname=example_dk_db;charset=utf8mb4',
        'user' => 'example_dk',
        'password' => 'change-me',
    ],
    // true shows PHP error messages in API responses. Never true in production.
    'debug' => false,
    'session_name' => 'learninglab',
    'upload_max_bytes' => 5 * 1024 * 1024,
    // Uploaded images are saved in the "media" folder in the site root (served from there). Only change for tests.
    'login_max_failures' => 5,
    'login_lock_minutes' => 15,
];
