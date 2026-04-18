# UI Quality Contract

The example app must feel like a real external product that installs Crowdship, not like a toy demo built only to host a widget.

## External Product Rule

The app owns its product workflow. Crowdship owns contribution UI.

The example app should include real product context:

- a mission-control telemetry workflow
- filters or controls with visible state
- a selected anomaly users care about
- a concrete missing feature
- a presentation-ready animated spacecraft/relay scene
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
- Long anomaly names, signal IDs, filters, and empty states must not break layout.
- Keyboard access is mandatory for product controls and widget launch.
- Admin-facing instructions must be plain enough that another app owner could repeat the integration.

## Mobile-First And PWA

The reference app should prove that Crowdship works inside a real mobile product, not only in a desktop dashboard.

Mobile-first requirements:

- Design the mission console workflow at 390x844 before expanding to desktop.
- Keep filters, anomaly rows, contribution controls, and the Crowdship widget reachable with one hand.
- Use stacked cards or compact rows on mobile instead of desktop-only tables.
- Keep the widget launcher visible without covering the app's primary actions.
- Use at least 44px touch targets for filters, table actions, widget launch, and preview links.
- Avoid hover-only controls.
- Keep long signal names, empty states, and filter summaries readable without horizontal scrolling.
- Preserve safe page context when the user opens the widget, switches tabs, opens a preview, or returns to the app.

PWA direction:

- The example app should be installable as a PWA with a manifest, icons, `display: standalone`, service worker, and app-safe routing.
- Home Screen install should make the app feel close to a native iPhone app without requiring an app store.
- Web Push should be reserved for meaningful product events, such as preview ready, request needs review, feature shipped, or admin action needed.
- On iOS/iPadOS, push requires the web app to be added to the Home Screen and permission must be requested from direct user interaction.
- Badge counts should reflect unresolved user/admin actions.
- Notification settings must avoid noisy product spam.

Do not make the example app dependent on desktop-only review workflows.

## Visual Principles

- Build the usable app first, not a marketing homepage.
- Keep the product shell distinct from the Crowdship widget.
- Prefer aerospace contrast, motion, and real product state over static dashboard panels.
- Use visual assets and purposeful animation for the mission scene, while respecting reduced-motion preferences.
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

Mobile/PWA checks:

- Mobile app flow at 390x844.
- Widget launch does not cover primary app actions.
- Filters and report rows are usable by touch.
- App returns correctly after opening a preview.
- Installable manifest and service worker once the PWA shell exists.
- Notification permission prompt triggered only by a user action.

## CI And Local Enforcement

The repository enforces baseline quality with:

- `npm run quality`
- `npm test`
- `npm run lint`
- `.githooks/pre-commit`
- GitHub Actions quality workflow

Playwright visual checks will become mandatory as soon as the first real UI implementation lands.

## Platform References

- WebKit: [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
- Apple Developer: [Sending web push notifications in web apps and browsers](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).
- MDN: [Installing Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).
