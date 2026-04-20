# Preview CI/CD

## Goal

Every Crowdship implementation branch should deploy to a real preview path that requesters and voters can test.

## URL Contract

```text
https://example.aizenshtat.eu/previews/<contribution-id>/
```

Preview builds are published as nested static files under the matching
`/previews/<contribution-id>/` directory with relative asset references so the
deployed HTML stays self-contained.

## Branch Contract

Crowdship-created branches use:

```text
crowdship/<contribution-id>-<short-slug>
```

Preview deploys should use `scripts/deploy-preview.sh <contribution-id>` and the
preview build mode in Vite so the output stays scoped to that directory.
When CI or a worker is operating from a worktree or alternate checkout, pass the
source repo path as the second argument:

```text
scripts/deploy-preview.sh <contribution-id> /path/to/source-repo
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

The example workflow now posts this evidence directly to:

```text
POST <CROWDSHIP_BASE_URL>/api/v1/contributions/<contribution-id>/ci-status
```

using the `CROWDSHIP_CI_STATUS_TOKEN` secret.

Preview callbacks report:

- `environment=preview`
- `buildStatus`
- `previewStatus`
- `previewUrl`
- `repositoryFullName`
- `pullRequestNumber`
- `pullRequestUrl`
- `branch`
- `runId`
- `runUrl`
- `sentryRelease`
- `sentryIssuesUrl`
- `newUnhandledPreviewErrors` when loaded
- `failedPreviewSessions` when collected
- `updatedAt`

Production callbacks use the same endpoint with `environment=production`,
`productionStatus`, `productionUrl`, and `gitSha`. They only fire when the
workflow can resolve a contribution id from the merged Crowdship pull request.

## Merge Evidence

Before maintainers treat a Crowdship PR as operationally clean, the preview should have:

- Passing GitHub checks.
- Responding preview URL.
- Sentry release for the PR commit.
- No new unhandled Sentry issues tagged with the contribution id.
- Known existing issues marked unrelated or acknowledged.

This is a merge-readiness signal. The example app core team still owns code review, product fit, security, and final merge.
