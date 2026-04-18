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
- Preview deploy.
- Smoke test preview URL.

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

For the first implementation, this can be done by the worker polling GitHub and the preview URL. A direct CI callback can come later.
