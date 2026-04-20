export type CraftFilter = 'all' | 'astra-7' | 'lumen-3' | 'mira-2';
export type WindowFilter = 'last-30' | 'last-6h' | 'europa-pass';
export type MissionSeverity = 'critical' | 'watch' | 'stable';

export type PressureReplayPoint = {
  label: string;
  pressure: number;
  phase: 'before' | 'during' | 'after';
};

export type MissionRequestSeed = {
  buttonLabel: string;
  detail: string;
  headline: string;
  requestTitle: string;
  status: string;
};

export type MissionEvent = {
  id: string;
  title: string;
  craft: Exclude<CraftFilter, 'all'>;
  window: WindowFilter;
  severity: MissionSeverity;
  summary: string;
  nextStep: string;
  signal: string;
  packetLoss: string;
  latency: string;
  timestamp: string;
  anomalyKind?: 'signal-drop' | 'thermal-drift' | 'battery-recovery' | 'relay-handshake' | 'payload-idle';
};

export type MissionTelemetry = {
  signal: string;
  battery: string;
  thermal: string;
  latency: string;
};

export const telemetryProfiles: Record<CraftFilter, MissionTelemetry> = {
  all: {
    signal: '72%',
    battery: '64%',
    thermal: '-18 C',
    latency: '690 ms',
  },
  'astra-7': {
    signal: '42%',
    battery: '61%',
    thermal: '-28 C',
    latency: '940 ms',
  },
  'lumen-3': {
    signal: '88%',
    battery: '73%',
    thermal: '-12 C',
    latency: '420 ms',
  },
  'mira-2': {
    signal: '79%',
    battery: '58%',
    thermal: '-21 C',
    latency: '610 ms',
  },
};

export const missionEvents: MissionEvent[] = [
  {
    id: 'signal-drop-17',
    title: 'Signal drop over Europa relay',
    craft: 'astra-7',
    window: 'last-30',
    severity: 'critical',
    summary: 'Packet loss spiked as Astra-7 crossed behind the Europa relay shadow.',
    nextStep: 'Line up the live pressure replay with relay-shadow entry and reacquisition markers before command uplink.',
    signal: '42%',
    packetLoss: '18%',
    latency: '940 ms',
    timestamp: 'T+14:08',
    anomalyKind: 'signal-drop',
  },
  {
    id: 'thermal-drift-04',
    title: 'Thermal drift near aft bus',
    craft: 'astra-7',
    window: 'last-6h',
    severity: 'watch',
    summary: 'Aft bus temperature is still inside limits but trending colder each pass.',
    nextStep: 'Hold heater bias until the next sun-side confirmation arrives.',
    signal: '71%',
    packetLoss: '4%',
    latency: '680 ms',
    timestamp: 'T+10:42',
    anomalyKind: 'thermal-drift',
  },
  {
    id: 'battery-recovery-12',
    title: 'Battery recovery after trim burn',
    craft: 'lumen-3',
    window: 'last-30',
    severity: 'stable',
    summary: 'Battery voltage recovered after the trim burn and the payload stayed online.',
    nextStep: 'Keep Lumen-3 on the nominal charge profile through the next window.',
    signal: '91%',
    packetLoss: '1%',
    latency: '410 ms',
    timestamp: 'T+07:19',
    anomalyKind: 'battery-recovery',
  },
  {
    id: 'relay-handshake-09',
    title: 'Relay handshake retry loop',
    craft: 'mira-2',
    window: 'europa-pass',
    severity: 'watch',
    summary: 'Mira-2 retried the relay handshake three times before lock.',
    nextStep: 'Compare retry timing with the same Europa pass from the previous orbit.',
    signal: '76%',
    packetLoss: '6%',
    latency: '630 ms',
    timestamp: 'T+03:51',
    anomalyKind: 'relay-handshake',
  },
  {
    id: 'payload-idle-22',
    title: 'Payload idle during clean downlink',
    craft: 'lumen-3',
    window: 'last-6h',
    severity: 'stable',
    summary: 'The spectrometer stayed idle while the downlink window was clean.',
    nextStep: 'Queue one low-risk calibration burst for the next clean window.',
    signal: '86%',
    packetLoss: '2%',
    latency: '440 ms',
    timestamp: 'T+01:27',
    anomalyKind: 'payload-idle',
  },
];

export const pressureReplayProfiles: Partial<Record<string, PressureReplayPoint[]>> = {
  'signal-drop-17': [
    { label: 'T-12', pressure: 94, phase: 'before' },
    { label: 'T-09', pressure: 95, phase: 'before' },
    { label: 'T-06', pressure: 93, phase: 'before' },
    { label: 'T-03', pressure: 92, phase: 'before' },
    { label: 'T±00', pressure: 84, phase: 'during' },
    { label: 'T+03', pressure: 81, phase: 'during' },
    { label: 'T+06', pressure: 87, phase: 'after' },
    { label: 'T+09', pressure: 91, phase: 'after' },
    { label: 'T+12', pressure: 93, phase: 'after' },
  ],
};

export const missionRequestSeeds: Record<
  NonNullable<MissionEvent['anomalyKind']>,
  MissionRequestSeed
> = {
  'signal-drop': {
    buttonLabel: 'Request shadow markers',
    detail:
      'Pressure replay is live, but ops still cannot line up eclipse entry, deepest occlusion, and reacquisition on the same anomaly timeline.',
    headline: 'Signal drops need relay-shadow markers.',
    requestTitle: 'Add relay-shadow markers to signal-drop replay',
    status: 'Pressure replay live',
  },
  'thermal-drift': {
    buttonLabel: 'Request forecast bands',
    detail:
      'The deck shows the drift, but it cannot project the next three dark-side passes against heater limits.',
    headline: 'Thermal drift needs a cold-soak forecast.',
    requestTitle: 'Add cold-soak forecast bands for thermal drift',
    status: 'Current drift live',
  },
  'battery-recovery': {
    buttonLabel: 'Request burn markers',
    detail:
      'Battery recovery is visible, but the team cannot line up trim-burn start, payload wake, and nominal charge return.',
    headline: 'Recovery traces need burn markers.',
    requestTitle: 'Add burn markers to battery recovery view',
    status: 'Recovery trace live',
  },
  'relay-handshake': {
    buttonLabel: 'Request orbit overlay',
    detail:
      'Retry counts are visible, but ops cannot overlay this Europa pass with the previous orbit without leaving the deck.',
    headline: 'Retry loops need a prior-orbit overlay.',
    requestTitle: 'Add prior-orbit overlay for relay handshake retries',
    status: 'Retry loop live',
  },
  'payload-idle': {
    buttonLabel: 'Request burst planner',
    detail:
      'The quiet window is visible, but there is no planner that recommends the safest burst for the next clean pass.',
    headline: 'Clean downlinks need a calibration planner.',
    requestTitle: 'Add a calibration burst planner for clean downlinks',
    status: 'Window status live',
  },
};

export const defaultMissionRequestSeed = missionRequestSeeds['signal-drop'];
