#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-}"
CONTRIBUTION_ID="${2:-}"

if [[ "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
  echo "Usage: $0 <preview|production> <contribution-id>" >&2
  exit 1
fi

if [[ -z "$CONTRIBUTION_ID" ]]; then
  echo "Usage: $0 <preview|production> <contribution-id>" >&2
  exit 1
fi

if [[ ! "$CONTRIBUTION_ID" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Contribution id must contain only letters, numbers, dot, underscore, or dash." >&2
  exit 1
fi

if [[ -z "${CROWDSHIP_BASE_URL:-}" ]]; then
  echo "Skipping Crowdship CI status report: CROWDSHIP_BASE_URL is not set."
  exit 0
fi

if [[ -z "${CROWDSHIP_CI_STATUS_TOKEN:-}" ]]; then
  echo "Skipping Crowdship CI status report: CROWDSHIP_CI_STATUS_TOKEN is not set."
  exit 0
fi

BUILD_STATUS="${BUILD_STATUS:-}"
BRANCH="${BRANCH:-}"
FAILED_PREVIEW_SESSIONS="${FAILED_PREVIEW_SESSIONS:-}"
GIT_SHA="${GIT_SHA:-}"
NEW_UNHANDLED_PREVIEW_ERRORS="${NEW_UNHANDLED_PREVIEW_ERRORS:-}"
PREVIEW_STATUS="${PREVIEW_STATUS:-}"
PREVIEW_URL="${PREVIEW_URL:-}"
PRODUCTION_STATUS="${PRODUCTION_STATUS:-}"
PRODUCTION_URL="${PRODUCTION_URL:-}"
PULL_REQUEST_NUMBER="${PULL_REQUEST_NUMBER:-}"
PULL_REQUEST_STATUS="${PULL_REQUEST_STATUS:-}"
PULL_REQUEST_URL="${PULL_REQUEST_URL:-}"
REPOSITORY_FULL_NAME="${REPOSITORY_FULL_NAME:-}"
RUN_ID="${RUN_ID:-}"
RUN_URL="${RUN_URL:-}"
SENTRY_ISSUES_URL="${SENTRY_ISSUES_URL:-}"
SENTRY_RELEASE="${SENTRY_RELEASE:-}"
UPDATED_AT="${UPDATED_AT:-}"

if [[ -z "$BUILD_STATUS" ]]; then
  echo "BUILD_STATUS is required." >&2
  exit 1
fi

STATUS_FIELD="previewStatus"
STATUS_VALUE="$PREVIEW_STATUS"

if [[ "$ENVIRONMENT" == "production" ]]; then
  STATUS_FIELD="productionStatus"
  STATUS_VALUE="$PRODUCTION_STATUS"
fi

if [[ -z "$STATUS_VALUE" ]]; then
  echo "${STATUS_FIELD} is required for ${ENVIRONMENT} callbacks." >&2
  exit 1
fi

payload="$(
  jq -n \
    --arg environment "$ENVIRONMENT" \
    --arg buildStatus "$BUILD_STATUS" \
    --arg statusField "$STATUS_FIELD" \
    --arg statusValue "$STATUS_VALUE" \
    --arg branch "$BRANCH" \
    --arg gitSha "$GIT_SHA" \
    --arg previewUrl "$PREVIEW_URL" \
    --arg productionUrl "$PRODUCTION_URL" \
    --arg pullRequestNumber "$PULL_REQUEST_NUMBER" \
    --arg pullRequestStatus "$PULL_REQUEST_STATUS" \
    --arg pullRequestUrl "$PULL_REQUEST_URL" \
    --arg repositoryFullName "$REPOSITORY_FULL_NAME" \
    --arg runId "$RUN_ID" \
    --arg runUrl "$RUN_URL" \
    --arg sentryIssuesUrl "$SENTRY_ISSUES_URL" \
    --arg sentryRelease "$SENTRY_RELEASE" \
    --arg updatedAt "$UPDATED_AT" \
    --arg newUnhandledPreviewErrors "$NEW_UNHANDLED_PREVIEW_ERRORS" \
    --arg failedPreviewSessions "$FAILED_PREVIEW_SESSIONS" \
    '
      def with_optional_string($key; $value):
        if $value == "" then . else . + {($key): $value} end;
      def with_optional_number($key; $value):
        if $value == "" then . else . + {($key): ($value | tonumber)} end;

      {
        environment: $environment,
        buildStatus: $buildStatus
      }
      | . + {($statusField): $statusValue}
      | with_optional_string("branch"; $branch)
      | with_optional_string("gitSha"; $gitSha)
      | with_optional_string("previewUrl"; $previewUrl)
      | with_optional_string("productionUrl"; $productionUrl)
      | with_optional_number("pullRequestNumber"; $pullRequestNumber)
      | with_optional_string("pullRequestStatus"; $pullRequestStatus)
      | with_optional_string("pullRequestUrl"; $pullRequestUrl)
      | with_optional_string("repositoryFullName"; $repositoryFullName)
      | with_optional_string("runId"; $runId)
      | with_optional_string("runUrl"; $runUrl)
      | with_optional_string("sentryIssuesUrl"; $sentryIssuesUrl)
      | with_optional_string("sentryRelease"; $sentryRelease)
      | with_optional_string("updatedAt"; $updatedAt)
      | with_optional_number("newUnhandledPreviewErrors"; $newUnhandledPreviewErrors)
      | with_optional_number("failedPreviewSessions"; $failedPreviewSessions)
    '
)"

endpoint="${CROWDSHIP_BASE_URL%/}/api/v1/contributions/${CONTRIBUTION_ID}/ci-status"

curl --fail --silent --show-error \
  --location \
  -X POST \
  -H "Authorization: Bearer ${CROWDSHIP_CI_STATUS_TOKEN}" \
  -H "x-crowdship-ci-token: ${CROWDSHIP_CI_STATUS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  "$endpoint" >/dev/null

echo "Reported ${ENVIRONMENT} CI status to Crowdship for contribution ${CONTRIBUTION_ID}."
