# Widget Install Contract

## Integration Goal

The example app should install Crowdship the same way a real external app would: by loading a public script and passing safe metadata.

The widget owns all contribution UI. The example app should not implement request chat, voting, or progress UI itself.

## Contract

```html
<script
  async
  src="https://crowdship.aizenshtat.eu/widget/v1.js"
  data-crowdship-project="example"
  data-crowdship-environment="demo"
></script>
```

The script is public. The project slug is public. Any write protection happens on the Crowdship server.

## Optional Identity

```html
data-crowdship-user-id="demo-user-123"
data-crowdship-user-email="demo@example.com"
data-crowdship-user-role="customer"
```

The host app decides which identity fields to share.

## Optional Runtime Context

```js
window.Crowdship.setContext({
  route: window.location.pathname,
  appVersion: "2026.04.18",
  selectedObjectType: "report",
  selectedObjectId: "report-demo-7",
  activeFilters: {
    segment: "enterprise",
    period: "last-30-days"
  }
});
```

The host app is responsible for keeping this context safe and intentional.

## Widget Events

The example app may listen to widget lifecycle events for analytics or UX:

```js
window.addEventListener("crowdship:event", (event) => {
  console.log(event.detail.type, event.detail.contributionId);
});
```

The example app must not use these events to bypass Crowdship approval or voting states.
