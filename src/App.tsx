import { useMemo, useState } from 'react';
import { reportRows, type Period, type Segment } from './data';

const periodLabels: Record<Period, string> = {
  'last-7-days': 'Last 7 days',
  'last-30-days': 'Last 30 days',
  quarter: 'Quarter',
};

const segmentLabels: Record<Segment, string> = {
  all: 'All segments',
  enterprise: 'Enterprise',
  'mid-market': 'Mid-market',
  startup: 'Startup',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function statusLabel(status: string) {
  if (status === 'watch') {
    return 'Needs review';
  }

  if (status === 'blocked') {
    return 'Blocked';
  }

  return 'Healthy';
}

export function App() {
  const [segment, setSegment] = useState<Segment>('enterprise');
  const [period, setPeriod] = useState<Period>('last-30-days');
  const [showContributionPanel, setShowContributionPanel] = useState(false);

  const filteredRows = useMemo(() => {
    return reportRows.filter((row) => {
      const segmentMatches = segment === 'all' || row.segment === segment;
      const periodMatches = row.period === period;
      return segmentMatches && periodMatches;
    });
  }, [period, segment]);

  const revenue = filteredRows.reduce((total, row) => total + row.revenue, 0);
  const averageUsage = filteredRows.length
    ? Math.round(
        filteredRows.reduce((total, row) => total + row.usage, 0) /
          filteredRows.length,
      )
    : 0;

  const safeContext = {
    activeFilters: {
      period,
      segment,
    },
    appVersion: '2026.04.18',
    route: '/reports',
    selectedObjectId: filteredRows[0]?.id ?? null,
    selectedObjectType: 'report',
  };

  window.__EXAMPLE_CROWDSHIP_CONTEXT__ = safeContext;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Example Reports home">
          <img src="/icons/icon-192.png" alt="" width="40" height="40" />
          <span>
            <strong>Example Reports</strong>
            <small>Customer revenue workspace</small>
          </span>
        </a>
        <button
          className="ghost-button"
          type="button"
          onClick={() => setShowContributionPanel(true)}
        >
          Suggest a change
        </button>
      </header>

      <section className="summary-band" aria-labelledby="reports-title">
        <div>
          <p className="eyebrow">Reports</p>
          <h1 id="reports-title">Weekly customer performance review</h1>
          <p className="intro">
            Filter accounts, inspect revenue movement, and prepare the Friday
            finance handoff.
          </p>
        </div>
        <div className="missing-workflow" aria-labelledby="missing-title">
          <span className="status-pill">Missing workflow</span>
          <h2 id="missing-title">CSV export is not available yet</h2>
          <p>
            Finance needs this filtered table every week. Today the team copies
            rows manually after applying filters.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => setShowContributionPanel(true)}
          >
            Request CSV export
          </button>
        </div>
      </section>

      <section className="filters" aria-label="Report filters">
        <label>
          <span>Segment</span>
          <select
            value={segment}
            onChange={(event) => setSegment(event.target.value as Segment)}
          >
            {Object.entries(segmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Period</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="metrics" aria-label="Filtered report summary">
        <article>
          <span>Filtered accounts</span>
          <strong>{filteredRows.length}</strong>
        </article>
        <article>
          <span>Revenue</span>
          <strong>{formatCurrency(revenue)}</strong>
        </article>
        <article>
          <span>Average usage</span>
          <strong>{averageUsage}%</strong>
        </article>
      </section>

      <section className="report-section" aria-labelledby="table-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Filtered data</p>
            <h2 id="table-title">Accounts in review</h2>
          </div>
          <div className="context-chip" aria-label="Safe Crowdship context">
            Context ready for Crowdship
          </div>
        </div>

        {filteredRows.length > 0 ? (
          <div className="report-list">
            {filteredRows.map((row) => (
              <article className="report-row" key={row.id}>
                <div>
                  <strong>{row.account}</strong>
                  <span>
                    {segmentLabels[row.segment]} · Owner {row.owner}
                  </span>
                </div>
                <div>
                  <span>Revenue</span>
                  <strong>{formatCurrency(row.revenue)}</strong>
                </div>
                <div>
                  <span>Usage</span>
                  <strong>{row.usage}%</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{statusLabel(row.status)}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{row.lastUpdated}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No reports match these filters</strong>
            <span>Adjust the segment or period to continue the review.</span>
          </div>
        )}
      </section>

      {showContributionPanel ? (
        <aside
          className="contribution-panel open"
          aria-labelledby="contribution-title"
          role="dialog"
        >
          <div className="panel-content">
            <button
              className="panel-close"
              type="button"
              onClick={() => setShowContributionPanel(false)}
              aria-label="Close contribution panel"
            >
              Close
            </button>
            <p className="eyebrow">Crowdship entry point</p>
            <h2 id="contribution-title">This screen is ready for the widget</h2>
            <p>
              The next Crowdship slice will load the real widget here. This app
              already exposes safe report context without source code, cookies,
              or private records.
            </p>
            <dl>
              <div>
                <dt>Route</dt>
                <dd>{safeContext.route}</dd>
              </div>
              <div>
                <dt>Segment</dt>
                <dd>{segmentLabels[segment]}</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd>{periodLabels[period]}</dd>
              </div>
              <div>
                <dt>First report</dt>
                <dd>{safeContext.selectedObjectId ?? 'None'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      ) : null}
    </main>
  );
}

declare global {
  interface Window {
    __EXAMPLE_CROWDSHIP_CONTEXT__?: {
      activeFilters: {
        period: Period;
        segment: Segment;
      };
      appVersion: string;
      route: string;
      selectedObjectId: string | null;
      selectedObjectType: string;
    };
  }
}
