# External App UX

## Product Shape

The example app should feel like a small mission-control product with enough motion and visual energy to hold a presentation room.

The canonical missing feature:

```text
Add anomaly replay for signal drops.
```

The page should include:

- anomaly watchlist
- craft and window filters
- visible current route/context
- a reason operators need replay
- animated spacecraft or relay visual asset tied to the current anomaly
- Crowdship widget launcher

Avoid a marketing homepage. The first screen should be the usable app.

## Mobile-First Product

The reference app must work well from a phone.

- Start layouts at 390x844 before desktop.
- Keep filters and mission actions touch-friendly.
- Replace desktop-only tables with stacked mobile rows or cards.
- Keep the Crowdship launcher visible without covering host-app actions.
- Use at least 44px touch targets.
- Avoid hover-only controls.
- Preserve route and filter context when the widget opens, a preview opens, or the user returns to the app.

## PWA Direction

The app should be prepared for installable PWA behavior:

- manifest and icons
- `display: standalone`
- service worker
- app-safe routing
- user-initiated notification permission
- badges for unresolved actions

On iOS/iPadOS, Web Push should be treated as a Home Screen web app capability and not requested until the user intentionally asks for notifications.

## UI Boundary

Crowdship contribution UI appears in the widget. The example app should not duplicate:

- request composer
- chat
- spec approval
- voting
- progress timeline
