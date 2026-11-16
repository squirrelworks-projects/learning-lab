#!/usr/bin/env bash
# Wiki coverage check. Run from the repo root: bash tools/check-wiki.sh
# Prints one line per thing that is missing from the wiki (.wiki/). Must print nothing before a task is done.
cd "$(dirname "$0")/.." || exit 1
W=.wiki
has() { grep -qF -- "$2" "$W/$1.md" || echo "$3"; }

# 1. Every UI component file is documented on Components (by its path)
for f in $(find shared player admin modules -path '*/components/*' -name '*.js' | sort); do
  has Components "\`$f\`" "undocumented component: $f"
done

# 2. Every other JavaScript file is documented on Modules (by its path)
for f in $(find shared player admin modules -name '*.js' -not -path '*/components/*' | sort); do
  has Modules "\`$f\`" "undocumented JS module: $f"
done

# 3. Every installed module has a section on Module-Contract
for m in modules/*/manifest.json; do
  key=$(basename "$(dirname "$m")")
  grep -q "^## $key\$" "$W/Module-Contract.md" || echo "module without a section on Module-Contract: $key"
done

# 4. Every token in tokens.css is on Design-Tokens, and every var(--x) used in CSS is defined
for t in $(grep -oE "^\s+--[a-z0-9-]+" shared/css/tokens.css | tr -d ' '); do
  has Design-Tokens "\`$t\`" "undocumented token: $t"
done
find shared player admin modules -name '*.css' -exec grep -ohE "var\(--[a-z0-9-]+" {} + | sed 's/var(//' | sort -u | while read -r v; do
  grep -q "^\s*$v:" shared/css/tokens.css || echo "undefined token: $v"
done

# 5. Every table and column in database/schema.sql is on Database
awk '/^CREATE TABLE/{t=$3} t && /^  [a-z_]+ /{print t, $1} /^\)/{t=""}' database/schema.sql | while read -r table col; do
  grep -q "^### $table\$" "$W/Database.md" || { echo "undocumented table: $table"; continue; }
  has Database "\`$col\`" "undocumented column: $table.$col"
done | sort -u

# 6. Every API route and PHP source file is on API
grep -oE "add\('[A-Z]+', '[^']+'" api/routes.php | sed -E "s/add\('([A-Z]+)', '([^']+)'/\1 \2/" | while read -r method path; do
  has API "\`$method $path\`" "undocumented route: $method $path"
done
for f in $(find api -name '*.php' | sort); do
  has API "\`$f\`" "undocumented PHP file: $f"
done
