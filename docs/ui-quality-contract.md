# UI Quality Contract

The example app must feel like a real external product that installs Crowdship, not like a toy demo built only to host a widget.

## External Product Rule

The app owns its product workflow. Crowdship owns contribution UI.

The example app should include real product context:

- a dashboard or reports workflow
- filters or controls with visible state
- a table or artifact users care about
- a concrete missing feature
- a single Crowdship widget entry point

The example app must not duplicate:

- Crowdship request chat
- spec approval
- agent progress
- voting
- admin intake

## No Simulation Rule

Do not show fake implementation progress, fake pull requests, fake preview links, or fake deployment state. The example app can expose a missing capability, but every integration state must be backed by the real Crowdship widget or a real preview artifact.

## Interaction Principles

- Widget launch must be visible but not intrusive.
- Users should understand what screen or object their contribution is about.
- Context passed to Crowdship must be safe and intentional.
- Long report names, table values, filters, and empty states must not break layout.
- Keyboard access is mandatory for product controls and widget launch.
- Admin-facing instructions must be plain enough that another app owner could repeat the integration.

## Visual Principles

- Build the usable app first, not a marketing homepage.
- Keep the product shell distinct from the Crowdship widget.
- Avoid decorative gradients, blobs, dark slate dashboards, beige themes, and nested cards.
- Use stable dimensions for tables, filters, empty states, and widget launcher.
- Use restrained accent color so the Crowdship entry point is findable without dominating the app.

## Required Checks

Before user-facing UI is considered done, run:

- Desktop screenshot at 1440x900
- Mobile screenshot at 390x844
- Keyboard path through filters and widget launch
- Long text stress case
- Empty table state
- Loading state
- Error state
- Secret scan of rendered HTML and console output

## CI And Local Enforcement

The repository enforces baseline quality with:

- `npm run quality`
- `npm test`
- `npm run lint`
- `.githooks/pre-commit`
- GitHub Actions quality workflow

Playwright visual checks will become mandatory as soon as the first real UI implementation lands.
