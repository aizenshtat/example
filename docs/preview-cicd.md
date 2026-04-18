# Preview CI/CD

## Goal

Every Crowdship implementation branch should deploy to a real preview path that requesters and voters can test.

## URL Contract

```text
https://example.aizenshtat.eu/previews/<contribution-id>/
```

## Branch Contract

Crowdship-created branches use:

```text
crowdship/<contribution-id>-<short-slug>
```

## Pull Request Checks

Each PR should run:

- Install.
- Lint or static check.
- Build.
- Create or update Sentry release `example@<git-sha>`.
- Upload source maps when the build produces them.
- Preview deploy.
- Smoke test preview URL.
- Check filtered Sentry issues for the preview contribution.

## Production Deploy

Merging to `main` deploys:

```text
https://example.aizenshtat.eu/
```

## Crowdship Callback

After preview deploy, CI should provide Crowdship with:

- Contribution ID.
- Branch.
- PR URL.
- GitHub run URL.
- Preview URL.
- Status.
- Sentry release.
- Filtered Sentry issues URL.
- New unhandled preview error count.
- Failed preview session count when available.

For the first implementation, this can be done by the worker polling GitHub and the preview URL. A direct CI callback can come later.

## Merge Evidence

Before maintainers treat a Crowdship PR as operationally clean, the preview should have:

- Passing GitHub checks.
- Responding preview URL.
- Sentry release for the PR commit.
- No new unhandled Sentry issues tagged with the contribution id.
- Known existing issues marked unrelated or acknowledged.

This is a merge-readiness signal. The example app core team still owns code review, product fit, security, and final merge.
