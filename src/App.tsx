import { useEffect, useMemo, useState } from 'react';
import {
  missionEvents,
  telemetryProfiles,
  type CraftFilter,
  type MissionSeverity,
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

const CROWDSHIP_REQUEST = {
  title: 'Add anomaly replay for signal drops',
  type: 'feature_request' as const,
};

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

export function App() {
  const [craft, setCraft] = useState<CraftFilter>('all');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('last-30');
  const [selectedEventId, setSelectedEventId] = useState<string>('signal-drop-17');
  const [crowdshipStatus, setCrowdshipStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
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

  function openCrowdshipRequest() {
    window.__EXAMPLE_CROWDSHIP_CONTEXT__ = crowdshipContext;
    window.Crowdship?.setContext(crowdshipContext);
    window.Crowdship?.open(CROWDSHIP_REQUEST);
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
            The selected signal drop still needs inline replay on the mission surface.
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
          <span>Replay gap</span>
          <strong>Inline replay missing</strong>
          <small>
            {selectedEvent?.nextStep ?? 'Pick a report to inspect the replay gap before the next maneuver.'}
          </small>
        </article>
      </section>

      <section className="request-strip" aria-labelledby="request-title">
        <div>
          <p className="eyebrow">Contribution opportunity</p>
          <h2 id="request-title">Signal drops need inline replay.</h2>
          <p className="intro">
            The team can see the spike, but not the telemetry lead-in that explains it.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openCrowdshipRequest}
          disabled={crowdshipStatus !== 'ready'}
        >
          Request replay mode
        </button>
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
      open: (request: { title: string; type: 'feature_request' }) => void;
      setContext: (context: CrowdshipContext) => void;
    };
  }
}
