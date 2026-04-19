# Sentry

## Account

- Organization: `crowdship`
- Organization URL: `https://crowdship.sentry.io`
- Data storage location: European Union
- Hackathon promo credit: `$270` applied with code `CODEXHACK`
- Local CLI config is stored outside the repository on the deployment host.
- Auth tokens must stay outside the repository.

## Project

- Project: `example`
- Platform: JavaScript
- Public DSN:

```text
https://641f730f8951ce8333f9732e9a3125bd@o4511239953121280.ingest.de.sentry.io/4511239957774416
```

## Build Configuration

The browser bundle reads runtime reporting settings from Vite build variables:

- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`
- `VITE_SENTRY_RELEASE`
- `VITE_SENTRY_CONTRIBUTION_ID` for preview builds only
- `VITE_SENTRY_BRANCH` for preview builds only
- `VITE_SENTRY_PR_NUMBER` for preview builds only

The GitHub preview job injects these values during `npm run build:preview`, and the
production job injects the DSN, environment, and release during `npm run build`.

## CLI Check

```bash
sentry-cli projects list
```

## Product Role

Sentry helps the example app core team decide whether a Crowdship-generated branch is operationally safe to review and merge. It should provide merge-readiness evidence, not replace product or code review.

Use Sentry for:

- Example app frontend runtime errors.
- Preview branch errors.
- Production errors after merge.
- Release and source map tracking.
- Links from PRs and Crowdship admin screens to filtered issues.

Do not use Sentry for:

- User feedback.
- Voting.
- Product discussions.
- Storing prompts, attachments, source code, customer records, auth headers, cookies, or full API responses.

## Preview Tags

Every preview event should include safe tags:

```text
app=example
environment=preview
contribution_id=<id>
branch=<branch>
pr_number=<number>
release=example@<git-sha>
route=<safe-route>
```

Production events should use:

```text
environment=production
release=example@<git-sha>
```

## Merge-Readiness Evidence

For each Crowdship PR, the example app should expose an evidence block:

```text
Sentry:
- New unhandled preview errors: 0
- Existing known errors: 1 unrelated
- Failed preview sessions: 0
- Slow interactions: none detected
- Release: example@<git-sha>
- Last checked: <timestamp>

Merge signal:
Operationally clean. Awaiting code review and product approval.
```

This evidence can appear in:

- Crowdship admin dashboard.
- PR comment or check summary.
- Example app admin instructions.

Core maintainers still decide whether to merge.

## Privacy Boundary

Allowed event data:

- route
- app version
- release
- environment
- contribution id
- branch
- PR number
- non-sensitive browser and device metadata

Browser SDK safeguards in the example app:

- `sendDefaultPii: false`
- breadcrumbs dropped before send
- request, user, and extra payload fields stripped before send
- preview route normalized from `/previews/<contribution-id>/...` to the app route
- events limited to scripts served from the example app origin

Blocked event data:

- source code
- cookies
- auth headers
- API tokens
- private customer records
- full API responses
- request text and attachments
