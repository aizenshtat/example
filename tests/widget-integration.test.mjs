import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('index.html loads the production Crowdship widget', () => {
  const html = read('index.html');

  assert.match(
    html,
    /src="https:\/\/crowdship\.aizenshtat\.eu\/widget\/v1\.js"/,
  );
  assert.match(html, /data-crowdship-project="example"/);
  assert.match(html, /data-crowdship-environment="production"/);
  assert.match(html, /data-crowdship-launcher="manual"/);
});

test('App opens Crowdship with safe context for the anomaly-replay request', () => {
  const app = read('src/App.tsx');

  assert.match(app, /window\.Crowdship\?\.setContext\(crowdshipContext\)/);
  assert.match(app, /window\.Crowdship\?\.open\(CROWDSHIP_REQUEST\)/);
  assert.match(app, /type:\s*'feature_request'/);
  assert.match(app, /Add anomaly replay for signal drops/);
  assert.match(app, /route:\s*'\/mission'/);
  assert.match(app, /selectedObjectType:\s*'anomaly'/);
  assert.match(app, /signal-drop-17/);
  assert.match(app, /__EXAMPLE_CROWDSHIP_CONTEXT__/);
});

test('mission telemetry includes cabin pressure gauge in scene and detail surfaces', () => {
  const app = read('src/App.tsx');
  const data = read('src/data.ts');
  const styles = read('src/styles.css');

  assert.match(app, /CabinPressureGauge cabinPressure=\{telemetry\.cabinPressure\} compact/);
  assert.match(app, /CabinPressureGauge cabinPressure=\{selectedEvent\.cabinPressure\}/);
  assert.match(app, /Cabin pressure/);
  assert.match(app, /No data/);
  assert.match(data, /type PressureSeverity = 'normal' \| 'warning' \| 'critical'/);
  assert.match(data, /value: null/);
  assert.match(styles, /pressure-gauge--normal/);
  assert.match(styles, /pressure-gauge--warning/);
  assert.match(styles, /pressure-gauge--critical/);
  assert.match(styles, /pressure-gauge--disabled/);
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
