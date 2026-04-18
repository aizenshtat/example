# Example

Infrastructure placeholder for example apps that can be used to validate Crowdship flows without using a private product codebase.

## Current State

This repository intentionally contains only bootstrap infrastructure:

- Static public placeholder at `public/`
- Nginx host template at `infra/nginx/`
- Local deploy helper at `scripts/deploy-static.sh`
- External app role at `docs/external-app-role.md`
- Widget install contract at `docs/widget-install-contract.md`
- Sentry project notes at `docs/sentry.md`
- GitHub Actions configuration at `docs/github-configuration.md`
- Smoke CI that validates the static placeholder and deployment files

Product implementation has not started yet.

## Public Domain

Production placeholder:

```text
https://example.aizenshtat.eu
```

## Local Host Deployment

On the server:

```bash
sudo ./scripts/deploy-static.sh
```

The script publishes `public/` to `/var/www/example.aizenshtat.eu/html`.
