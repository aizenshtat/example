#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${APP_DOMAIN:-example.aizenshtat.eu}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/${APP_DOMAIN}/html}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
SKIP_BUILD="${SKIP_BUILD:-0}"
BUILD_DIR="${REPO_ROOT}/dist"

cd "$REPO_ROOT"

if [[ "$SKIP_BUILD" != "1" ]]; then
  npm run build
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory must exist before deploy: $BUILD_DIR" >&2
  exit 1
fi

if [[ -n "$DEPLOY_HOST" ]]; then
  if [[ -z "$DEPLOY_USER" ]]; then
    echo "DEPLOY_USER must be set when DEPLOY_HOST is provided." >&2
    exit 1
  fi

  REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
  RSYNC_RSH="ssh -p ${DEPLOY_PORT}"

  ssh -p "$DEPLOY_PORT" "$REMOTE" "install -d -m 755 '$DEPLOY_ROOT'"
  rsync -a --delete --exclude 'previews/' -e "$RSYNC_RSH" "${BUILD_DIR}/" "${REMOTE}:${DEPLOY_ROOT}/"

  # Keep the application shell in place even if rsync skips a top-level file during deploy.
  rsync -a -e "$RSYNC_RSH" "${BUILD_DIR}/index.html" "${REMOTE}:${DEPLOY_ROOT}/index.html"
  rsync -a -e "$RSYNC_RSH" "${BUILD_DIR}/sw.js" "${REMOTE}:${DEPLOY_ROOT}/sw.js"
  rsync -a -e "$RSYNC_RSH" "${BUILD_DIR}/manifest.webmanifest" "${REMOTE}:${DEPLOY_ROOT}/manifest.webmanifest"

  ssh -p "$DEPLOY_PORT" "$REMOTE" "find '$DEPLOY_ROOT' -type d -exec chmod 755 {} \; && find '$DEPLOY_ROOT' -type f -exec chmod 644 {} \;"
else
  install -d -m 755 "$DEPLOY_ROOT"
  rsync -a --delete --exclude 'previews/' "${BUILD_DIR}/" "$DEPLOY_ROOT/"

  # Keep the application shell in place even if rsync skips a top-level file during deploy.
  install -m 644 "${BUILD_DIR}/index.html" "${DEPLOY_ROOT}/index.html"
  install -m 644 "${BUILD_DIR}/sw.js" "${DEPLOY_ROOT}/sw.js"
  install -m 644 "${BUILD_DIR}/manifest.webmanifest" "${DEPLOY_ROOT}/manifest.webmanifest"

  find "$DEPLOY_ROOT" -type d -exec chmod 755 {} \;
  find "$DEPLOY_ROOT" -type f -exec chmod 644 {} \;
fi

echo "Published ${APP_DOMAIN} to ${DEPLOY_ROOT}"
