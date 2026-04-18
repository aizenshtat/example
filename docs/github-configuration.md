# GitHub Configuration

## Actions Secrets

Configured through `gh secret set`:

| Name | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API access if the example app needs demo AI calls. |
| `SENTRY_AUTH_TOKEN` | Sentry CLI authentication for releases and source maps. |
| `SENTRY_DSN` | Project DSN for runtime error reporting. |

## Actions Variables

Configured through `gh variable set`:

| Name | Value |
| --- | --- |
| `SENTRY_ORG` | `crowdship` |
| `SENTRY_PROJECT` | `example` |
| `SENTRY_URL` | `https://sentry.io/` |

No secret values should be committed to the repository.
