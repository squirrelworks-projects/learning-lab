# Learning Lab

Training modules for Moodle. Teachers log in to an admin, create assignments in a module (the first one is **Match Word**: drag technical terms onto a screenshot of a web page), rate them green/yellow/red/black, and group assignments into courses. Students open an assignment or a course through a link or an iframe in Moodle, without logging in and without any personal data being stored.

- Player: `play.html?a=<assignment>` or `play.html?c=<course>`
- Admin: `admin/`

Plain HTML, CSS and JavaScript ES modules (no build step) and a small PHP + MySQL API. Hosted on simply.com.

## Run locally

Needs PHP 8.1+ and MySQL or MariaDB.

1. Create an empty database.
2. Copy [`api/config.sample.php`](api/config.sample.php) to `api/config.php` and fill in the database details.
3. `php database/migrate.php` (creates the `learninglab_` tables)
4. `php -S localhost:8000 dev-router.php`
5. Open http://localhost:8000/admin/ and create the first administrator.

## Contributing and deploying

Work on a branch and open a pull request to `main`. GitHub Actions checks it (syntax, imports, wiki coverage, migrations, API tests). **Merging to `main` deploys to production on simply.com automatically.** The rules are in [`CLAUDE.md`](CLAUDE.md); setup and rollback are on the [Deployment](https://github.com/squirrelworks-projects/learning-lab/wiki/Deployment) wiki page.

## Documentation

Everything is documented in the [wiki](https://github.com/squirrelworks-projects/learning-lab/wiki):

- [Architecture](https://github.com/squirrelworks-projects/learning-lab/wiki/Architecture): how the parts fit together and how to embed in Moodle
- [Module contract](https://github.com/squirrelworks-projects/learning-lab/wiki/Module-Contract): how to build a new module
- [Database](https://github.com/squirrelworks-projects/learning-lab/wiki/Database) and [API](https://github.com/squirrelworks-projects/learning-lab/wiki/API)
- [Components](https://github.com/squirrelworks-projects/learning-lab/wiki/Components), [Modules](https://github.com/squirrelworks-projects/learning-lab/wiki/Modules) and [Design tokens](https://github.com/squirrelworks-projects/learning-lab/wiki/Design-Tokens)

Workflow rules for every change are in [`CLAUDE.md`](CLAUDE.md).
