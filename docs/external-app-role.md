# External App Role

## Purpose

This repository represents a product owned by someone outside Crowdship. It exists to prove that the Crowdship widget can be embedded into a normal customer-facing app without exposing the app codebase to its users.

The example app is the first reference integration target. It should be useful for presentation walkthroughs and durable enough to keep evolving as Crowdship grows.

All integration behavior should be real. The example repo should receive real Crowdship-generated branches, real pull requests, real CI checks, real preview deployments, and real production deploys.

For the hackathon reference setup, the same operator currently owns both Crowdship and this example app. That is only a convenient reference deployment. The intended product model is that a customer owns their UI, repository, CI/CD, and deploy rules while Crowdship remains an external service they install into their app.

## Reference Product

The app should feel like a high-energy mission-control telemetry product an operations team could actually use.

Current shape:

- A live animated telemetry console for launch and operations teams.
- A focused list of signals with mission and severity filters.
- A selected anomaly users care about.
- A concrete missing workflow that invites useful product suggestions.
- A visual spacecraft/relay scene that makes the product memorable during presentations.

Pressure replay for signal drops is already part of the product shell. The canonical first missing feature is now "Add relay-shadow markers to signal-drop replay." This stays narrow enough for an implementation agent while giving operators a concrete mission-control gap to validate.

## Future Widget Install

```html
<script
  async
  src="https://crowdship.aizenshtat.eu/widget/v1.js"
  data-crowdship-project="example"
  data-crowdship-environment="production"
  data-crowdship-launcher="manual"
  data-crowdship-user-id="customer-123"
  data-crowdship-user-email="customer@example.com"
  data-crowdship-user-role="customer"
></script>
```

## Safe Context

The example app may pass this context to Crowdship:

```js
window.Crowdship.setContext({
  route: "/mission",
  appVersion: "2026.04.18",
  selectedObjectType: "anomaly",
  selectedObjectId: "signal-drop-17",
  activeFilters: {
    craft: "all",
    window: "last-30"
  }
});
```

The example app must not pass:

- Source code.
- Auth tokens.
- Cookies.
- Internal API responses.
- Private customer records.

In the durable customer-owned model, the example app analogue should only need to:

- install the widget snippet,
- pass safe runtime context,
- authorize repository automation through an owner-controlled integration,
- keep previews and production deploys inside customer CI/CD.

## Seed Request

The canonical first request is:

```text
Add relay-shadow markers to signal-drop replay.
```

The user submits this from the mission view. Pressure replay is already present, so Crowdship receives the request with safe route, selected anomaly, and filter context and turns the next missing layer of anomaly context into structured product intent for the owner.

## Required Real Artifacts

For each accepted contribution, the example app must be able to show:

- Branch in `aizenshtat/example`.
- Pull request in `aizenshtat/example`.
- GitHub Actions status.
- Preview deployment under `/previews/<contribution-id>/`.
- Sentry release and filtered issue status for the preview.
- Production deployment after merge.
