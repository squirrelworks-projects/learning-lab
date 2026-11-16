#!/usr/bin/env bash
# Deploy the working tree to the web server over SSH, then run the database migrations.
# Used by .github/workflows/check-and-deploy.yml; can also be run by hand from Linux/macOS/WSL:
#
#   SSH_USER=example.dk DEPLOY_PATH=/var/www/learninglab.example.dk/public_html \
#   SSH_KEY_FILE=~/.ssh/learninglab_deploy bash tools/deploy.sh
#
# Settings (environment variables):
#   SSH_USER      required  the FTP/SSH username from the simply.com control panel
#   DEPLOY_PATH   required  absolute path of the site root on the server (the subdomain's folder)
#   SSH_HOST      default ssh.simply.com
#   SSH_PORT      default 22
#   SSH_KEY_FILE  private key file (CI writes the SSH_PRIVATE_KEY secret to a file)
#   REMOTE_PHP    default php – the PHP command on the server
# Documented on the Deployment wiki page.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${SSH_USER:?Set SSH_USER}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH}"
SSH_HOST=${SSH_HOST:-ssh.simply.com}
SSH_PORT=${SSH_PORT:-22}
REMOTE_PHP=${REMOTE_PHP:-php}
REMOTE="$SSH_USER@$SSH_HOST"
SSH=(ssh -p "$SSH_PORT" -o BatchMode=yes)
[[ -n ${SSH_KEY_FILE:-} ]] && SSH+=(-i "$SSH_KEY_FILE")

# Record what is deployed (blocked from the web by .htaccess)
echo "$(git rev-parse --verify -q HEAD || echo unknown) $(date -u +%Y-%m-%dT%H:%M:%SZ)" > REVISION

echo "→ Uploading to $REMOTE:$DEPLOY_PATH"
"${SSH[@]}" "$REMOTE" "mkdir -p '$DEPLOY_PATH/media'"
rsync -rlz --delete --chmod=D755,F644 --filter="merge tools/deploy-filter.txt" \
  -e "${SSH[*]}" ./ "$REMOTE:$DEPLOY_PATH/"

echo "→ Running database migrations"
"${SSH[@]}" "$REMOTE" "cd '$DEPLOY_PATH' && $REMOTE_PHP database/migrate.php"

echo "✓ Deployed $(cut -d' ' -f1 REVISION)"
