#!/usr/bin/env bash
# API smoke test. Needs an EMPTY, migrated database and the API running, e.g.
#   php database/migrate.php && php -S 127.0.0.1:8000 dev-router.php &
#   bash tools/api-test.sh http://127.0.0.1:8000
# Used by the GitHub Actions checks. Needs curl and jq. Exits non-zero on the first failure.
set -euo pipefail
B="${1:-http://127.0.0.1:8000}/api"
JAR=$(mktemp); JAR2=$(mktemp); OUT=$(mktemp)
trap 'rm -f "$JAR" "$JAR2" "$OUT"' EXIT
PASS=0

# call METHOD PATH [JSON] [jar] [csrf] → prints the HTTP status, body in $OUT
call() {
  local method=$1 path=$2 body=${3:-} jar=${4:-$JAR} csrf=${5-${CSRF:-}}
  local args=(-s -o "$OUT" -w '%{http_code}' -X "$method" -b "$jar" -c "$jar" -H "X-CSRF-Token: $csrf")
  [[ -n $body ]] && args+=(-H 'Content-Type: application/json' --data "$body")
  curl "${args[@]}" "$B$path"
}
expect() { # expect STATUS DESCRIPTION [jq filter that must be true]
  local got=$1 want=$2 what=$3 filter=${4:-}
  if [[ $got != "$want" ]]; then echo "FAIL $what: HTTP $got, expected $want"; cat "$OUT"; echo; exit 1; fi
  if [[ -n $filter ]] && ! jq -e "$filter" "$OUT" >/dev/null; then echo "FAIL $what: $filter"; cat "$OUT"; echo; exit 1; fi
  PASS=$((PASS + 1)); echo "ok   $what"
}

expect "$(call GET /auth/me)" 200 'not logged in, setup needed' '.user == null and .setupNeeded == true'
expect "$(call POST /setup '{"name":"Admin","email":"admin@test.dk","password":"short"}')" 400 'setup rejects a short password'
expect "$(call POST /setup '{"name":"Admin","email":"Admin@Test.dk","password":"a-long-password"}')" 201 'setup creates the admin' '.user.role == "admin"'
CSRF=$(jq -r .csrf "$OUT")
expect "$(call POST /setup '{"name":"X","email":"x@test.dk","password":"a-long-password"}')" 409 'setup only works once'

expect "$(call GET /modules)" 200 'modules are listed' '.modules | map(.key) | index("match-word") != null'
expect "$(call POST /assignments '{"module":"match-word","title":"T","config":{}}' "$JAR" '')" 403 'CSRF token is required'
expect "$(call POST /assignments '{"module":"nope","title":"T","config":{}}')" 400 'unknown module is refused'
expect "$(call POST /assignments '{"module":"match-word","title":"T","difficulty":"purple","config":{}}')" 400 'unknown difficulty is refused'
expect "$(call POST /assignments '{"module":"match-word","title":"Test","difficulty":"yellow","schemaVersion":1,"config":{"subjects":[]}}')" 201 'assignment created' '.assignment.status == "draft" and .assignment.version == 1'
AID=$(jq -r .assignment.id "$OUT"); APID=$(jq -r .assignment.publicId "$OUT")

expect "$(curl -s -o "$OUT" -w '%{http_code}' "$B/public/assignments/$APID")" 404 'draft is hidden from students'
expect "$(call PUT "/assignments/$AID" '{"title":"Test","difficulty":"red","status":"published","schemaVersion":1,"config":{"subjects":[]},"version":1}')" 200 'assignment published' '.assignment.version == 2'
expect "$(call PUT "/assignments/$AID" '{"title":"Stale","config":{},"version":1}')" 409 'stale version gives a conflict' '.error.code == "conflict"'
HEADERS=$(curl -s -D - -o "$OUT" "$B/public/assignments/$APID")
grep -qi '^set-cookie' <<<"$HEADERS" && { echo 'FAIL public route sets a cookie'; exit 1; }
expect "$(curl -s -o "$OUT" -w '%{http_code}' "$B/public/assignments/$APID")" 200 'published assignment is public, without cookies' '.assignment.module == "match-word"'

expect "$(call POST /courses "{\"title\":\"Course\",\"status\":\"published\",\"items\":[$AID]}")" 201 'course created' '.course.itemCount == 1'
CID=$(jq -r .course.id "$OUT"); CPID=$(jq -r .course.publicId "$OUT")
expect "$(curl -s -o "$OUT" -w '%{http_code}' "$B/public/courses/$CPID")" 200 'course is public' '.course.items | length == 1'
expect "$(curl -s -o "$OUT" -w '%{http_code}' -X POST -H 'Content-Type: application/json' --data "{\"assignment\":\"$APID\",\"course\":\"$CPID\"}" "$B/public/attempts")" 204 'attempt counted'
expect "$(call GET "/courses/$CID")" 200 'attempt shows in the course' '.course.items[0].attempts == 1'
expect "$(call DELETE "/assignments/$AID")" 409 'assignment used in a course cannot be deleted' '.error.code == "in_use"'

expect "$(call POST /users '{"email":"t@test.dk","name":"Teacher","role":"teacher","password":"teacher-pass-1"}')" 201 'admin adds a teacher'
TID=$(jq -r .user.id "$OUT")
for i in 1 2 3 4 5; do call POST /auth/login '{"email":"t@test.dk","password":"wrong-password"}' "$JAR2" '' >/dev/null; done
expect "$(call POST /auth/login '{"email":"t@test.dk","password":"teacher-pass-1"}' "$JAR2" '')" 429 'account locks after 5 failures'
expect "$(call PUT "/users/$TID" '{"email":"t@test.dk","name":"Teacher","role":"teacher","active":true,"password":"teacher-pass-2"}')" 200 'admin resets the password'
expect "$(call POST /auth/login '{"email":"t@test.dk","password":"teacher-pass-2"}' "$JAR2" '')" 200 'teacher logs in after the reset'
TCSRF=$(jq -r .csrf "$OUT")
expect "$(call POST /users '{"email":"z@test.dk","name":"Z","password":"0123456789"}' "$JAR2" "$TCSRF")" 403 'teachers cannot add users'
expect "$(call PUT "/assignments/$AID" '{"title":"Edited by teacher","difficulty":"black","status":"published","schemaVersion":1,"config":{"subjects":[]},"version":2}' "$JAR2" "$TCSRF")" 200 'teachers can edit any assignment' '.assignment.updatedBy.name == "Teacher" and .assignment.author.name == "Admin"'

expect "$(call POST /auth/logout '' "$JAR2" "$TCSRF")" 204 'logout'
expect "$(call GET /assignments '' "$JAR2" '')" 401 'logged out user is refused'
expect "$(call GET /nope)" 404 'unknown route'

echo "All $PASS API checks passed."
