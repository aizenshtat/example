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
    'docs/external-app-role.md',
    'docs/implementation-plan.md',
    'docs/ui-quality-contract.md',
    'index.html',
    'public/manifest.webmanifest',
    'public/sw.js',
    'scripts/deploy-preview.sh',
    'scripts/preview-runtime-smoke.mjs',
    'scripts/quality-check.sh',
    'scripts/report-ci-status.sh',
    'src/App.tsx',
    'src/main.tsx',
    'src/sentry.ts',
    'infra/nginx/example.aizenshtat.eu.conf',
    'vite.config.ts',
  ].forEach(assertFile);
});

test('implementation plan references required contracts', () => {
  const plan = read('docs/implementation-plan.md');

  assert.match(plan, /Vite/);
  assert.match(plan, /React/);
  assert.match(plan, /TypeScript/);
  assert.match(plan, /Add relay-shadow markers to signal-drop replay/);
  assert.doesNotMatch(plan, /Add anomaly replay for signal drops/);
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
  assert.equal(pkg.dependencies['@sentry/browser'], '^10.49.0');
  assert.equal(pkg.scripts.build, 'tsc --noEmit && vite build');
  assert.equal(pkg.scripts['build:preview'], 'tsc --noEmit && vite build --mode preview');
  assert.equal(pkg.scripts['deploy:preview'], 'bash scripts/deploy-preview.sh');
  assert.equal(pkg.scripts.quality, 'bash scripts/quality-check.sh');
  assert.equal(pkg.scripts['smoke:preview'], 'node scripts/preview-runtime-smoke.mjs');
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.mjs');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit');
  assert.equal(pkg.scripts.lint, 'tsc --noEmit && bash -n scripts/*.sh .githooks/pre-commit');
  assert.equal(pkg.devDependencies.playwright, '^1.59.1');
});

test('preview deployment uses nested static paths and relative assets', () => {
  const viteConfig = read('vite.config.ts');
  const deployPreview = read('scripts/deploy-preview.sh');
  const nginx = read('infra/nginx/example.aizenshtat.eu.conf');
  const app = read('src/App.tsx');
  const main = read('src/main.tsx');
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  const sw = read('public/sw.js');
  const html = read('index.html');
  const deployStatic = read('scripts/deploy-static.sh');

  assert.match(viteConfig, /mode === 'preview'/);
  assert.match(viteConfig, /base:\s*mode === 'preview' \? '\.\/' : '\/'/);
  assert.match(deployPreview, /build:preview/);
  assert.match(deployPreview, /Usage: \$0 <contribution-id> \[source-repo-path\]/);
  assert.match(deployPreview, /SOURCE_REPO_PATH="\$\{2:-\$\{PREVIEW_SOURCE_REPO_PATH:-\$REPO_ROOT\}\}"/);
  assert.match(deployPreview, /SOURCE_REPO_ROOT="\$\(cd "\$SOURCE_REPO_PATH" && pwd\)"/);
  assert.match(deployPreview, /cd "\$SOURCE_REPO_ROOT"/);
  assert.match(deployPreview, /package\.json/);
  assert.match(deployPreview, /PREVIEW_ROOT="\$\{PREVIEW_ROOT:-\/var\/www\/\$\{APP_DOMAIN\}\/html\/previews\}"/);
  assert.match(deployPreview, /TARGET="\$\{PREVIEW_ROOT\}\/\$\{CONTRIBUTION_ID\}"/);
  assert.match(deployPreview, /DEPLOY_HOST="\$\{DEPLOY_HOST:-\}"/);
  assert.match(deployPreview, /DEPLOY_USER="\$\{DEPLOY_USER:-\}"/);
  assert.match(deployPreview, /DEPLOY_PORT="\$\{DEPLOY_PORT:-22\}"/);
  assert.match(deployPreview, /ssh -p "\$DEPLOY_PORT" "\$REMOTE"/);
  assert.match(deployStatic, /--exclude 'previews\/'/);
  assert.match(deployStatic, /DEPLOY_HOST="\$\{DEPLOY_HOST:-\}"/);
  assert.match(deployStatic, /DEPLOY_USER="\$\{DEPLOY_USER:-\}"/);
  assert.match(deployStatic, /DEPLOY_PORT="\$\{DEPLOY_PORT:-22\}"/);
  assert.match(nginx, /location = \/mission/);
  assert.match(nginx, /location ~ \^\/previews\/\(\[\^\/\]\+\)\(\/\.\*\)\?\$/);
  assert.match(app, /href="\.\/mission"/);
  assert.match(app, /src="\.\/icons\/icon-192\.png"/);
  assert.match(app, /src="\.\/assets\/orbiter\.png"/);
  assert.match(main, /register\('sw\.js'\)/);
  assert.match(html, /href="\.\/manifest\.webmanifest"/);
  assert.equal(manifest.start_url, './mission');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.icons[0].src, './icons/icon-192.png');
  assert.equal(manifest.icons[1].src, './icons/icon-512.png');
  assert.match(sw, /self\.registration\.scope/);
  assert.match(sw, /SHELL_ROOT/);
});

test('reference app implements orbital ops and pwa foundation', () => {
  const app = read('src/App.tsx');
  const bootstrap = read('src/crowdship.ts');
  const data = read('src/data.ts');
  const externalRole = read('docs/external-app-role.md');
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  const sw = read('public/sw.js');
  const html = read('index.html');

  assert.match(app, /Orbital Ops/);
  assert.match(app, /type:\s*'feature_request'/);
  assert.match(app, /Spot a missing mission workflow\?/);
  assert.match(app, /Page context only/);
  assert.match(app, /Route \/mission/);
  assert.match(app, /selectedObjectId\?:\s*string/);
  assert.match(app, /selectedObjectType\?:\s*'anomaly'/);
  assert.match(app, /selectionExplicit\?:\s*true/);
  assert.match(app, /if \(!selectedObjectId\) \{/);
  assert.match(app, /selectedObjectType:\s*'anomaly'/);
  assert.match(app, /selectionExplicit:\s*true/);
  assert.match(app, /useState<string \| null>\(null\)/);
  assert.doesNotMatch(app, /useState<string>\('signal-drop-17'\)/);
  assert.doesNotMatch(app, /\?\?\s*visibleEvents\[0\]/);
  assert.match(app, /__EXAMPLE_CROWDSHIP_CONTEXT__/);
  assert.match(data, /Request shadow markers/);
  assert.match(data, /signal-drop-17/);
  assert.match(data, /Add relay-shadow markers to signal-drop replay/);
  assert.match(externalRole, /Add relay-shadow markers to signal-drop replay/);
  assert.doesNotMatch(externalRole, /Add anomaly replay for signal drops/);
  assert.match(bootstrap, /getCrowdshipBootstrapConfig/);
  assert.match(bootstrap, /dataset\.crowdshipProject = config\.project/);
  assert.equal(manifest.name, 'Orbital Ops');
  assert.equal(manifest.short_name, 'Orbital');
  assert.match(manifest.description, /mission-control telemetry/i);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.id, './');
  assert.equal(manifest.lang, 'en-US');
  assert.equal(manifest.orientation, 'portrait');
  assert.equal(manifest.background_color, '#040608');
  assert.equal(manifest.theme_color, '#040608');
  assert.deepEqual(manifest.categories, ['productivity', 'utilities']);
  assert.equal(manifest.icons.length, 2);
  assert.match(sw, /CACHE_NAME/);
  assert.match(html, /<title>Orbital Ops<\/title>/);
});

test('sentry is documented as core team merge evidence', () => {
  const sentry = read('docs/sentry.md');
  const preview = read('docs/preview-cicd.md');
  const admin = read('docs/admin-setup.md');
  const githubConfig = read('docs/github-configuration.md');

  assert.match(sentry, /Merge-Readiness Evidence/);
  assert.match(sentry, /VITE_SENTRY_DSN/);
  assert.match(sentry, /VITE_SENTRY_RELEASE/);
  assert.match(sentry, /request, user, and extra payload fields stripped before send/);
  assert.match(sentry, /contribution_id/);
  assert.match(sentry, /source map/iu);
  assert.match(preview, /No new unhandled Sentry issues/);
  assert.match(preview, /merge-readiness signal/);
  assert.match(preview, /POST <CROWDSHIP_BASE_URL>\/api\/v1\/contributions\/<contribution-id>\/ci-status/);
  assert.match(preview, /CROWDSHIP_CI_STATUS_TOKEN/);
  assert.match(admin, /Merge-Readiness Evidence/);
  assert.match(githubConfig, /CROWDSHIP_CI_STATUS_TOKEN/);
  assert.match(githubConfig, /CROWDSHIP_BASE_URL/);
});

test('preview workflow injects browser sentry build metadata', () => {
  const workflow = read('.github/workflows/smoke.yml');
  const smokeScript = read('scripts/preview-runtime-smoke.mjs');
  const ciStatusScript = read('scripts/report-ci-status.sh');

  assert.match(workflow, /VITE_SENTRY_DSN: \$\{\{ secrets\.SENTRY_DSN \}\}/);
  assert.match(workflow, /VITE_SENTRY_ENVIRONMENT: preview/);
  assert.match(workflow, /VITE_SENTRY_RELEASE: \$\{\{ steps\.meta\.outputs\.release \}\}/);
  assert.match(workflow, /VITE_SENTRY_CONTRIBUTION_ID: \$\{\{ steps\.meta\.outputs\.contribution_id \}\}/);
  assert.match(workflow, /VITE_SENTRY_BRANCH: \$\{\{ steps\.meta\.outputs\.branch \}\}/);
  assert.match(workflow, /VITE_SENTRY_PR_NUMBER: \$\{\{ github\.event\.pull_request\.number \}\}/);
  assert.match(workflow, /npx playwright install --with-deps chromium/);
  assert.match(workflow, /npm run smoke:preview -- "\$\{\{ steps\.meta\.outputs\.preview_mission_url \}\}"/);
  assert.match(workflow, /sentry_issues_api=/);
  assert.match(workflow, /Browser runtime smoke:/);
  assert.match(workflow, /Widget open contract:/);
  assert.match(workflow, /New unhandled preview errors: \$\{ISSUE_COUNT:-unavailable\}/);
  assert.match(workflow, /CROWDSHIP_BASE_URL: \$\{\{ vars\.CROWDSHIP_BASE_URL \}\}/);
  assert.match(workflow, /CROWDSHIP_CI_STATUS_TOKEN: \$\{\{ secrets\.CROWDSHIP_CI_STATUS_TOKEN \}\}/);
  assert.match(workflow, /bash scripts\/report-ci-status\.sh preview "\$\{\{ steps\.meta\.outputs\.contribution_id \}\}"/);
  assert.match(workflow, /bash scripts\/report-ci-status\.sh production "\$\{\{ steps\.meta\.outputs\.contribution_id \}\}"/);
  assert.match(workflow, /pull-requests: read/);
  assert.match(workflow, /Resolve production metadata/);
  assert.match(workflow, /head_commit_message="\$\(jq -r '\.head_commit\.message \/\/ ""' "\$GITHUB_EVENT_PATH"\)"/);
  assert.match(workflow, /curl --silent --show-error --location --output "\$pull_request_file" --write-out '%\{http_code\}'/);
  assert.match(workflow, /echo "contribution_id=\$contribution_id"/);
  assert.match(smokeScript, /window\.__crowdshipSmoke/);
  assert.match(smokeScript, /script\[data-example-crowdship-loader="true"\]/);
  assert.match(smokeScript, /Pressure replay online/);
  assert.match(smokeScript, /runtimeStatus/);
  assert.match(ciStatusScript, /x-crowdship-ci-token/);
  assert.match(ciStatusScript, /Authorization: Bearer/);
  assert.match(ciStatusScript, /api\/v1\/contributions\/\$\{CONTRIBUTION_ID\}\/ci-status/);
  assert.match(ciStatusScript, /with_optional_number\("newUnhandledPreviewErrors"/);
  assert.match(ciStatusScript, /with_optional_string\("sentryRelease"/);
});
