const DEFAULT_CROWDSHIP_WIDGET_SRC = 'https://crowdship.aizenshtat.eu/widget/v1.js';
const DEFAULT_CROWDSHIP_PROJECT = 'example';
const DEFAULT_CROWDSHIP_ENVIRONMENT = 'production';
const DEFAULT_CROWDSHIP_LAUNCHER = 'manual';
const SCRIPT_SELECTOR = 'script[data-example-crowdship-loader="true"]';

export type CrowdshipBootstrapConfig = {
  environment: string;
  launcher: string;
  project: string;
  widgetSrc: string;
};

function readConfigValue(value: string | undefined, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

export function getCrowdshipBootstrapConfig(): CrowdshipBootstrapConfig {
  return {
    environment: readConfigValue(
      import.meta.env.VITE_CROWDSHIP_ENVIRONMENT,
      DEFAULT_CROWDSHIP_ENVIRONMENT,
    ),
    launcher: DEFAULT_CROWDSHIP_LAUNCHER,
    project: readConfigValue(import.meta.env.VITE_CROWDSHIP_PROJECT, DEFAULT_CROWDSHIP_PROJECT),
    widgetSrc: readConfigValue(
      import.meta.env.VITE_CROWDSHIP_WIDGET_SRC,
      DEFAULT_CROWDSHIP_WIDGET_SRC,
    ),
  };
}

export function ensureCrowdshipScript() {
  if (typeof document === 'undefined') {
    return null;
  }

  const existingScript = document.querySelector(SCRIPT_SELECTOR);
  if (existingScript instanceof HTMLScriptElement) {
    return existingScript;
  }

  const config = getCrowdshipBootstrapConfig();
  const script = document.createElement('script');
  script.async = true;
  script.src = config.widgetSrc;
  script.dataset.crowdshipProject = config.project;
  script.dataset.crowdshipEnvironment = config.environment;
  script.dataset.crowdshipLauncher = config.launcher;
  script.dataset.exampleCrowdshipLoader = 'true';
  document.body.appendChild(script);
  return script;
}
