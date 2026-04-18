#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="example.aizenshtat.eu"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_ROOT="/var/www/${APP_DOMAIN}/html/previews"
CONTRIBUTION_ID="${1:-${PREVIEW_CONTRIBUTION_ID:-}}"
SOURCE_REPO_PATH="${2:-${PREVIEW_SOURCE_REPO_PATH:-$REPO_ROOT}}"
SOURCE_REPO_ROOT=""

if [[ -z "$CONTRIBUTION_ID" ]]; then
  echo "Usage: $0 <contribution-id> [source-repo-path]" >&2
  exit 1
fi

if [[ ! "$CONTRIBUTION_ID" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Contribution id must contain only letters, numbers, dot, underscore, or dash." >&2
  exit 1
fi

if [[ ! -d "$SOURCE_REPO_PATH" ]]; then
  echo "Source repo path must be an existing directory: $SOURCE_REPO_PATH" >&2
  exit 1
fi

SOURCE_REPO_ROOT="$(cd "$SOURCE_REPO_PATH" && pwd)"
BUILD_DIR="${SOURCE_REPO_ROOT}/dist"

if [[ ! -f "${SOURCE_REPO_ROOT}/package.json" ]]; then
  echo "Source repo path must contain package.json: $SOURCE_REPO_ROOT" >&2
  exit 1
fi

cd "$SOURCE_REPO_ROOT"

npm run build:preview

TARGET="${PREVIEW_ROOT}/${CONTRIBUTION_ID}"

install -d -m 755 "$TARGET"
rsync -a --delete "${BUILD_DIR}/" "$TARGET/"
find "$TARGET" -type d -exec chmod 755 {} \;
find "$TARGET" -type f -exec chmod 644 {} \;

echo "Published preview ${CONTRIBUTION_ID} to ${TARGET}"
