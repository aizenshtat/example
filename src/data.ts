export type Segment = 'all' | 'enterprise' | 'mid-market' | 'startup';
export type Period = 'last-7-days' | 'last-30-days' | 'quarter';
export type Status = 'healthy' | 'watch' | 'blocked';

export type ReportRow = {
  id: string;
  account: string;
  segment: Exclude<Segment, 'all'>;
  owner: string;
  period: Period;
  revenue: number;
  usage: number;
  status: Status;
  lastUpdated: string;
};

export const reportRows: ReportRow[] = [
  {
    id: 'report-7',
    account: 'Northwind Markets',
    segment: 'enterprise',
    owner: 'Maya',
    period: 'last-30-days',
    revenue: 218400,
    usage: 94,
    status: 'healthy',
    lastUpdated: '2026-04-18',
  },
  {
    id: 'report-12',
    account: 'Atlas Logistics',
    segment: 'enterprise',
    owner: 'Ilya',
    period: 'last-30-days',
    revenue: 184200,
    usage: 89,
    status: 'watch',
    lastUpdated: '2026-04-17',
  },
  {
    id: 'report-18',
    account: 'Brightline Studio',
    segment: 'mid-market',
    owner: 'Noa',
    period: 'last-7-days',
    revenue: 42800,
    usage: 71,
    status: 'healthy',
    lastUpdated: '2026-04-18',
  },
  {
    id: 'report-25',
    account: 'Cedar Health',
    segment: 'mid-market',
    owner: 'Ari',
    period: 'quarter',
    revenue: 126500,
    usage: 83,
    status: 'healthy',
    lastUpdated: '2026-04-16',
  },
  {
    id: 'report-31',
    account: 'Luma Foods',
    segment: 'startup',
    owner: 'Dina',
    period: 'last-30-days',
    revenue: 26800,
    usage: 58,
    status: 'blocked',
    lastUpdated: '2026-04-15',
  },
  {
    id: 'report-42',
    account: 'Orbit Analytics',
    segment: 'enterprise',
    owner: 'Sam',
    period: 'quarter',
    revenue: 301900,
    usage: 97,
    status: 'healthy',
    lastUpdated: '2026-04-18',
  },
];
