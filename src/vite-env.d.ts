/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CROWDSHIP_ENVIRONMENT?: string;
  readonly VITE_CROWDSHIP_PROJECT?: string;
  readonly VITE_CROWDSHIP_USER_EMAIL?: string;
  readonly VITE_CROWDSHIP_USER_ID?: string;
  readonly VITE_CROWDSHIP_USER_ROLE?: string;
  readonly VITE_CROWDSHIP_WIDGET_SRC?: string;
  readonly VITE_SENTRY_BRANCH?: string;
  readonly VITE_SENTRY_CONTRIBUTION_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_SENTRY_PR_NUMBER?: string;
  readonly VITE_SENTRY_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
