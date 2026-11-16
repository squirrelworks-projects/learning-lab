<?php
declare(strict_types=1);

/** API front controller. Apache sends every /api/* request here (see api/.htaccess). */

namespace LearningLab;

use LearningLab\Http\Request;
use LearningLab\Http\Router;

require __DIR__ . '/src/bootstrap.php';

$config = loadConfig();
$GLOBALS['LL_CONFIG'] = $config;
Config::set($config);
Db::connect($config['db']);

$router = new Router();
(require __DIR__ . '/routes.php')($router);
$router->dispatch(Request::fromGlobals());
