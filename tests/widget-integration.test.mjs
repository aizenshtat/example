import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('main bootstraps the Crowdship widget with env-backed defaults', () => {
  const main = read('src/main.tsx');
  const bootstrap = read('src/crowdship.ts');
  const envExample = read('.env.example');

  assert.match(main, /ensureCrowdshipScript\(\)/);
  assert.match(main, /initSentry\(\)/);
  assert.match(bootstrap, /https:\/\/crowdship\.aizenshtat\.eu\/widget\/v1\.js/);
  assert.match(bootstrap, /DEFAULT_CROWDSHIP_PROJECT = 'example'/);
  assert.match(bootstrap, /DEFAULT_CROWDSHIP_ENVIRONMENT = 'production'/);
  assert.match(bootstrap, /dataset\.crowdshipLauncher = config\.launcher/);
  assert.match(envExample, /VITE_CROWDSHIP_WIDGET_SRC=/);
  assert.match(envExample, /VITE_CROWDSHIP_PROJECT=/);
  assert.match(envExample, /VITE_CROWDSHIP_ENVIRONMENT=/);
});

test('browser sentry bootstrap keeps preview tags safe and scoped to the example app', () => {
  const sentry = read('src/sentry.ts');
  const viteEnv = read('src/vite-env.d.ts');

  assert.match(sentry, /import \* as Sentry from '@sentry\/browser'/);
  assert.match(sentry, /const APP_TAG = 'example'/);
  assert.match(sentry, /environment === PREVIEW_ENVIRONMENT/);
  assert.match(sentry, /tags\.contribution_id = contributionId/);
  assert.match(sentry, /tags\.branch = branch/);
  assert.match(sentry, /tags\.pr_number = prNumber/);
  assert.match(sentry, /allowUrls: \[window\.location\.origin\]/);
  assert.match(sentry, /sendDefaultPii: false/);
  assert.match(sentry, /beforeBreadcrumb: \(\) => null/);
  assert.match(sentry, /event\.request = undefined/);
  assert.match(sentry, /event\.user = undefined/);
  assert.match(sentry, /normalizeSentryRoute\(window\.location\.pathname\)/);
  assert.match(sentry, /if \(previewMatch\) \{/);
  assert.match(sentry, /return previewPath && previewPath !== '' \? previewPath : '\//);
  assert.match(sentry, /integration\.name !== 'Breadcrumbs'/);
  assert.match(viteEnv, /readonly VITE_SENTRY_DSN\?: string;/);
  assert.match(viteEnv, /readonly VITE_SENTRY_RELEASE\?: string;/);
  assert.match(viteEnv, /readonly VITE_SENTRY_CONTRIBUTION_ID\?: string;/);
  assert.match(viteEnv, /readonly VITE_SENTRY_BRANCH\?: string;/);
  assert.match(viteEnv, /readonly VITE_SENTRY_PR_NUMBER\?: string;/);
});

test('App opens Crowdship with safe context for the seeded relay-shadow request', () => {
  const app = read('src/App.tsx');
  const data = read('src/data.ts');

  assert.match(app, /window\.Crowdship\?\.setContext\(crowdshipContext\)/);
  assert.match(app, /window\.Crowdship\?\.open\(crowdshipRequest\)/);
  assert.match(app, /type:\s*'feature_request'/);
  assert.match(app, /title:\s*selectedRequestSeed\.requestTitle/);
  assert.match(data, /missionRequestSeeds/);
  assert.match(data, /Add eclipse markers to signal-drop replay/);
  assert.doesNotMatch(app, /Add anomaly replay for signal drops/);
  assert.doesNotMatch(app, /Signal drops need inline replay\./);
  assert.match(app, /route:\s*'\/mission'/);
  assert.match(app, /selectedObjectType:\s*'anomaly'/);
  assert.match(app, /signal-drop-17/);
  assert.match(app, /__EXAMPLE_CROWDSHIP_CONTEXT__/);
});

test('App renders anomaly pressure replay only for relevant selected anomalies', () => {
  const app = read('src/App.tsx');
  const data = read('src/data.ts');
  const styles = read('src/styles.css');

  assert.match(app, /Pressure replay/);
  assert.match(app, /Pressure replay is already live where the mission needs it\./);
  assert.match(app, /Relay-shadow timing still needs its own layer\./);
  assert.match(app, /selectedRequestSeed\.status/);
  assert.match(data, /Pressure replay live/);
  assert.match(app, /Pressure trend around \{selectedEvent\.id\}/);
  assert.match(app, /before, during, and after/);
  assert.match(app, /pressureReplay \? \(/);
  assert.match(app, /No anomaly pressure comparison/);
  assert.match(data, /pressureReplayProfiles/);
  assert.match(data, /'signal-drop-17'/);
  assert.match(data, /Line up the live pressure replay with relay-shadow entry and reacquisition markers/);
  assert.match(styles, /pressure-widget/);
  assert.match(styles, /pressure-chart/);
});

test('App keeps mission alerts permission behind explicit user action with Phase 2 states', () => {
  const app = read('src/App.tsx');
  const styles = read('src/styles.css');
  const permissionCalls = app.match(/Notification\.requestPermission\(\)/g) ?? [];

  assert.match(app, /Mission alerts wait for your say-so/);
  assert.match(app, /handleNotificationEntryPoint/);
  assert.equal(permissionCalls.length, 1);
  assert.match(app, /async function handleNotificationEntryPoint\(\) \{[\s\S]*Notification\.requestPermission\(\)/);
  assert.match(app, /onClick=\{handleNotificationEntryPoint\}/);
  assert.match(app, /No prompts until you turn them on\./);
  assert.match(app, /Preview ready/);
  assert.match(app, /Request needs review/);
  assert.match(app, /Feature shipped/);
  assert.match(app, /Admin action needed/);
  assert.match(app, /'ready'/);
  assert.match(app, /'enabled'/);
  assert.match(app, /'blocked'/);
  assert.match(app, /'homescreen-required'/);
  assert.match(app, /'unsupported'/);
  assert.match(app, /'error'/);
  assert.match(app, /Home Screen required/);
  assert.match(styles, /notification-strip/);
  assert.match(styles, /alert-status/);
  assert.match(styles, /alert-moment/);
});

test('App rejects legacy report and demo-board copy', () => {
  const app = read('src/App.tsx');
  const styles = read('src/styles.css');

  assert.doesNotMatch(app, /CSV export/i);
  assert.doesNotMatch(app, /Weekly customer performance review/);
  assert.doesNotMatch(app, /customer revenue workspace/i);
  assert.doesNotMatch(app, /Demo Board/);
  assert.doesNotMatch(app, /judge mode/i);
  assert.doesNotMatch(styles, /report-row/);
  assert.doesNotMatch(styles, /revenue/);
});
