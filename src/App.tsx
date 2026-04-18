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

  const crowdshipContext = useMemo(
    () => buildContext(craft, windowFilter, selectedEvent?.id ?? null),
    [craft, selectedEvent?.id, windowFilter],
  );

  const telemetryCraft = craft === 'all' && selectedEvent ? selectedEvent.craft : craft;
  const telemetry = telemetryProfiles[telemetryCraft];

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
        <a className="brand" href="/" aria-label="Orbital Ops home">
          <img src="/icons/icon-192.png" alt="" width="40" height="40" />
          <span>
            <strong>Orbital Ops</strong>
            <small>Mission telemetry</small>
          </span>
        </a>
        <span className={`widget-status widget-status--${crowdshipStatus}`} aria-live="polite">
          {crowdshipStatus === 'ready'
            ? 'Crowdship ready'
            : crowdshipStatus === 'unavailable'
              ? 'Crowdship unavailable'
              : 'Crowdship loading'}
        </span>
      </header>

      <section className="mission-band" aria-labelledby="mission-title">
        <div className="mission-copy">
          <p className="eyebrow">Live pass</p>
          <h1 id="mission-title">Astra-7 is inside a noisy relay window.</h1>
          <p className="intro">
            Watch signal loss, thermal drift, and battery recovery before the next command uplink.
          </p>
          <div className="context-row">
            <span className="route-chip">Route /mission</span>
            <span className="route-chip route-chip--soft">
              Selected {selectedEvent?.title ?? 'none'}
            </span>
          </div>
        </div>

        <div className="space-scene" aria-label="Current telemetry">
          <div className="star-layer star-layer--near" aria-hidden="true" />
          <div className="star-layer star-layer--far" aria-hidden="true" />
          <div className="planet-arc" aria-hidden="true" />
          <div className="relay-line" aria-hidden="true" />
          <span className="signal-ping signal-ping--one" aria-hidden="true" />
          <span className="signal-ping signal-ping--two" aria-hidden="true" />
          <img
            className="orbiter-art"
            src="/assets/orbiter.png"
            alt=""
            width="160"
            height="160"
          />
          <div className="scene-hud">
            <span>Europa relay</span>
            <strong>Packet loss {selectedEvent?.packetLoss ?? '0%'}</strong>
          </div>
          <dl className="telemetry-grid">
            <div>
              <dt>Signal</dt>
              <dd>{telemetry.signal}</dd>
            </div>
            <div>
              <dt>Battery</dt>
              <dd>{telemetry.battery}</dd>
            </div>
            <div>
              <dt>Thermal</dt>
              <dd>{telemetry.thermal}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{telemetry.latency}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="request-strip" aria-labelledby="request-title">
        <div>
          <p className="eyebrow">Contribution opportunity</p>
          <h2 id="request-title">Signal drops need replay.</h2>
          <p className="intro">
            The team can see the spike, but not the telemetry frames that led into it.
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={openCrowdshipRequest}
          disabled={crowdshipStatus !== 'ready'}
        >
          Suggest replay mode
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
              <p className="eyebrow">Anomalies</p>
              <h2 id="event-title">Relay watchlist</h2>
            </div>
            <div className="context-chip" aria-label="Visible anomaly count">
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
                      <strong>{event.title}</strong>
                      <span>{event.summary}</span>
                    </div>
                    <div className="event-row__meta">
                      <span>{formatCraft(event.craft)}</span>
                      <span>{formatSeverity(event.severity)}</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No anomalies in this window</strong>
              <span>Change the craft or time window to load another pass.</span>
            </div>
          )}
        </section>

        <section className="detail-band" aria-labelledby="detail-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Selected anomaly</p>
              <h2 id="detail-title">{selectedEvent?.title ?? 'Nothing selected'}</h2>
            </div>
          </div>

          {selectedEvent ? (
            <div className="detail-grid">
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
              <strong>No anomaly selected</strong>
              <span>Pick an anomaly to inspect the latest telemetry.</span>
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
