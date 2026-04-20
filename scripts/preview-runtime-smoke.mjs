#!/usr/bin/env node

import process from 'node:process';

import { chromium } from 'playwright';

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('Usage: node scripts/preview-runtime-smoke.mjs <preview-mission-url>');
  process.exit(1);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900,
    },
  });
  const consoleErrors = [];
  const firstPartyRequestFailures = [];
  const pageErrors = [];
  const firstPartyOrigin = new URL(targetUrl).origin;

  await page.route('**/widget/v1.js*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.__crowdshipSmoke = { contexts: [], opens: [] };
        window.Crowdship = {
          setContext(context) {
            window.__crowdshipSmoke.contexts.push(JSON.parse(JSON.stringify(context)));
          },
          open(request) {
            window.__crowdshipSmoke.opens.push(JSON.parse(JSON.stringify(request)));
          }
        };
      `,
    });
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error instanceof Error ? error.message : String(error));
  });

  page.on('requestfailed', (request) => {
    if (request.url().startsWith(firstPartyOrigin)) {
      firstPartyRequestFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || 'failed'}`);
    }
  });

  page.on('response', (response) => {
    if (response.url().startsWith(firstPartyOrigin) && response.status() >= 400) {
      firstPartyRequestFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(targetUrl, {
    timeout: 30_000,
    waitUntil: 'domcontentloaded',
  });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

  const requestButton = page.getByRole('button', { name: 'Request replay mode' });
  await requestButton.waitFor({ state: 'visible', timeout: 15_000 });

  await page.waitForFunction(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.Crowdship) &&
      typeof window.Crowdship?.open === 'function' &&
      typeof window.Crowdship?.setContext === 'function',
    undefined,
    { timeout: 15_000 },
  );

  const crowdshipReady = await page.evaluate(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.Crowdship) &&
      typeof window.Crowdship?.open === 'function' &&
      typeof window.Crowdship?.setContext === 'function',
  );
  const loaderScriptReady = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[data-example-crowdship-loader="true"]'));

    if (scripts.length !== 1) {
      return false;
    }

    const script = scripts[0];
    return (
      script.getAttribute('data-crowdship-project') === 'example' &&
      script.getAttribute('data-crowdship-environment') === 'production' &&
      script.getAttribute('data-crowdship-launcher') === 'manual'
    );
  });
  const launcherEnabled = await requestButton.isEnabled();

  const missionVisible = await page.getByRole('heading', {
    name: 'Astra-7 is threading a relay shadow with a tight hand on the throttle.',
  }).isVisible();
  const pressureReplayOnline = await page.getByText('Pressure replay online', { exact: true }).isVisible();
  const pressureTrendVisible = await page.getByRole('heading', { name: 'Pressure trend around signal-drop-17' }).isVisible();
  const orbiterAssetLoaded = await page.evaluate(() => {
    const image = document.querySelector('.orbiter-art');
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });

  await requestButton.click();

  const widgetOpenState = await page.waitForFunction(
    () => {
      const smoke = window.__crowdshipSmoke;
      if (!smoke || !Array.isArray(smoke.opens) || smoke.opens.length === 0) {
        return false;
      }

      const context = Array.isArray(smoke.contexts) && smoke.contexts.length > 0 ? smoke.contexts[smoke.contexts.length - 1] : null;
      const request = smoke.opens[smoke.opens.length - 1];

      return {
        context,
        request,
      };
    },
    undefined,
    { timeout: 15_000 },
  );

  const widgetEvidence = await widgetOpenState.jsonValue();
  const widgetShellReady =
    widgetEvidence &&
    widgetEvidence.request &&
    widgetEvidence.request.type === 'feature_request' &&
    widgetEvidence.context &&
    widgetEvidence.context.route === '/mission' &&
    widgetEvidence.context.selectedObjectType === 'anomaly';

  const runtimeStatus =
    missionVisible &&
    pressureReplayOnline &&
    pressureTrendVisible &&
    orbiterAssetLoaded &&
    crowdshipReady &&
    loaderScriptReady &&
    launcherEnabled &&
    widgetShellReady &&
    pageErrors.length === 0 &&
    firstPartyRequestFailures.length === 0
      ? 'verified'
      : 'degraded';

  const result = {
    checkedAt: new Date().toISOString(),
    targetUrl,
    finalUrl: page.url(),
    title: await page.title(),
    missionVisible,
    pressureReplayOnline,
    pressureTrendVisible,
    orbiterAssetLoaded,
    crowdshipReady,
    loaderScriptReady,
    launcherEnabled,
    widgetShellReady,
    widgetEvidence,
    consoleErrors,
    firstPartyRequestFailures,
    pageErrors,
    runtimeStatus,
  };

  await browser.close();
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stdout.write(
    `${JSON.stringify({
      checkedAt: new Date().toISOString(),
      targetUrl,
      crowdshipReady: false,
      launcherEnabled: false,
      widgetShellReady: false,
      consoleErrors: [],
      pageErrors: [message],
      runtimeStatus: 'degraded',
    })}\n`,
  );
  process.exit(0);
});
