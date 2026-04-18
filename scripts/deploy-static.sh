#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="example.aizenshtat.eu"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="/var/www/${APP_DOMAIN}/html"
BUILD_DIR="${REPO_ROOT}/dist"

cd "$REPO_ROOT"

npm run build

install -d -m 755 "$TARGET"
rsync -a --delete --exclude 'previews/' "${BUILD_DIR}/" "$TARGET/"

# Keep the application shell in place even if rsync skips a top-level file during deploy.
install -m 644 "${BUILD_DIR}/index.html" "${TARGET}/index.html"
install -m 644 "${BUILD_DIR}/sw.js" "${TARGET}/sw.js"
install -m 644 "${BUILD_DIR}/manifest.webmanifest" "${TARGET}/manifest.webmanifest"

find "$TARGET" -type d -exec chmod 755 {} \;
find "$TARGET" -type f -exec chmod 644 {} \;

echo "Published ${APP_DOMAIN} to ${TARGET}"
