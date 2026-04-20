import { useEffect, useMemo, useState } from 'react';
import {
  defaultMissionRequestSeed,
  missionEvents,
  missionRequestSeeds,
  pressureReplayProfiles,
  telemetryProfiles,
  type CraftFilter,
  type MissionSeverity,
  type MissionRequestSeed,
  type PressureReplayPoint,
  type WindowFilter,
} from './data';

const craftLabels: Record<CraftFilter, string> = {
  all: 'All craft',
  'astra-7': 'Astra-7',
  'lumen-3': 'Lumen-3',
  'mira-2': 'Mira-2',
};

const windowLabels: Record<WindowFilter, string> = {
  'last-30': 'Last 30 min',
  'last-6h': 'Last 6 hours',
  'europa-pass': 'Europa pass',
};

const severityLabels: Record<MissionSeverity, string> = {
  critical: 'Critical',
  stable: 'Stable',
  watch: 'Watch',
};

const phaseLabels: Record<PressureReplayPoint['phase'], string> = {
  before: 'Before anomaly',
  during: 'Anomaly window',
  after: 'After anomaly',
};

const CROWDSHIP_REQUEST = {
  type: 'feature_request' as const,
};

const alertMoments = [
  'Preview ready',
  'Request needs review',
  'Feature shipped',
  'Admin action needed',
] as const;

type CrowdshipContext = {
  activeFilters: {
    craft: CraftFilter;
    window: WindowFilter;
  };
  appVersion: string;
  route: '/mission';
  selectedObjectId: string | null;
  selectedObjectType: 'anomaly';
};

function buildContext(craft: CraftFilter, window: WindowFilter, selectedObjectId: string | null) {
  return {
    activeFilters: {
      craft,
      window,
    },
    appVersion: '2026.04.18',
    route: '/mission',
    selectedObjectId,
    selectedObjectType: 'anomaly',
  } satisfies CrowdshipContext;
}

function formatCraft(craft: Exclude<CraftFilter, 'all'>) {
  return craftLabels[craft];
}

function formatSeverity(severity: MissionSeverity) {
  return severityLabels[severity];
}

function countSeverities() {
  return {
    critical: 0,
    stable: 0,
    watch: 0,
  } satisfies Record<MissionSeverity, number>;
}

function buildPressurePath(points: PressureReplayPoint[]) {
  if (points.length === 0) {
    return '';
  }

  const maxPressure = Math.max(...points.map((point) => point.pressure));
  const minPressure = Math.min(...points.map((point) => point.pressure));
  const range = Math.max(maxPressure - minPressure, 1);
  const width = 100;
  const height = 100;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((point.pressure - minPressure) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

type NotificationEntryState =
  | 'ready'
  | 'requesting'
  | 'enabled'
  | 'blocked'
  | 'homescreen-required'
  | 'unsupported'
  | 'error';

type NotificationPanel = {
  actionDisabled: boolean;
  actionLabel: string;
  detail: string;
  statusLabel: string;
  tone: 'good' | 'neutral' | 'warn' | 'bad';
};

function isStandaloneDisplayMode() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    navigatorWithStandalone.standalone === true
  );
}

function isAppleMobileDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function getNotificationEntryState(): NotificationEntryState {
  if (
    !window.isSecureContext ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'enabled';
  }

  if (Notification.permission === 'denied') {
    return 'blocked';
  }

  if (isAppleMobileDevice() && !isStandaloneDisplayMode()) {
    return 'homescreen-required';
  }

  return 'ready';
}

function buildNotificationPanel(state: NotificationEntryState): NotificationPanel {
  switch (state) {
    case 'requesting':
      return {
        actionDisabled: true,
        actionLabel: 'Requesting permission...',
        detail: 'Choose whether this device should receive mission alerts.',
        statusLabel: 'Waiting on your choice',
        tone: 'neutral',
      };
    case 'enabled':
      return {
        actionDisabled: true,
        actionLabel: 'Mission alerts on',
        detail: 'This device can receive mission alerts for meaningful review moments.',
        statusLabel: 'Alerts on',
        tone: 'good',
      };
    case 'blocked':
      return {
        actionDisabled: true,
        actionLabel: 'Alerts blocked in settings',
        detail: 'Mission alerts are blocked in browser settings. Allow them there, then come back here.',
        statusLabel: 'Alerts blocked',
        tone: 'bad',
      };
    case 'homescreen-required':
      return {
        actionDisabled: true,
        actionLabel: 'Add to Home Screen first',
        detail: 'On iPhone and iPad, open Orbital Ops from the Home Screen before turning alerts on.',
        statusLabel: 'Home Screen required',
        tone: 'warn',
      };
    case 'unsupported':
      return {
        actionDisabled: true,
        actionLabel: 'Alerts unavailable here',
        detail: 'Use a secure browser with notification support to turn mission alerts on.',
        statusLabel: 'Alerts unavailable',
        tone: 'bad',
      };
    case 'error':
      return {
        actionDisabled: false,
        actionLabel: 'Try again',
        detail: 'Orbital Ops could not request alert permission. Try again from this screen.',
        statusLabel: 'Try again',
        tone: 'warn',
      };
    case 'ready':
    default:
      return {
        actionDisabled: false,
        actionLabel: 'Enable mission alerts',
        detail: 'No prompts until you turn them on.',
        statusLabel: 'Alerts off',
        tone: 'neutral',
      };
  }
}

export function App() {
  const [craft, setCraft] = useState<CraftFilter>('all');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('last-30');
  const [selectedEventId, setSelectedEventId] = useState<string>('signal-drop-17');
  const [crowdshipStatus, setCrowdshipStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  const [notificationEntryState, setNotificationEntryState] = useState<NotificationEntryState>(
    () => getNotificationEntryState(),
  );

  const visibleEvents = useMemo(() => {
    return missionEvents.filter((event) => {
      const craftMatches = craft === 'all' || event.craft === craft;
      const windowMatches = event.window === windowFilter;
      return craftMatches && windowMatches;
    });
  }, [craft, windowFilter]);

  const selectedEvent =
    visibleEvents.find((event) => event.id === selectedEventId) ?? visibleEvents[0] ?? null;

  const selectedEventIndex = selectedEvent
    ? visibleEvents.findIndex((event) => event.id === selectedEvent.id)
    : -1;
  const selectedEventPosition =
    selectedEventIndex >= 0 ? `${selectedEventIndex + 1}/${visibleEvents.length}` : '0/0';

  const severityCounts = useMemo(() => {
    const totals = countSeverities();

    for (const event of visibleEvents) {
      totals[event.severity] += 1;
    }

    return totals;
  }, [visibleEvents]);

  const telemetryCraft = craft === 'all' && selectedEvent ? selectedEvent.craft : craft;
  const telemetry = telemetryProfiles[telemetryCraft];
  const telemetryCraftLabel = telemetryCraft === 'all' ? 'All craft' : formatCraft(telemetryCraft);

  const crowdshipContext = useMemo(
    () => buildContext(craft, windowFilter, selectedEvent?.id ?? null),
    [craft, selectedEvent?.id, windowFilter],
  );

  const pressureReplay = selectedEvent ? pressureReplayProfiles[selectedEvent.id] ?? null : null;
  const pressurePath = pressureReplay ? buildPressurePath(pressureReplay) : '';
  const pressureValues = pressureReplay?.map((point) => point.pressure) ?? [];
  const pressureMin = pressureValues.length > 0 ? Math.min(...pressureValues) : null;
  const pressureMax = pressureValues.length > 0 ? Math.max(...pressureValues) : null;
  const pressureDip =
    pressureMin !== null && pressureMax !== null ? `${pressureMax - pressureMin} kPa swing` : null;
  const pressureWindowLabel = pressureReplay
    ? Array.from(new Set(pressureReplay.map((point) => phaseLabels[point.phase]))).join(' • ')
    : null;
  const selectedRequestSeed = useMemo<MissionRequestSeed>(() => {
    if (!selectedEvent?.anomalyKind) {
      return defaultMissionRequestSeed;
    }

    return missionRequestSeeds[selectedEvent.anomalyKind] ?? defaultMissionRequestSeed;
  }, [selectedEvent?.anomalyKind]);
  const crowdshipRequest = useMemo(
    () =>
      ({
        ...CROWDSHIP_REQUEST,
        title: selectedRequestSeed.requestTitle,
      }) as const,
    [selectedRequestSeed.requestTitle],
  );
  const notificationPanel = useMemo(
    () => buildNotificationPanel(notificationEntryState),
    [notificationEntryState],
  );

  useEffect(() => {
    if (selectedEvent && selectedEvent.id !== selectedEventId) {
      setSelectedEventId(selectedEvent.id);
    }
  }, [selectedEvent, selectedEventId]);

  useEffect(() => {
    window.__EXAMPLE_CROWDSHIP_CONTEXT__ = crowdshipContext;
    window.Crowdship?.setContext(crowdshipContext);
  }, [crowdshipContext]);

  useEffect(() => {
    let timeoutId: number | undefined;

    function markReady() {
      if (!window.Crowdship) {
        return false;
      }

      window.Crowdship.setContext(crowdshipContext);
      setCrowdshipStatus('ready');
      return true;
    }

    if (markReady()) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (markReady()) {
        window.clearInterval(intervalId);
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      }
    }, 250);

    timeoutId = window.setTimeout(() => {
      if (!window.Crowdship) {
        setCrowdshipStatus('unavailable');
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [crowdshipContext]);

  useEffect(() => {
    function syncNotificationEntryState() {
      setNotificationEntryState((currentState) =>
        currentState === 'requesting' ? currentState : getNotificationEntryState(),
      );
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        syncNotificationEntryState();
      }
    }

    syncNotificationEntryState();
    window.addEventListener('focus', syncNotificationEntryState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncNotificationEntryState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function openCrowdshipRequest() {
    window.__EXAMPLE_CROWDSHIP_CONTEXT__ = crowdshipContext;
    window.Crowdship?.setContext(crowdshipContext);
    window.Crowdship?.open(crowdshipRequest);
  }

  async function handleNotificationEntryPoint() {
    const currentState = getNotificationEntryState();
    setNotificationEntryState(currentState);

    if (currentState !== 'ready') {
      return;
    }

    setNotificationEntryState('requesting');

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationEntryState('enabled');
        return;
      }

      if (permission === 'denied') {
        setNotificationEntryState('blocked');
        return;
      }

      setNotificationEntryState(getNotificationEntryState());
    } catch (error: unknown) {
      console.warn('Notification permission request failed', error);
      setNotificationEntryState('error');
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="./mission" aria-label="Orbital Ops mission">
          <img src="./icons/icon-192.png" alt="" width="40" height="40" />
          <span>
            <strong>Orbital Ops</strong>
            <small>Mission telemetry</small>
          </span>
        </a>
        <div className="topbar-cluster">
          <span className={`widget-status widget-status--${crowdshipStatus}`} aria-live="polite">
            {crowdshipStatus === 'ready'
              ? 'Crowdship ready'
              : crowdshipStatus === 'unavailable'
                ? 'Crowdship unavailable'
                : 'Crowdship loading'}
          </span>
          <span className="route-chip route-chip--soft">Route /mission</span>
        </div>
      </header>

      <section className="mission-band" aria-labelledby="mission-title">
        <div className="mission-copy">
          <p className="eyebrow">Flight deck</p>
          <h1 id="mission-title">Astra-7 is threading a relay shadow with a tight hand on the throttle.</h1>
          <p className="intro">
            Watch the live pass, inspect the anomaly stack, and pin down what happened before the
            next burn opens.
          </p>
          <div className="context-row">
            <span className="route-chip">Route /mission</span>
            <span className="route-chip route-chip--soft">Craft {telemetryCraftLabel}</span>
            <span className="route-chip route-chip--soft">Window {windowLabels[windowFilter]}</span>
            <span className="route-chip route-chip--soft">
              Report {selectedEventPosition === '0/0' ? '0/0' : selectedEventPosition}
            </span>
          </div>
          <p className="mission-note">
            Pressure replay is already live where the mission needs it. The next upgrade is sharper
            anomaly context for the selected report.
          </p>
        </div>

        <div className="space-scene" aria-label="Current telemetry">
          <div className="star-layer star-layer--near" aria-hidden="true" />
          <div className="star-layer star-layer--far" aria-hidden="true" />
          <div className="scene-halo" aria-hidden="true" />
          <div className="scene-orbit scene-orbit--outer" aria-hidden="true" />
          <div className="scene-orbit scene-orbit--inner" aria-hidden="true" />
          <div className="scene-path" aria-hidden="true" />
          <div className="scene-wave scene-wave--one" aria-hidden="true" />
          <div className="scene-wave scene-wave--two" aria-hidden="true" />
          <div className="scene-gridline scene-gridline--vertical" aria-hidden="true" />
          <div className="scene-gridline scene-gridline--horizontal" aria-hidden="true" />
          <img
            className="orbiter-art"
            src="./assets/orbiter.png"
            alt=""
            width="160"
            height="160"
          />
          <div className="scene-hud">
            <span>
              {selectedEvent ? `${selectedEvent.title}` : 'Mission telemetry'}
            </span>
            <strong>
              Report {selectedEventPosition} • Packet loss {selectedEvent?.packetLoss ?? '0%'}
            </strong>
          </div>
          <dl className="scene-footer">
            <div className="scene-stat">
              <dt>Signal</dt>
              <dd>{telemetry.signal}</dd>
            </div>
            <div className="scene-stat">
              <dt>Battery</dt>
              <dd>{telemetry.battery}</dd>
            </div>
            <div className="scene-stat">
              <dt>Thermal</dt>
              <dd>{telemetry.thermal}</dd>
            </div>
            <div className="scene-stat">
              <dt>Latency</dt>
              <dd>{telemetry.latency}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mission-strip" aria-label="Mission summary">
        <article className="mission-stat">
          <span>Visible reports</span>
          <strong>{visibleEvents.length}</strong>
          <small>{severityCounts.critical} critical, {severityCounts.watch} watch, {severityCounts.stable} stable</small>
        </article>
        <article className="mission-stat">
          <span>Focus craft</span>
          <strong>{telemetryCraftLabel}</strong>
          <small>Window {windowLabels[windowFilter]}</small>
        </article>
        <article className="mission-stat">
          <span>Current tempo</span>
          <strong>{selectedEvent?.timestamp ?? 'T+00:00'}</strong>
          <small>{selectedEvent?.severity ? formatSeverity(selectedEvent.severity) : 'Waiting for selection'}</small>
        </article>
        <article className="mission-stat mission-stat--export">
          <span>Replay status</span>
          <strong>{pressureReplay ? 'Pressure replay online' : 'No pressure replay'}</strong>
          <small>
            {pressureReplay
              ? `${selectedEvent?.title ?? 'Selected anomaly'} now includes before, during, and after pressure context. Relay-shadow timing still needs its own layer.`
              : selectedEvent?.nextStep ?? 'Pick a report to inspect anomaly-linked pressure context.'}
          </small>
        </article>
      </section>

      <section className="request-strip" aria-labelledby="request-title">
        <div>
          <p className="eyebrow">Contribution opportunity</p>
          <h2 id="request-title">{selectedRequestSeed.headline}</h2>
          <p className="intro">{selectedRequestSeed.detail}</p>
          <div className="context-row">
            <span className="context-chip">{selectedRequestSeed.status}</span>
          </div>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openCrowdshipRequest}
          disabled={crowdshipStatus !== 'ready'}
        >
          {selectedRequestSeed.buttonLabel}
        </button>
      </section>

      <section className="notification-strip" aria-labelledby="notification-title">
        <div className="notification-copy">
          <div className="notification-heading">
            <div>
              <p className="eyebrow">Phone workflow</p>
              <h2 id="notification-title">Mission alerts wait for your say-so.</h2>
            </div>
            <span
              className={`alert-status alert-status--${notificationPanel.tone}`}
              aria-live="polite"
            >
              {notificationPanel.statusLabel}
            </span>
          </div>
          <p className="intro">
            Orbital Ops only uses alerts for preview ready, request needs review, feature shipped,
            and admin action needed.
          </p>
          <div className="alert-moments" role="list" aria-label="Mission alert moments">
            {alertMoments.map((moment) => (
              <span key={moment} className="alert-moment" role="listitem">
                {moment}
              </span>
            ))}
          </div>
        </div>
        <div className="notification-actions">
          <button
            className="primary-button"
            type="button"
            onClick={handleNotificationEntryPoint}
            disabled={notificationPanel.actionDisabled}
          >
            {notificationPanel.actionLabel}
          </button>
          <p className="notification-detail" aria-live="polite">
            {notificationPanel.detail}
          </p>
        </div>
      </section>

      <section className="toolbar" aria-label="Mission filters">
        <label>
          <span>Craft</span>
          <select value={craft} onChange={(event) => setCraft(event.target.value as CraftFilter)}>
            {Object.entries(craftLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Window</span>
          <select
            value={windowFilter}
            onChange={(event) => setWindowFilter(event.target.value as WindowFilter)}
          >
            {Object.entries(windowLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="ops-grid">
        <section className="event-band" aria-labelledby="event-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Mission reports</p>
              <h2 id="event-title">Relay watchlist</h2>
            </div>
            <div className="context-chip" aria-label="Visible report count">
              {visibleEvents.length} visible
            </div>
          </div>

          {visibleEvents.length > 0 ? (
            <div className="event-list" role="list">
              {visibleEvents.map((event) => {
                const isSelected = event.id === selectedEvent?.id;

                return (
                  <button
                    key={event.id}
                    className={`event-row event-row--${event.severity}${
                      isSelected ? ' event-row--selected' : ''
                    }`}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="event-row__main">
                      <span className="event-row__eyebrow">
                        {formatCraft(event.craft)} / {windowLabels[event.window]}
                      </span>
                      <strong>{event.title}</strong>
                      <span>{event.summary}</span>
                    </div>
                    <div className="event-row__meta">
                      <span className="event-row__tag event-row__tag--severity">
                        {formatSeverity(event.severity)}
                      </span>
                      <span className="event-row__tag">Packet {event.packetLoss}</span>
                      <span className="event-row__tag">Latency {event.latency}</span>
                      <span className="event-row__tag event-row__tag--time">{event.timestamp}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No reports in this window</strong>
              <span>Change the craft or time window to load another pass.</span>
            </div>
          )}
        </section>

        <section className="detail-band" aria-labelledby="detail-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Selected report</p>
              <h2 id="detail-title">{selectedEvent?.title ?? 'Nothing selected'}</h2>
            </div>
          </div>

          {selectedEvent ? (
            <div className="detail-stack">
              <div className="detail-grid">
                <p className="detail-lead">{selectedEvent.summary}</p>
                <p>{selectedEvent.nextStep}</p>
                <dl>
                  <div>
                    <dt>Craft</dt>
                    <dd>{formatCraft(selectedEvent.craft)}</dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{selectedEvent.signal}</dd>
                  </div>
                  <div>
                    <dt>Packet loss</dt>
                    <dd>{selectedEvent.packetLoss}</dd>
                  </div>
                  <div>
                    <dt>Latency</dt>
                    <dd>{selectedEvent.latency}</dd>
                  </div>
                </dl>
              </div>

              {pressureReplay ? (
                <section className="pressure-widget" aria-labelledby="pressure-title">
                  <div className="section-heading section-heading--tight">
                    <div>
                      <p className="eyebrow">Pressure replay</p>
                      <h3 id="pressure-title">Pressure trend around {selectedEvent.id}</h3>
                    </div>
                    <div className="context-chip">{pressureWindowLabel}</div>
                  </div>

                  <p className="pressure-widget__lead">
                    Compare pressure before, during, and after the selected anomaly without leaving
                    the mission workflow.
                  </p>

                  <div className="pressure-chart" role="img" aria-label={`Pressure trend comparison for ${selectedEvent.title}`}>
                    <div className="pressure-chart__phases" aria-hidden="true">
                      <span className="pressure-chart__phase pressure-chart__phase--before" />
                      <span className="pressure-chart__phase pressure-chart__phase--during" />
                      <span className="pressure-chart__phase pressure-chart__phase--after" />
                    </div>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <path className="pressure-chart__line" d={pressurePath} />
                      {pressureReplay.map((point, index) => {
                        const x = pressureReplay.length === 1 ? 50 : (index / (pressureReplay.length - 1)) * 100;
                        const maxPressure = Math.max(...pressureReplay.map((entry) => entry.pressure));
                        const minPressure = Math.min(...pressureReplay.map((entry) => entry.pressure));
                        const range = Math.max(maxPressure - minPressure, 1);
                        const y = 100 - ((point.pressure - minPressure) / range) * 100;

                        return (
                          <circle
                            key={`${point.label}-${point.phase}`}
                            className={`pressure-chart__point pressure-chart__point--${point.phase}`}
                            cx={x}
                            cy={y}
                            r="2.2"
                          />
                        );
                      })}
                    </svg>
                    <div className="pressure-chart__labels" aria-hidden="true">
                      {pressureReplay.map((point) => (
                        <span key={point.label}>{point.label}</span>
                      ))}
                    </div>
                  </div>

                  <dl className="pressure-metrics">
                    <div>
                      <dt>Peak pressure</dt>
                      <dd>{pressureMax} kPa</dd>
                    </div>
                    <div>
                      <dt>Lowest pressure</dt>
                      <dd>{pressureMin} kPa</dd>
                    </div>
                    <div>
                      <dt>Replay spread</dt>
                      <dd>{pressureDip}</dd>
                    </div>
                  </dl>

                  <div className="pressure-phases" role="list" aria-label="Pressure replay phases">
                    {(['before', 'during', 'after'] as const).map((phase) => {
                      const points = pressureReplay.filter((point) => point.phase === phase);
                      if (points.length === 0) {
                        return null;
                      }

                      const average = Math.round(
                        points.reduce((total, point) => total + point.pressure, 0) / points.length,
                      );

                      return (
                        <div key={phase} className={`pressure-phase pressure-phase--${phase}`} role="listitem">
                          <span>{phaseLabels[phase]}</span>
                          <strong>{average} kPa avg</strong>
                          <small>
                            {points[0].label} to {points[points.length - 1].label}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <div className="empty-state">
                  <strong>No anomaly pressure comparison</strong>
                  <span>
                    Select a signal-drop anomaly to view pressure before, during, and after the
                    event window.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No report selected</strong>
              <span>Pick a report to inspect the latest telemetry.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

declare global {
  interface Window {
    __EXAMPLE_CROWDSHIP_CONTEXT__?: CrowdshipContext;
    Crowdship?: {
      open: (request: { title?: string; type: 'feature_request' }) => void;
      setContext: (context: CrowdshipContext) => void;
    };
  }
}
