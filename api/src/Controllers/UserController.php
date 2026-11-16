<?php
declare(strict_types=1);

namespace LearningLab\Controllers;

use LearningLab\Auth;
use LearningLab\Db;
use LearningLab\Http\HttpError;
use LearningLab\Http\Request;
use LearningLab\Http\Response;
use LearningLab\Validate;

/** Teacher accounts. Listing names is open to all teachers (for the author filter); changes are admin-only. */
final class UserController
{
    /** GET /users */
    public static function list(Request $request): void
    {
        $user = Auth::require($request);
        $columns = $user['role'] === 'admin' ? 'id, email, name, role, active, created_at, last_login_at' : 'id, name, role, active';
        $rows = Db::all("SELECT $columns FROM learninglab_users ORDER BY name");
        Response::json(['users' => array_map([self::class, 'present'], $rows)]);
    }

    /** POST /users { email, name, role, password } (admin) */
    public static function create(Request $request): void
    {
        Auth::require($request, admin: true);
        $data = $request->body();
        $email = Validate::email($data);
        $name = Validate::text($data, 'name', 1, 120);
        $role = Validate::oneOf($data, 'role', ['teacher', 'admin'], 'teacher');
        $hash = password_hash(Auth::validatePassword($data['password'] ?? null), PASSWORD_DEFAULT);
        self::assertEmailFree($email);
        Db::run('INSERT INTO learninglab_users (email, name, password_hash, role) VALUES (?, ?, ?, ?)', [$email, $name, $hash, $role]);
        Response::json(['user' => self::present(self::find(Db::lastId()))], 201);
    }

    /** PUT /users/{id} { email, name, role, active, password? } (admin) */
    public static function update(Request $request): void
    {
        $me = Auth::require($request, admin: true);
        $id = $request->intParam('id');
        self::find($id) ?? throw HttpError::notFound('User not found.');
        $data = $request->body();
        $email = Validate::email($data);
        $name = Validate::text($data, 'name', 1, 120);
        $role = Validate::oneOf($data, 'role', ['teacher', 'admin']);
        $active = (bool) ($data['active'] ?? true);
        if ($id === (int) $me['id'] && ($role !== 'admin' || !$active)) {
            throw HttpError::badRequest('You can’t remove your own admin role or deactivate yourself.', ['field' => 'role']);
        }
        self::assertEmailFree($email, $id);
        Db::run('UPDATE learninglab_users SET email = ?, name = ?, role = ?, active = ? WHERE id = ?', [$email, $name, $role, (int) $active, $id]);
        if (!empty($data['password'])) {
            $hash = password_hash(Auth::validatePassword($data['password']), PASSWORD_DEFAULT);
            Db::run('UPDATE learninglab_users SET password_hash = ?, failed_logins = 0, locked_until = NULL WHERE id = ?', [$hash, $id]);
        }
        Response::json(['user' => self::present(self::find($id))]);
    }

    public static function find(int $id): ?array
    {
        return Db::one('SELECT id, email, name, role, active, created_at, last_login_at FROM learninglab_users WHERE id = ?', [$id]);
    }

    public static function assertEmailFree(string $email, int $exceptId = 0): void
    {
        if (Db::one('SELECT 1 FROM learninglab_users WHERE email = ? AND id <> ?', [$email, $exceptId])) {
            throw HttpError::badRequest('A user with that email already exists.', ['field' => 'email']);
        }
    }

    public static function present(array $row): array
    {
        $out = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'role' => $row['role'],
            'active' => (bool) $row['active'],
        ];
        if (array_key_exists('email', $row)) $out['email'] = $row['email'];
        if (array_key_exists('created_at', $row)) $out['createdAt'] = Format::date($row['created_at']);
        if (array_key_exists('last_login_at', $row)) $out['lastLoginAt'] = Format::date($row['last_login_at']);
        return $out;
    }
}
