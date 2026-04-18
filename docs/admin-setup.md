# Admin Setup

## Goal

Example app admins should be able to install Crowdship, configure intake, and understand what automation can do in their repository.

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
- Preview URL pattern: `https://example.aizenshtat.eu/previews/{contributionId}/`
- Production URL: `https://example.aizenshtat.eu/`

## Automation Settings

Admins choose:

- Whether approved specs automatically queue implementation.
- Which repo branch is the default base.
- Maximum implementation job runtime.
- Whether requester-approved previews can open voting automatically.
- Vote threshold for core team review.

## Admin Responsibilities

- Review flagged feature candidates.
- Validate code and product fit before merge.
- Request fixes when needed.
- Merge PRs only after CI and preview checks pass.
- Keep repository and deployment secrets out of public docs.

## Contributor Boundary

Contributors can request, clarify, approve previews, vote, and comment. They cannot access the repository, credentials, CI secrets, or production deploy controls.
