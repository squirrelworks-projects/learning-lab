# CLAUDE.md – Learning Lab

Training modules for Moodle: a player (`play.html`, embedded in an iframe), a teacher admin (`admin/`), exercise modules (`modules/<key>/`) and a PHP + MySQL API (`api/`). Vanilla JS (ES modules, no build step), MVC, UI built with atomic design. Hosted on simply.com. Run locally with `php -S localhost:8000 dev-router.php` (see the Deployment wiki page).

## The wiki is the source of truth

All documentation lives in the GitHub wiki: https://github.com/squirrelworks-projects/learning-lab/wiki
It is a separate git repo, cloned locally into `.wiki/` (gitignored).

| Wiki page | Documents |
|---|---|
| `Architecture.md` | How the parts fit together, embedding in Moodle, decisions |
| `Module-Contract.md` | What a module folder must contain; one section per installed module with its config format |
| `Components.md` | Every file in any `components/` folder (shared, player, admin, modules), by level |
| `Modules.md` | Every other `.js` file: core, models, views, controllers, entry points |
| `Database.md` | Every table and column in `database/schema.sql`, and schema changes |
| `API.md` | Every route in `api/routes.php` and every PHP file in `api/` |
| `Design-Tokens.md` | Every custom property in `shared/css/tokens.css` |
| `Deployment.md` | Local setup, config, simply.com |
| `Home.md`, `_Sidebar.md` | Page index and navigation. Add new pages or sections here. |

Do not create documentation in the code repo (no `docs/` folder). The README only covers running the app and links to the wiki.

## Workflow – every task that touches code

### 1. Before writing code: read the wiki
```bash
# first time
git clone https://github.com/squirrelworks-projects/learning-lab.wiki.git .wiki
# every task
git -C .wiki pull
```
- Read the pages that cover the area you're changing. Find existing components, models, handlers, routes, tokens and conventions, and **reuse them before creating anything new**. Look in `shared/` first.
- Pick a component's atomic level from the rules on `Components.md`. Pick colors, spacing and so on from `Design-Tokens.md`.
- If the wiki and the code disagree, point out the conflict to the user instead of silently picking one.

### 2. While writing code: follow the documented conventions
- Components are pure functions `props → HTMLElement`, built with `el()`. They never import models, controllers or `api.js`, and they report user actions through callback props.
- Each component file starts with a JSDoc header listing its props.
- CSS goes in the file for the component's level in its area (`shared/css/atoms.css`, `admin/css/organisms.css`, `modules/<key>/css/molecules.css`, …), with BEM classes and the level prefix (`.a-`, `.m-`, `.o-`, `.t-`), and **uses tokens only**. Add a new token to `shared/css/tokens.css` first.
- Models emit `'change'` and hold no DOM. Views render into a template's slots inside `preserveFocus()`. Controllers change the models and call the API.
- A component, model or helper used by more than one area (player, admin, modules) belongs in `shared/`.
- Modules follow `Module-Contract.md`: `manifest.json`, `schema.js`, `player.js`, `editor.js`. A module never touches platform code, and the platform never looks inside a module's config.
- **Never store student data** (GDPR). Students don't log in; modules only call `ctx.reportAttempt()`.
- PHP: every teacher route starts with `Auth::require($request)`; prepared statements only; validate input with `Validate`; errors as `HttpError`.
- Database: every table is prefixed `learninglab_` (the database is shared with other sites), and so are constraint names (`fk_learninglab_…`). Changes go in a new file `database/migrations/NNN-description.sql` plus the same change in `schema.sql`; the deploy runs `database/migrate.php`. Never edit a migration that has been deployed. Adding a module never needs a migration.

### 3. After writing code: update the wiki in the same task
Every new, changed, renamed or deleted component, JS file, module, table, column, route, PHP file, token or data format must be reflected in the wiki **before the task is done**:
- **New component:** a section under its area and level on `Components.md`: purpose, file path link, what it's built from, props table, classes, tokens, CSS file, accessibility notes and a usage snippet.
- **New or changed JS file:** its section on `Modules.md`: file path link, exports, members table, events it emits, what it listens to and uses.
- **New module or config change:** its section on `Module-Contract.md` (config format, schema version, what counts as an attempt).
- **Database / API:** `Database.md` (tables and columns), `API.md` (route with body and response, PHP files).
- **New or changed token:** `Design-Tokens.md`, including its value and where it's used.
- **Deleted or renamed:** remove or rename the section, and fix links in `Home.md` and `_Sidebar.md`.
- Links to source files use `https://github.com/squirrelworks-projects/learning-lab/blob/main/<path>`, with the path in backticks as the link text (the coverage check looks for it). Links between wiki pages use the page name, e.g. `[Modules](Modules#player)`.

Then run the coverage check. It must print nothing:
```bash
bash tools/check-wiki.sh
```
Commit and push the wiki:
```bash
git -C .wiki add -A && git -C .wiki commit -m "<what changed>" && git -C .wiki push
```
The wiki is published as soon as it's pushed, so pushing it is part of the task. Commit and push the **code** repo only when the user asks.

### 4. Git workflow
`main` is production: **every push to `main` that passes the checks is deployed to simply.com straight away** (`.github/workflows/check-and-deploy.yml`). So:
- Never commit directly to `main`. Work on a short branch from `main`: `feature/<what>`, `fix/<what>`, `docs/<what>` or `chore/<what>`.
- Commit messages follow Conventional Commits: `feat: …`, `fix: …`, `docs: …`, `refactor: …`, `test: …`, `chore: …`, `ci: …`. Imperative, ≤ 72 characters in the subject; the body explains why.
- One logical change per commit. Never commit `api/config.php`, `learning-lab.config.php`, uploaded images in `media/` or `REVISION` (all in `.gitignore`).
- Push the **wiki first**, then push the branch and open a pull request to `main` (the template has the checklist). The `check` job runs PHP/JS syntax checks, the import check, the wiki coverage check, the migrations and `tools/api-test.sh`. A red check blocks the merge.
- Merge with **squash and merge**, so `main` has one commit per pull request. Delete the branch afterwards.
- Commit and push only when the user asks. If git can't push from the session (no GitHub login), commit on the branch and tell the user the exact `git push` command.
- To roll back: revert the pull request's commit on GitHub (*Revert* button), which opens a new pull request; merging it deploys the old code. Database migrations are not undone automatically: write a new migration that reverses the change.

### 5. Test before saying it works
- API: run it locally (`php -S localhost:8000 dev-router.php` with a local database) and call the routes you changed. On an empty, migrated database, `bash tools/api-test.sh http://localhost:8000` must pass; add checks to it for new routes.
- UI: open the player and the admin in a browser and try the change, including keyboard use. Check the console for errors.
