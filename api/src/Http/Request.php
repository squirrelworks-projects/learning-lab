<?php
declare(strict_types=1);

namespace LearningLab\Http;

/** The current request: method, route path (relative to /api), query, JSON body and route params. */
final class Request
{
    public array $params = [];
    private ?array $body = null;

    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
    ) {}

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        // Strip the folder the API lives in (e.g. "/api" or "/learning-lab/api"), with or without "index.php".
        $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/api/index.php')), '/');
        if ($base !== '' && str_starts_with($uri, $base)) $uri = substr($uri, strlen($base));
        if (str_starts_with($uri, '/index.php')) $uri = substr($uri, strlen('/index.php'));
        $path = '/' . trim(rawurldecode($uri), '/');
        return new self($method, $path, $_GET);
    }

    /** The decoded JSON body. Throws 400 when it isn't a JSON object. */
    public function body(): array
    {
        if ($this->body !== null) return $this->body;
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '') return $this->body = [];
        $type = $_SERVER['CONTENT_TYPE'] ?? '';
        if (!str_contains($type, 'application/json')) {
            throw new HttpError(415, 'unsupported_media_type', 'Send the body as application/json.');
        }
        try {
            $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw HttpError::badRequest('The body is not valid JSON.');
        }
        if (!is_array($data) || array_is_list($data) && $data !== []) {
            throw HttpError::badRequest('The body must be a JSON object.');
        }
        return $this->body = $data;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body()[$key] ?? $default;
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$key] ?? null;
    }

    public function intParam(string $name): int
    {
        $value = $this->params[$name] ?? '';
        if (!ctype_digit($value)) throw HttpError::notFound();
        return (int) $value;
    }
}
