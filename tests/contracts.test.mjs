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
    'docs/ui-quality-contract.md',
    'scripts/quality-check.sh',
  ].forEach(assertFile);
});

test('example app ui contract protects the integration boundary', () => {
  const contract = read('docs/ui-quality-contract.md');

  assert.match(contract, /External Product Rule/);
  assert.match(contract, /Crowdship owns contribution UI/);
  assert.match(contract, /1440x900/);
  assert.match(contract, /390x844/);
  assert.match(contract, /Keyboard/);
});

test('agent skill requires safe context and real previews', () => {
  const skill = read('.agents/skills/example-widget-integration/SKILL.md');
  const safeContext = read('.agents/skills/example-widget-integration/references/safe-context.md');
  const preview = read('.agents/skills/example-widget-integration/references/preview-cicd.md');

  assert.match(skill, /Pass only safe context/);
  assert.match(safeContext, /Do Not Pass/);
  assert.match(preview, /Do not show a preview URL/);
});

test('package scripts expose local quality commands', () => {
  const pkg = JSON.parse(read('package.json'));

  assert.equal(pkg.private, true);
  assert.equal(pkg.scripts.quality, 'bash scripts/quality-check.sh');
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  assert.equal(pkg.scripts.lint, 'bash -n scripts/*.sh .githooks/pre-commit');
});
