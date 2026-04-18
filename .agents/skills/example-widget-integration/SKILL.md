---
name: example-widget-integration
description: Use when designing or implementing the example app as Crowdship's external app integration target. Ensures the app feels like a real customer-owned product, embeds the widget correctly, passes only safe context, and supports real preview CI/CD.
---

# Example Widget Integration

## Purpose

The example app demonstrates how a normal external product installs Crowdship. It should not feel like a toy landing page.

## Mandatory Reads

- `references/external-app-ux.md` for the demo product experience.
- `references/safe-context.md` for widget context rules.
- `references/preview-cicd.md` before touching branch/preview deployment behavior.

## Rules

- The app owns product UI; Crowdship owns contribution UI.
- Do not implement chat, voting, or agent progress inside the example app.
- Embed the Crowdship widget once at the app shell level.
- Pass only safe context.
- Make the first missing feature concrete enough for a real implementation agent.
- Preview deploys must be real, not placeholder links.
