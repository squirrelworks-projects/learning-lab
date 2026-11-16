<?php
declare(strict_types=1);

namespace LearningLab;

use LearningLab\Http\HttpError;
use LearningLab\Http\Request;

/**
 * Teacher login with PHP sessions.
 *  - The session cookie is only created when a teacher logs in. Students never get a cookie.
 *  - Every request that changes data must send the CSRF token from /auth/me or /auth/login
 *    in the X-CSRF-Token header.
 *  - Failed logins are counted per account (no IP addresses are stored). After
 *    `login_max_failures` failures the account is locked for `login_lock_minutes`.
 */
final class Auth
{
    public const MIN_PASSWORD_LENGTH = 10;
    private static ?array $user = null;
    private static bool $loaded = false;

    public static function startSession(bool $create): bool
    {
        if (session_status() === PHP_SESSION_ACTIVE) return true;
        $name = Config::get('session_name');
        // Don't create a session (and a cookie) for anonymous visitors.
        if (!$create && empty($_COOKIE[$name])) return false;
        session_name($name);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        ini_set('session.use_strict_mode', '1');
        session_start();
        return true;
    }

    /** The logged-in teacher, or null. Reloaded from the database, so deactivated users are logged out at once. */
    public static function user(): ?array
    {
        if (self::$loaded) return self::$user;
        self::$loaded = true;
        if (!self::startSession(false) || empty($_SESSION['uid'])) return null;
        $user = Db::one('SELECT id, email, name, role, active FROM learninglab_users WHERE id = ?', [$_SESSION['uid']]);
        if (!$user || !$user['active']) {
            self::logout();
            return null;
        }
        return self::$user = $user;
    }

    /** Use in every teacher route. Checks the login and, for anything but GET, the CSRF token. */
    public static function require(Request $request, bool $admin = false): array
    {
        $user = self::user() ?? throw new HttpError(401, 'unauthenticated', 'Please log in.');
        if ($request->method !== 'GET') self::checkCsrf($request);
        if ($admin && $user['role'] !== 'admin') throw new HttpError(403, 'forbidden', 'Only administrators can do this.');
        return $user;
    }

    public static function checkCsrf(Request $request): void
    {
        $sent = $request->header('X-CSRF-Token') ?? '';
        $expected = $_SESSION['csrf'] ?? '';
        if ($expected === '' || !hash_equals($expected, $sent)) {
            throw new HttpError(403, 'csrf', 'The security token is missing or out of date. Reload the page.');
        }
    }

    public static function csrfToken(): string
    {
        return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    }

    public static function login(string $email, string $password): array
    {
        $row = Db::one('SELECT * FROM learninglab_users WHERE email = ?', [mb_strtolower(trim($email))]);
        $locked = $row && $row['locked_until'] && strtotime($row['locked_until'] . ' UTC') > time();
        if ($locked) {
            throw new HttpError(429, 'locked', 'Too many failed logins. Try again in a few minutes.');
        }
        // Verify against a dummy hash for unknown emails, so the response time doesn't reveal which emails exist.
        $hash = $row['password_hash'] ?? '$2y$10$DbLOKMWyXHxA4jPd6qOsiec8ugFpramf7gumZ71srtoJ.uKQIe8sO';
        $ok = password_verify($password, $hash) && $row && $row['active'];
        if (!$ok) {
            if ($row) self::registerFailure($row);
            throw new HttpError(401, 'invalid_login', 'Wrong email or password.');
        }
        if (password_needs_rehash($row['password_hash'], PASSWORD_DEFAULT)) {
            Db::run('UPDATE learninglab_users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $row['id']]);
        }
        Db::run('UPDATE learninglab_users SET failed_logins = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP() WHERE id = ?', [$row['id']]);
        self::signIn((int) $row['id']);
        return self::user();
    }

    public static function signIn(int $userId): void
    {
        self::startSession(true);
        session_regenerate_id(true);
        $_SESSION = ['uid' => $userId, 'csrf' => bin2hex(random_bytes(32))];
        self::$loaded = false;
    }

    public static function logout(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) return;
        $_SESSION = [];
        $params = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600] + array_intersect_key($params, array_flip(['path', 'domain', 'secure', 'httponly', 'samesite'])));
        session_destroy();
        self::$user = null;
    }

    public static function validatePassword(mixed $password): string
    {
        if (!is_string($password) || mb_strlen($password) < self::MIN_PASSWORD_LENGTH) {
            throw HttpError::badRequest('The password must be at least ' . self::MIN_PASSWORD_LENGTH . ' characters.', ['field' => 'password']);
        }
        return $password;
    }

    private static function registerFailure(array $row): void
    {
        $failures = (int) $row['failed_logins'] + 1;
        $lock = $failures >= Config::get('login_max_failures');
        Db::run(
            'UPDATE learninglab_users SET failed_logins = ?, locked_until = ' . ($lock ? 'UTC_TIMESTAMP() + INTERVAL ? MINUTE' : 'NULL') . ' WHERE id = ?',
            $lock ? [0, Config::get('login_lock_minutes'), $row['id']] : [$failures, $row['id']],
        );
    }

    private static function isHttps(): bool
    {
        return ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    }
}
