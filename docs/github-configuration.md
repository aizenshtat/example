# GitHub Configuration

## Actions Secrets

Configured through `gh secret set`:

| Name | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API access if the example app needs integration AI calls. |
| `CROWDSHIP_CI_STATUS_TOKEN` | Shared token that authorizes preview and production CI status callbacks into Crowdship. |
| `DEPLOY_SSH_PRIVATE_KEY` | Private key used by GitHub-hosted runners to deploy preview and production bundles over SSH. |
| `SENTRY_AUTH_TOKEN` | Sentry CLI authentication for releases and source maps. |
| `SENTRY_DSN` | Project DSN for runtime error reporting. |

## Actions Variables

Configured through `gh variable set`:

| Name | Value |
| --- | --- |
| `APP_DOMAIN` | Public app domain, for example `example.aizenshtat.eu`. |
| `CROWDSHIP_BASE_URL` | Crowdship base URL used for `POST /api/v1/contributions/:id/ci-status`, for example `https://crowdship.aizenshtat.eu`. |
| `DEPLOY_HOST` | SSH host that receives preview and production deploys. |
| `DEPLOY_PORT` | SSH port for the deploy host, default `22`. |
| `DEPLOY_PREVIEW_ROOT` | Optional override for preview publish root. Defaults to `<deploy-root>/previews`. |
| `DEPLOY_SSH_KNOWN_HOSTS` | Optional pinned host keys for the deploy host. |
| `DEPLOY_USER` | SSH user used for preview and production deploys. |
| `DEPLOY_WEB_ROOT` | Optional override for the production publish root. Defaults to `/var/www/<app-domain>/html`. |
| `SENTRY_ORG` | `crowdship` |
| `SENTRY_PROJECT` | `example` |
| `SENTRY_URL` | `https://sentry.io/` |

## Workflow Behavior

The `Quality and Deploy` workflow always runs quality checks. It attempts preview deploys for Crowdship pull requests and production deploys for pushes to `main`.

When `CROWDSHIP_BASE_URL` and `CROWDSHIP_CI_STATUS_TOKEN` are present, the same
workflow also posts preview evidence and production publish status back to
Crowdship through the CI status callback endpoint.

If the deploy SSH contract is incomplete, the workflow stays readable instead of pretending the site was published:

- the quality job still passes or fails normally
- the preview or production job reports `configuration required`
- the PR comment or run summary tells maintainers which deploy variables or secrets are still missing

No secret values should be committed to the repository.
