import * as Sentry from '@sentry/browser';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/browser';

const APP_TAG = 'example';
const PREVIEW_ENVIRONMENT = 'preview';

type SentryTags = {
  app: string;
  route: string;
  contribution_id?: string;
  branch?: string;
  pr_number?: string;
};

type SentryConfig = {
  allowUrls: string[];
  dsn?: string;
  environment: string;
  release?: string;
  tags: SentryTags;
};

function normalizeTagValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeSentryRoute(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const previewMatch = normalizedPath.match(/^\/previews\/[^/]+(\/.*)?$/);
  const previewPath = previewMatch?.[1];

  if (previewMatch) {
    return previewPath && previewPath !== '' ? previewPath : '/';
  }

  return normalizedPath === '' ? '/' : normalizedPath;
}

export function getSentryConfig() {
  const environment = normalizeTagValue(import.meta.env.VITE_SENTRY_ENVIRONMENT) ?? 'production';
  const tags: SentryTags = {
    app: APP_TAG,
    route: normalizeSentryRoute(window.location.pathname),
  };

  if (environment === PREVIEW_ENVIRONMENT) {
    const contributionId = normalizeTagValue(import.meta.env.VITE_SENTRY_CONTRIBUTION_ID);
    const branch = normalizeTagValue(import.meta.env.VITE_SENTRY_BRANCH);
    const prNumber = normalizeTagValue(import.meta.env.VITE_SENTRY_PR_NUMBER);

    if (contributionId) {
      tags.contribution_id = contributionId;
    }

    if (branch) {
      tags.branch = branch;
    }

    if (prNumber) {
      tags.pr_number = prNumber;
    }
  }

  return {
    allowUrls: [window.location.origin],
    dsn: normalizeTagValue(import.meta.env.VITE_SENTRY_DSN),
    environment,
    release: normalizeTagValue(import.meta.env.VITE_SENTRY_RELEASE),
    tags,
  } satisfies SentryConfig;
}

function scrubSentryEvent(event: SentryErrorEvent, tags: SentryTags) {
  event.breadcrumbs = undefined;
  event.extra = undefined;
  event.request = undefined;
  event.user = undefined;
  event.tags = {
    ...event.tags,
    ...tags,
    route: normalizeSentryRoute(window.location.pathname),
  };

  if (event.contexts) {
    const { browser, device, os, runtime } = event.contexts;
    event.contexts = {
      browser,
      device,
      os,
      runtime,
    };
  }

  return event;
}

export function initSentry() {
  const config = getSentryConfig();

  if (!config.dsn) {
    return;
  }

  Sentry.init({
    allowUrls: config.allowUrls,
    beforeBreadcrumb: () => null,
    beforeSend(event) {
      return scrubSentryEvent(event, config.tags);
    },
    dsn: config.dsn,
    environment: config.environment,
    integrations(integrations) {
      return integrations.filter((integration) => integration.name !== 'Breadcrumbs');
    },
    initialScope(scope) {
      scope.setTags(config.tags);
      return scope;
    },
    maxBreadcrumbs: 0,
    release: config.release,
    sendDefaultPii: false,
  });
}
