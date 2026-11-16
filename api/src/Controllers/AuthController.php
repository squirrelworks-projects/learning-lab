<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Validate;

/** Login, logout, the current user, changing your own profile, and first-time setup. */
final class AuthController
{
    /** GET /auth/me → { user, csrf } or { user: null, setupNeeded } */
    public static function me(Request $request): void
    {
        $user = Auth::user();
        if (!$user) {
            Response::json(['user' => null, 'setupNeeded' => self::setupNeeded()]);
            return;
        }
        Response::json(['user' => UserController::present($user), 'csrf' => Auth::csrfToken()]);
    }

    /** POST /auth/login { email, password } */
    public static function login(Request $request): void
    {
        $email = $request->input('email');
        $password = $request->input('password');
        if (!is_string($email) || !is_string($password)) throw HttpError::badRequest('Enter your email and password.');
        $user = Auth::login($email, $password);
        Response::json(['user' => UserController::present($user), 'csrf' => Auth::csrfToken()]);
    }

    /** POST /auth/logout */
    public static function logout(Request $request): void
    {
        if (Auth::user()) Auth::checkCsrf($request);
        Auth::logout();
        Response::noContent();
    }

    /** PUT /auth/me { name, email, currentPassword?, newPassword? } – update your own profile. */
    public static function updateMe(Request $request): void
    {
        $user = Auth::require($request);
        $data = $request->body();
        $name = Validate::text($data, 'name', 1, 120);
        $email = Validate::email($data);
        UserController::assertEmailFree($email, (int) $user['id']);
        Db::run('UPDATE learninglab_users SET name = ?, email = ? WHERE id = ?', [$name, $email, $user['id']]);

        if (!empty($data['newPassword'])) {
            $row = Db::one('SELECT password_hash FROM learninglab_users WHERE id = ?', [$user['id']]);
            if (!password_verify((string) ($data['currentPassword'] ?? ''), $row['password_hash'])) {
                throw HttpError::badRequest('Your current password is wrong.', ['field' => 'currentPassword']);
            }
            $hash = password_hash(Auth::validatePassword($data['newPassword']), PASSWORD_DEFAULT);
            Db::run('UPDATE learninglab_users SET password_hash = ? WHERE id = ?', [$hash, $user['id']]);
        }
        Response::json(['user' => UserController::present(UserController::find((int) $user['id']))]);
    }

    /** POST /setup { name, email, password } – creates the first administrator. Only works while there are no users. */
    public static function setup(Request $request): void
    {
        if (!self::setupNeeded()) throw new HttpError(409, 'already_set_up', 'Setup is already done. Log in instead.');
        $data = $request->body();
        $name = Validate::text($data, 'name', 1, 120);
        $email = Validate::email($data);
        $hash = password_hash(Auth::validatePassword($data['password'] ?? null), PASSWORD_DEFAULT);
        Db::run("INSERT INTO learninglab_users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')", [$email, $name, $hash]);
        Auth::signIn(\LearningLab\Db::lastId());
        Response::json(['user' => UserController::present(Auth::user()), 'csrf' => Auth::csrfToken()], 201);
    }

    private static function setupNeeded(): bool
    {
        return !Db::one('SELECT 1 FROM learninglab_users LIMIT 1');
    }
}
