# Widget Install Contract

## Integration Goal

The example app should install Crowdship the same way a real external app would: by loading a public script and passing safe metadata.

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
  appVersion: "2026.04.18"
});
```

The host app is responsible for keeping this context safe and intentional.
