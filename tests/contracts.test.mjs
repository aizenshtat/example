import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assertFile(relativePath) {
  assert.ok(existsSync(join(root, relativePath)), `${relativePath} should exist`);
}

test('quality infrastructure files exist', () => {
  [
    '.agents/mcp/README.md',
    '.agents/skills/example-widget-integration/SKILL.md',
    '.agents/skills/example-widget-integration/references/external-app-ux.md',
    '.githooks/pre-commit',
    '.github/workflows/smoke.yml',
    'docs/agent-tooling.md',
    'docs/implementation-plan.md',
    'docs/ui-quality-contract.md',
    'index.html',
    'public/manifest.webmanifest',
    'public/sw.js',
    'scripts/quality-check.sh',
    'src/App.tsx',
    'src/main.tsx',
    'vite.config.ts',
  ].forEach(assertFile);
});

test('implementation plan references required contracts', () => {
  const plan = read('docs/implementation-plan.md');

  assert.match(plan, /Vite/);
  assert.match(plan, /React/);
  assert.match(plan, /TypeScript/);
  assert.match(plan, /docs\/external-app-role\.md/);
  assert.match(plan, /docs\/widget-install-contract\.md/);
  assert.match(plan, /docs\/sentry\.md/);
  assert.match(plan, /\.\.\/crowdship\/docs\/widget-contract\.md/);
});

test('example app ui contract protects the integration boundary', () => {
  const contract = read('docs/ui-quality-contract.md');

  assert.match(contract, /External Product Rule/);
  assert.match(contract, /Mobile-First And PWA/);
  assert.match(contract, /Home Screen/);
  assert.match(contract, /Web Push/);
  assert.match(contract, /Crowdship owns contribution UI/);
  assert.match(contract, /1440x900/);
  assert.match(contract, /390x844/);
  assert.match(contract, /Keyboard/);
});

test('agent skill requires safe context and real previews', () => {
  const skill = read('.agents/skills/example-widget-integration/SKILL.md');
  const safeContext = read('.agents/skills/example-widget-integration/references/safe-context.md');
  const preview = read('.agents/skills/example-widget-integration/references/preview-cicd.md');
  const externalUx = read('.agents/skills/example-widget-integration/references/external-app-ux.md');

  assert.match(skill, /Pass only safe context/);
  assert.match(safeContext, /Do Not Pass/);
  assert.match(preview, /Do not show a preview URL/);
  assert.match(externalUx, /Mobile-First Product/);
  assert.match(externalUx, /PWA Direction/);
});

test('package scripts expose local quality commands', () => {
  const pkg = JSON.parse(read('package.json'));

  assert.equal(pkg.private, true);
  assert.equal(pkg.scripts.build, 'tsc --noEmit && vite build');
  assert.equal(pkg.scripts.quality, 'bash scripts/quality-check.sh');
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit');
  assert.equal(pkg.scripts.lint, 'tsc --noEmit && bash -n scripts/*.sh .githooks/pre-commit');
});

test('reference app implements reports and pwa foundation', () => {
  const app = read('src/App.tsx');
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  const sw = read('public/sw.js');

  assert.match(app, /Weekly customer performance review/);
  assert.match(app, /CSV export is not available yet/);
  assert.match(app, /__EXAMPLE_CROWDSHIP_CONTEXT__/);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.icons.length, 2);
  assert.match(sw, /CACHE_NAME/);
});

test('sentry is documented as core team merge evidence', () => {
  const sentry = read('docs/sentry.md');
  const preview = read('docs/preview-cicd.md');
  const admin = read('docs/admin-setup.md');

  assert.match(sentry, /Merge-Readiness Evidence/);
  assert.match(sentry, /contribution_id/);
  assert.match(sentry, /source map/iu);
  assert.match(preview, /No new unhandled Sentry issues/);
  assert.match(preview, /merge-readiness signal/);
  assert.match(admin, /Merge-Readiness Evidence/);
});
