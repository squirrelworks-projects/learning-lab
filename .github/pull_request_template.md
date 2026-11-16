## What and why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] Tested locally (`php -S localhost:8000 dev-router.php`): the changed pages work in the browser, and with the keyboard
- [ ] `bash tools/api-test.sh` passes against an empty, migrated database (if the API or database changed)
- [ ] Database change? A new `database/migrations/NNN-description.sql` **and** the same change in `schema.sql`
- [ ] Wiki updated and **pushed** (`bash tools/check-wiki.sh` prints nothing) – the check job fails otherwise
- [ ] No passwords, `api/config.php` or uploaded images in the diff

Merging to `main` deploys to production straight away.
