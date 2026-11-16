<?php
declare(strict_types=1);

/**
 * Every API route. Each one must have a section on the API wiki page (the coverage check reads this file).
 * Paths are relative to /api.
 */

use LearningLab\Controllers\AssignmentController as A;
use LearningLab\Controllers\AuthController as Auth;
use LearningLab\Controllers\CourseController as C;
use LearningLab\Controllers\MediaController as M;
use LearningLab\Controllers\ModuleController as Mod;
use LearningLab\Controllers\PublicController as P;
use LearningLab\Controllers\UserController as U;
use LearningLab\Http\Router;

return function (Router $r): void {
    // Public – used by the player, no login
    $r->add('GET', '/public/assignments/{publicId}', [P::class, 'assignment']);
    $r->add('GET', '/public/courses/{publicId}', [P::class, 'course']);
    $r->add('POST', '/public/attempts', [P::class, 'attempt']);

    // Login
    $r->add('GET', '/auth/me', [Auth::class, 'me']);
    $r->add('PUT', '/auth/me', [Auth::class, 'updateMe']);
    $r->add('POST', '/auth/login', [Auth::class, 'login']);
    $r->add('POST', '/auth/logout', [Auth::class, 'logout']);
    $r->add('POST', '/setup', [Auth::class, 'setup']);

    // Teachers
    $r->add('GET', '/modules', [Mod::class, 'list']);

    $r->add('GET', '/assignments', [A::class, 'list']);
    $r->add('POST', '/assignments', [A::class, 'create']);
    $r->add('GET', '/assignments/{id}', [A::class, 'get']);
    $r->add('PUT', '/assignments/{id}', [A::class, 'update']);
    $r->add('DELETE', '/assignments/{id}', [A::class, 'delete']);
    $r->add('POST', '/assignments/{id}/duplicate', [A::class, 'duplicate']);

    $r->add('GET', '/courses', [C::class, 'list']);
    $r->add('POST', '/courses', [C::class, 'create']);
    $r->add('GET', '/courses/{id}', [C::class, 'get']);
    $r->add('PUT', '/courses/{id}', [C::class, 'update']);
    $r->add('DELETE', '/courses/{id}', [C::class, 'delete']);

    $r->add('GET', '/media', [M::class, 'list']);
    $r->add('POST', '/media', [M::class, 'upload']);
    $r->add('DELETE', '/media/{id}', [M::class, 'delete']);

    // Users (list: all teachers; changes: admins)
    $r->add('GET', '/users', [U::class, 'list']);
    $r->add('POST', '/users', [U::class, 'create']);
    $r->add('PUT', '/users/{id}', [U::class, 'update']);
};
