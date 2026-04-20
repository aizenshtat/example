# Example

Bootstrap infrastructure for a realistic external app that validates Crowdship flows without exposing a private product codebase.

## Current State

This repository now contains the first reference app slice:

- Vite/React/TypeScript Orbital Ops app at `src/`
- PWA manifest, icons, and service worker in `public/`
- Nginx host template at `infra/nginx/`
- Local deploy helper at `scripts/deploy-static.sh`
- Preview deploy helper at `scripts/deploy-preview.sh`
- Crowdship CI status callback helper at `scripts/report-ci-status.sh`
- External app role at `docs/external-app-role.md`
- Implementation plan at `docs/implementation-plan.md`
- Admin setup at `docs/admin-setup.md`
- Widget install contract at `docs/widget-install-contract.md`
- Preview CI/CD contract at `docs/preview-cicd.md`
- Sentry project notes at `docs/sentry.md`
- GitHub Actions configuration at `docs/github-configuration.md`
- Agent tooling at `docs/agent-tooling.md`
- UI quality contract at `docs/ui-quality-contract.md`
- Quality CI, tests, typechecking, build checks, linting, and pre-commit guardrails

The current product slice is a mobile-first mission-control workflow with safe Crowdship context prepared for the widget.

## Quality Checks

```bash
npm run quality
npm test
npm run lint
```

Install local hooks:

```bash
git config core.hooksPath .githooks
```

## Public Domain

Production bootstrap page:

```text
https://example.aizenshtat.eu
```

## Local Host Deployment

On the server:

```bash
sudo ./scripts/deploy-static.sh
```

The script builds the app and publishes `dist/` to `/var/www/example.aizenshtat.eu/html`.

Preview deployments publish `dist/` to `/var/www/example.aizenshtat.eu/html/previews/<contribution-id>/`.
To build from a worktree or alternate checkout, pass the source repo path as the second argument:

```bash
sudo ./scripts/deploy-preview.sh <contribution-id> /path/to/source-repo
```

When GitHub Actions has `CROWDSHIP_BASE_URL` and `CROWDSHIP_CI_STATUS_TOKEN`,
preview evidence and production publish status are also reported back to
Crowdship through `POST /api/v1/contributions/<id>/ci-status`.
