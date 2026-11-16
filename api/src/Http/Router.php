<?php
declare(strict_types=1);

namespace LearningLab\Http;

/**
 * Tiny router: `add('GET', '/assignments/{id}', $handler)`. `{name}` matches one path segment
 * and ends up in `$request->params['name']`. Every route must be documented on the API wiki page.
 */
final class Router
{
    /** @var array<int, array{string, string, string, callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{([a-zA-Z]+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        $this->routes[] = [$method, $pattern, $regex, $handler];
    }

    /** @return array<int, array{string, string}> method + pattern of every route (used by the wiki coverage check) */
    public function list(): array
    {
        return array_map(fn ($r) => [$r[0], $r[1]], $this->routes);
    }

    public function dispatch(Request $request): void
    {
        $allowed = [];
        foreach ($this->routes as [$method, , $regex, $handler]) {
            if (!preg_match($regex, $request->path, $m)) continue;
            if ($method !== $request->method) {
                $allowed[] = $method;
                continue;
            }
            $request->params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
            $handler($request);
            return;
        }
        if ($allowed) {
            header('Allow: ' . implode(', ', array_unique($allowed)));
            throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
        }
        throw HttpError::notFound('No such API route.');
    }
}
