export type CraftFilter = 'all' | 'astra-7' | 'lumen-3' | 'mira-2';
export type WindowFilter = 'last-30' | 'last-6h' | 'europa-pass';
export type MissionSeverity = 'critical' | 'watch' | 'stable';
export type PressureSeverity = 'normal' | 'warning' | 'critical';

export type CabinPressure = {
  value: string | null;
  severity: PressureSeverity | null;
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
  cabinPressure: CabinPressure;
};

export type MissionTelemetry = {
  signal: string;
  battery: string;
  thermal: string;
  latency: string;
  cabinPressure: CabinPressure;
};

export const telemetryProfiles: Record<CraftFilter, MissionTelemetry> = {
  all: {
    signal: '72%',
    battery: '64%',
    thermal: '-18 C',
    latency: '690 ms',
    cabinPressure: {
      value: '14.2 psi',
      severity: 'warning',
    },
  },
  'astra-7': {
    signal: '42%',
    battery: '61%',
    thermal: '-28 C',
    latency: '940 ms',
    cabinPressure: {
      value: '11.8 psi',
      severity: 'critical',
    },
  },
  'lumen-3': {
    signal: '88%',
    battery: '73%',
    thermal: '-12 C',
    latency: '420 ms',
    cabinPressure: {
      value: '14.7 psi',
      severity: 'normal',
    },
  },
  'mira-2': {
    signal: '79%',
    battery: '58%',
    thermal: '-21 C',
    latency: '610 ms',
    cabinPressure: {
      value: null,
      severity: null,
    },
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
    nextStep: 'Replay the drop against the last clean telemetry frame before command uplink.',
    signal: '42%',
    packetLoss: '18%',
    latency: '940 ms',
    timestamp: 'T+14:08',
    cabinPressure: {
      value: '11.8 psi',
      severity: 'critical',
    },
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
    cabinPressure: {
      value: '14.1 psi',
      severity: 'warning',
    },
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
    cabinPressure: {
      value: '14.7 psi',
      severity: 'normal',
    },
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
    cabinPressure: {
      value: null,
      severity: null,
    },
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
    cabinPressure: {
      value: '14.9 psi',
      severity: 'normal',
    },
  },
];
