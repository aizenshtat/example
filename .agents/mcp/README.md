# MCP And Tooling

## Used In This Project

| Tool | Purpose |
| --- | --- |
| GitHub CLI / GitHub connector | Branches, PRs, secrets, variables, CI status. |
| Playwright MCP | Visual checks for example app and embedded widget. |
| Sentry CLI | Future releases and source maps. |
| OpenAI API | Used by Crowdship workers when implementing approved example-app specs. |

## Rules

- Do not commit credentials, cookies, API keys, or tokens.
- Use GitHub Actions secrets for CI credentials.
- Use GitHub Actions variables for non-secret provider identifiers.
- The example app should not store Crowdship owner credentials.

## Expected GitHub Secrets

- `OPENAI_API_KEY`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_DSN`

## Expected GitHub Variables

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_URL`
