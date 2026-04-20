# Admin Setup

## Goal

Example app admins should be able to install Crowdship, configure intake, and understand what automation can do in their repository.

In the durable product model, the admin owns the repository and deployment pipeline. Crowdship should not require direct shell access to the app server or a checked-out copy of the repository on the Crowdship host.

## Install Widget

Add the widget script to the app shell:

```html
<script
  async
  src="https://crowdship.aizenshtat.eu/widget/v1.js"
  data-crowdship-project="example"
  data-crowdship-environment="production"
></script>
```

## Configure Project In Crowdship

Required settings:

- Project slug: `example`
- Allowed origin: `https://example.aizenshtat.eu`
- Repository: `aizenshtat/example`
- Implementation profile: optional for the demo `example` repo, `react_vite_app` for customer React/Vite repos
- Preview URL pattern: `https://example.aizenshtat.eu/previews/{contributionId}/`
- Production URL: `https://example.aizenshtat.eu/`

## Automation Settings

Admins choose:

- Whether approved specs automatically queue implementation.
- Which repo branch is the default base.
- Which implementation profile Crowdship is allowed to use for repo edits.
- Maximum implementation job runtime.
- Whether requester-approved previews can open voting automatically.
- Vote threshold for core team review.

## Repository Ownership Model

Preferred setup:

- Install the Crowdship widget in the app UI.
- Authorize repository automation through a scoped integration such as a GitHub App installation.
- Keep preview and production deploys in customer-controlled CI/CD.
- Store secrets in customer-controlled secret stores or GitHub Actions secrets.

Optional stricter setup:

- Run the implementation worker inside customer infrastructure instead of using hosted repository writes.

## Admin Responsibilities

- Review flagged feature candidates.
- Validate code and product fit before merge.
- Request fixes when needed.
- Merge PRs only after CI, preview checks, and Sentry evidence are acceptable.
- Keep repository and deployment secrets out of public docs.

## Merge-Readiness Evidence

For each Crowdship PR, admins should review:

- Approved spec and requester approval.
- Vote and comment summary.
- Branch, PR, CI run, and preview URL.
- Test and build status.
- Sentry release for the preview commit.
- New unhandled Sentry issues for the contribution.
- Known unrelated Sentry issues.
- Last operational check timestamp.

Sentry helps answer whether the preview introduced obvious runtime regressions. It does not replace code review, product review, or maintainer judgment.

## Contributor Boundary

Contributors can request, clarify, approve previews, vote, and comment. They cannot access the repository, credentials, CI secrets, or production deploy controls.
