#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${APP_DOMAIN:-example.aizenshtat.eu}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_ROOT="${PREVIEW_ROOT:-/var/www/${APP_DOMAIN}/html/previews}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
SKIP_BUILD="${SKIP_BUILD:-0}"
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

if [[ "$SKIP_BUILD" != "1" ]]; then
  npm run build:preview
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory must exist before deploy: $BUILD_DIR" >&2
  exit 1
fi

TARGET="${PREVIEW_ROOT}/${CONTRIBUTION_ID}"

if [[ -n "$DEPLOY_HOST" ]]; then
  if [[ -z "$DEPLOY_USER" ]]; then
    echo "DEPLOY_USER must be set when DEPLOY_HOST is provided." >&2
    exit 1
  fi

  REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
  RSYNC_RSH="ssh -p ${DEPLOY_PORT}"

  ssh -p "$DEPLOY_PORT" "$REMOTE" "install -d -m 755 '$TARGET'"
  rsync -a --delete -e "$RSYNC_RSH" "${BUILD_DIR}/" "${REMOTE}:${TARGET}/"
  ssh -p "$DEPLOY_PORT" "$REMOTE" "find '$TARGET' -type d -exec chmod 755 {} \; && find '$TARGET' -type f -exec chmod 644 {} \;"
else
  install -d -m 755 "$TARGET"
  rsync -a --delete "${BUILD_DIR}/" "$TARGET/"
  find "$TARGET" -type d -exec chmod 755 {} \;
  find "$TARGET" -type f -exec chmod 644 {} \;
fi

echo "Published preview ${CONTRIBUTION_ID} to ${TARGET}"
