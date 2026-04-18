# Example

Bootstrap infrastructure for a realistic external app that validates Crowdship flows without exposing a private product codebase.

## Current State

This repository intentionally contains only bootstrap infrastructure:

- Static public placeholder at `public/`
- Nginx host template at `infra/nginx/`
- Local deploy helper at `scripts/deploy-static.sh`
- External app role at `docs/external-app-role.md`
- Admin setup at `docs/admin-setup.md`
- Widget install contract at `docs/widget-install-contract.md`
- Preview CI/CD contract at `docs/preview-cicd.md`
- Sentry project notes at `docs/sentry.md`
- GitHub Actions configuration at `docs/github-configuration.md`
- Agent tooling at `docs/agent-tooling.md`
- UI quality contract at `docs/ui-quality-contract.md`
- Framework-neutral quality CI, tests, linting, and pre-commit guardrails

Product implementation has not started yet.

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

The script publishes `public/` to `/var/www/example.aizenshtat.eu/html`.
