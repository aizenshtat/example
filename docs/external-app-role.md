# External App Role

## Purpose

This repository represents a product owned by someone outside Crowdship. It exists to prove that the Crowdship widget can be embedded into a normal customer-facing app without exposing the app codebase to its users.

The example app is not the product being judged. It is the integration target that makes the Crowdship story concrete.

All integration behavior should be real. The example repo should receive real Crowdship-generated branches, real pull requests, real CI checks, real preview deployments, and real production deploys.

## Demo Product

The app should feel like a small SaaS product with real users and a few obvious missing workflows.

Suggested shape:

- A reports or dashboard page.
- A table with filters.
- A missing export workflow.
- A place where users naturally want to ask for improvements.

The canonical first feature is "Export filtered reports as CSV." This is narrow enough for an implementation agent but concrete enough for users to test.

## Future Widget Install

```html
<script
  async
  src="https://crowdship.aizenshtat.eu/widget/v1.js"
  data-crowdship-project="example"
  data-crowdship-environment="demo"
  data-crowdship-user-id="demo-user-123"
  data-crowdship-user-email="demo@example.com"
  data-crowdship-user-role="customer"
></script>
```

## Safe Context

The example app may pass this context to Crowdship:

```js
window.Crowdship.setContext({
  route: "/reports",
  appVersion: "2026.04.18",
  selectedObjectType: "report",
  selectedObjectId: "report-demo-7",
  activeFilters: {
    segment: "enterprise",
    period: "last-30-days"
  }
});
```

The example app must not pass:

- Source code.
- Auth tokens.
- Cookies.
- Internal API responses.
- Private customer records.

## Demo Request

The canonical demo request is:

```text
Export filtered reports as CSV.
```

The user submits this from the reports page. Crowdship receives the request with safe route and filter context, then turns it into structured product intent for the owner.

## Required Real Artifacts

For each accepted contribution, the example app must be able to show:

- Branch in `aizenshtat/example`.
- Pull request in `aizenshtat/example`.
- GitHub Actions status.
- Preview deployment under `/previews/<contribution-id>/`.
- Production deployment after merge.
