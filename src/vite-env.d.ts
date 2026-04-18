/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CROWDSHIP_ENVIRONMENT?: string;
  readonly VITE_CROWDSHIP_PROJECT?: string;
  readonly VITE_CROWDSHIP_WIDGET_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
