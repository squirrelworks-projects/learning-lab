<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Modules;

/** The installed modules, read from /modules/<key>/manifest.json. */
final class ModuleController
{
    /** GET /modules */
    public static function list(Request $request): void
    {
        Auth::require($request);
        Response::json(['modules' => array_values(Modules::all())]);
    }
}
