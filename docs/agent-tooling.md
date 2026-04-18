# Agent Tooling

## Project-Local Skills

The repository vendors project-specific agent guidance under `.agents/skills/`.

Current skills:

- `.agents/skills/example-widget-integration` — rules for keeping the example app a realistic external integration target.

Agents should read this skill before designing or implementing the example app.

## MCP And Provider Notes

MCP/tool usage is documented in `.agents/mcp/README.md`.

## Git Hooks

This repo includes `.githooks/pre-commit`.

Install locally:

```bash
git config core.hooksPath .githooks
```

The hook runs:

- `scripts/quality-check.sh --staged`
- UI-facing change reminder for Playwright checks

The hook is a guardrail, not a replacement for review.

## Quality Commands

Run before pushing meaningful changes:

```bash
npm run quality
npm test
npm run lint
```

Current checks are intentionally framework-neutral:

- shell syntax validation
- Node built-in contract tests
- whitespace validation
- tracked-file secret scan
- UI contract presence checks

Playwright visual checks become mandatory once real UI lands.
