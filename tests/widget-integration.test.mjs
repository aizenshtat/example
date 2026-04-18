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
  assert.match(bootstrap, /https:\/\/crowdship\.aizenshtat\.eu\/widget\/v1\.js/);
  assert.match(bootstrap, /DEFAULT_CROWDSHIP_PROJECT = 'example'/);
  assert.match(bootstrap, /DEFAULT_CROWDSHIP_ENVIRONMENT = 'production'/);
  assert.match(bootstrap, /dataset\.crowdshipLauncher = config\.launcher/);
  assert.match(envExample, /VITE_CROWDSHIP_WIDGET_SRC=/);
  assert.match(envExample, /VITE_CROWDSHIP_PROJECT=/);
  assert.match(envExample, /VITE_CROWDSHIP_ENVIRONMENT=/);
});

test('App opens Crowdship with safe context for the anomaly-replay request', () => {
  const app = read('src/App.tsx');

  assert.match(app, /window\.Crowdship\?\.setContext\(crowdshipContext\)/);
  assert.match(app, /window\.Crowdship\?\.open\(CROWDSHIP_REQUEST\)/);
  assert.match(app, /type:\s*'feature_request'/);
  assert.doesNotMatch(app, /Add anomaly replay for signal drops/);
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
  assert.match(app, /Pressure trend around \{selectedEvent\.id\}/);
  assert.match(app, /before, during, and after/);
  assert.match(app, /pressureReplay \? \(/);
  assert.match(app, /No anomaly pressure comparison/);
  assert.match(data, /pressureReplayProfiles/);
  assert.match(data, /'signal-drop-17'/);
  assert.match(styles, /pressure-widget/);
  assert.match(styles, /pressure-chart/);
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
