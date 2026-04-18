# Implementation Plan

This plan defines the first durable implementation slice for the `example` reference app. The app should behave like a real external product that installs Crowdship, not as a temporary mock.

## Stack

- Vite.
- React.
- TypeScript.
- Static build deployable behind the existing nginx host.
- PWA foundations: manifest, icons, service worker registration.
- GitHub Actions quality checks.
- Sentry runtime instrumentation once the app runtime lands.

## Required References

Read before implementation:

- `docs/external-app-role.md`
- `docs/widget-install-contract.md`
- `docs/admin-setup.md`
- `docs/preview-cicd.md`
- `docs/sentry.md`
- `docs/ui-quality-contract.md`
- `.agents/skills/example-widget-integration/SKILL.md`
- `.agents/skills/example-widget-integration/references/external-app-ux.md`
- `.agents/skills/example-widget-integration/references/safe-context.md`

For the broader product loop, also read:

- `../crowdship/docs/product-brief.md`
- `../crowdship/docs/widget-contract.md`
- `../crowdship/docs/contribution-lifecycle.md`
- `../crowdship/docs/preview-cicd.md`

## Phase 1: Reports Product Shell

Goal: replace the placeholder with a usable mobile-first reports app.

Deliverables:

- Reports page with realistic metrics, filters, and table rows.
- Clear missing export workflow: users can see why "Export filtered reports as CSV" matters.
- Crowdship widget launcher placement reserved but not faked.
- Safe context object prepared for Crowdship.
- Mobile-first layout at 390x844.
- Desktop layout at 1440x900.

## Phase 2: PWA Foundations

Goal: make the app installable and ready for phone-first usage.

Deliverables:

- `manifest.webmanifest`.
- App icons.
- Service worker registration.
- App-safe routing.
- Installability metadata.
- Notification permission copy and entry point prepared, but no permission prompt until a user action exists.

## Phase 3: Widget Integration

Goal: load the real Crowdship widget from `crowdship.aizenshtat.eu` once the widget exists.

Deliverables:

- Script integration.
- Safe runtime context.
- No source code, tokens, cookies, private records, full API responses, or raw stack traces passed to Crowdship.
- Mobile launcher behavior verified.

## Phase 4: Preview CI/CD

Goal: support real Crowdship implementation branches.

Deliverables:

- Branch preview deploys under `/previews/<contribution-id>/`.
- GitHub Actions status.
- Preview smoke check.
- Sentry release `example@<git-sha>`.
- Source map upload when build output supports it.
- Merge-readiness evidence for the core team.

## Done Criteria

- No fake PRs, fake previews, fake deployment states, or fake implementation progress.
- `npm run quality`, `npm test`, and `npm run lint` pass.
- GitHub Actions passes.
- Mobile layout is comfortable.
- PWA foundation files exist once Phase 2 starts.
- Sentry privacy boundary is preserved.
