/**
 * Maren's morning round: which pipe first, then which, and why. Pure function — no database,
 * no clock (`now` is a parameter) — so it can be checked with `morning-round.check.ts`.
 */
import {
  EMERGENCY_FLOW_PERCENT,
  EMERGENCY_PRESSURE_PSI,
  FAMILIES_BY_LANDMARK,
  IMPOSSIBLE_FLOW_FACTOR,
  MISMATCH_TOLERANCE,
  NOBODY_DOWNSTREAM,
  PEOPLE_FIRST,
  REPAIRS_PER_DAY,
  ROOT_LANDMARK,
  STALE_AFTER_MS,
  STATUS_ORDER,
  WORRY_FLOW_PERCENT,
  WORRY_PRESSURE_PSI,
} from './morning-round-config';

export type Status = (typeof STATUS_ORDER)[number];
/** READINGS = status comes from flow/pressure; the others explain UNKNOWN or CHECK. */
export type ReasonCode = 'READINGS' | 'NO_SENSOR' | 'MISSING' | 'STALE' | 'NEGATIVE' | 'OVER_NOMINAL' | 'SENSOR_VS_PIPE';

/** CAP may hand Decimals over as strings. */
type Num = number | string | null | undefined;

export interface PipeInput {
  ID: string;
  pipeID: string;
  location?: string | null;
  startPoint?: string | null;
  endPoint?: string | null;
  nominalFlowRate?: Num;
  currentFlowRate?: Num;
  currentPressure?: Num;
  lastMaintenance?: string | null;
  mapPath?: string | null;
}

export interface SensorInput {
  pipe_ID?: string | null;
  sensorID?: string | null;
  flowRate?: Num;
  pressure?: Num;
  lastReading?: string | null;
}

export interface LandmarkInput {
  name: string;
  kind?: string | null;
  suppliedBy?: string | null;
}

export interface MorningRoundItem {
  pipeID: string;
  rank: number;
  /** One of the first REPAIRS_PER_DAY visits: what the crew does today. */
  today: boolean;
  status: Status;
  reasonCode: ReasonCode;
  location: string | null;
  sensorID: string | null;
  flowPercent: number | null;
  sensorFlow: number | null;
  sensorPressure: number | null;
  nominalFlow: number | null;
  pipeFlow: number | null;
  pipePressure: number | null;
  readingAt: string | null;
  readingAgeMinutes: number | null;
  /** Landmarks behind this pipe (it or a pipe further down supplies them), comma-separated. */
  affectedLandmarks: string;
  /** The most important landmark behind it (PEOPLE_FIRST), for the "why" sentence. */
  impactLandmark: string | null;
  impactKind: string | null;
  families: number | null;
  lastMaintenance: string | null;
  daysSinceMaintenance: number | null;
  mapPath: string | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
// Flow % is a division; keep exactly 80 % (or 50 %) out of the "below" bucket despite float noise.
const EPSILON = 1e-9;

function num(value: Num): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function differsClearly(a: number, b: number): boolean {
  return Math.abs(a - b) > MISMATCH_TOLERANCE * Math.max(Math.abs(a), Math.abs(b));
}

interface Assessment {
  status: Status;
  reasonCode: ReasonCode;
  flowPercent: number | null;
}

/** Rules 1, 2 and 6 for one pipe. Uses the sensor values (they carry a timestamp). */
export function assess(pipe: PipeInput, sensor: SensorInput | undefined, now: Date): Assessment {
  if (!sensor) return { status: 'UNKNOWN', reasonCode: 'NO_SENSOR', flowPercent: null };
  const flow = num(sensor.flowRate);
  const pressure = num(sensor.pressure);
  const nominal = num(pipe.nominalFlowRate);
  const readAt = sensor.lastReading ? Date.parse(sensor.lastReading) : NaN;
  if (flow === null || pressure === null || nominal === null || nominal <= 0 || Number.isNaN(readAt)) {
    return { status: 'UNKNOWN', reasonCode: 'MISSING', flowPercent: null };
  }
  const flowPercent = (flow * 100) / nominal;
  if (now.getTime() - readAt > STALE_AFTER_MS) return { status: 'UNKNOWN', reasonCode: 'STALE', flowPercent };

  const check = (reasonCode: ReasonCode): Assessment => ({ status: 'CHECK', reasonCode, flowPercent });
  if (flow < 0 || pressure < 0) return check('NEGATIVE');
  if (flow > nominal * IMPOSSIBLE_FLOW_FACTOR) return check('OVER_NOMINAL');
  const pipeFlow = num(pipe.currentFlowRate);
  const pipePressure = num(pipe.currentPressure);
  if ((pipeFlow !== null && differsClearly(flow, pipeFlow)) || (pipePressure !== null && differsClearly(pressure, pipePressure))) {
    return check('SENSOR_VS_PIPE');
  }

  const below = (value: number, limit: number): boolean => value < limit - EPSILON;
  const status: Status =
    below(flowPercent, EMERGENCY_FLOW_PERCENT) || below(pressure, EMERGENCY_PRESSURE_PSI)
      ? 'EMERGENCY'
      : below(flowPercent, WORRY_FLOW_PERCENT) || below(pressure, WORRY_PRESSURE_PSI)
        ? 'WORRY'
        : 'OK';
  return { status, reasonCode: 'READINGS', flowPercent };
}

/**
 * The network as a tree, walked from ROOT_LANDMARK along startPoint → endPoint. A pipe that ends at
 * an already-reached landmark (the backup loop back to the spring) is a leaf: nothing hangs behind it.
 */
function buildTree(pipes: readonly PipeInput[]): { depth: Map<string, number>; children: Map<string, PipeInput[]> } {
  const depth = new Map<string, number>();
  const children = new Map<string, PipeInput[]>();
  const feedingPipe = new Map<string, PipeInput | undefined>([[ROOT_LANDMARK, undefined]]);
  const queue = [ROOT_LANDMARK];
  for (let i = 0; i < queue.length; i++) {
    const landmark = queue[i];
    const parent = feedingPipe.get(landmark);
    for (const pipe of pipes.filter((p) => p.startPoint === landmark)) {
      depth.set(pipe.ID, parent ? (depth.get(parent.ID) ?? 0) + 1 : 0);
      if (parent) children.set(parent.ID, [...(children.get(parent.ID) ?? []), pipe]);
      if (pipe.endPoint && !feedingPipe.has(pipe.endPoint)) {
        feedingPipe.set(pipe.endPoint, pipe);
        queue.push(pipe.endPoint);
      }
    }
  }
  return { depth, children };
}

/**
 * Per pipe: every landmark it brings water to — its own end point and those further down the line,
 * plus the areas it or a downstream pipe supplies (`Landmarks.suppliedBy`). Used by the council page.
 */
export function servedLandmarks(pipes: readonly PipeInput[], landmarks: readonly LandmarkInput[]): Map<string, Set<string>> {
  const { children } = buildTree(pipes);
  const line = (pipe: PipeInput): PipeInput[] => [pipe, ...(children.get(pipe.ID) ?? []).flatMap(line)];
  return new Map(
    pipes.map((pipe) => {
      const down = line(pipe);
      const ids = new Set(down.map((p) => p.pipeID));
      const supplied = landmarks.filter((l) => l.suppliedBy && ids.has(l.suppliedBy)).map((l) => l.name);
      return [pipe.pipeID, new Set([...down.flatMap((p) => (p.endPoint ? [p.endPoint] : [])), ...supplied])];
    }),
  );
}

export function morningRound(
  pipes: readonly PipeInput[],
  sensors: readonly SensorInput[],
  landmarks: readonly LandmarkInput[],
  now: Date,
): MorningRoundItem[] {
  const { depth, children } = buildTree(pipes);
  const downstreamPipeIDs = (pipe: PipeInput): string[] => [
    pipe.pipeID,
    ...(children.get(pipe.ID) ?? []).flatMap(downstreamPipeIDs),
  ];
  // A pipe can have several sensors: use the latest reading.
  const latestSensor = (pipe: PipeInput): SensorInput | undefined =>
    sensors
      .filter((s) => s.pipe_ID === pipe.ID)
      .sort((a, b) => (b.lastReading ?? '').localeCompare(a.lastReading ?? ''))[0];

  const rows = pipes.map((pipe) => {
    const sensor = latestSensor(pipe);
    const { status, reasonCode, flowPercent } = assess(pipe, sensor, now);
    const behind = new Set(downstreamPipeIDs(pipe));
    const affected = landmarks.filter((l) => l.suppliedBy && behind.has(l.suppliedBy));
    const priorityOf = (name: string): number => {
      const i = PEOPLE_FIRST.indexOf(name);
      return i === -1 ? PEOPLE_FIRST.length : i;
    };
    const impact = [...affected].sort((a, b) => priorityOf(a.name) - priorityOf(b.name))[0];
    const readAt = sensor?.lastReading ? Date.parse(sensor.lastReading) : NaN;
    const maintainedAt = pipe.lastMaintenance ? Date.parse(pipe.lastMaintenance) : NaN;
    const item: MorningRoundItem = {
      pipeID: pipe.pipeID,
      rank: 0,
      today: false,
      status,
      reasonCode,
      location: pipe.location ?? null,
      sensorID: sensor?.sensorID ?? null,
      flowPercent: flowPercent === null ? null : Math.round(flowPercent),
      sensorFlow: num(sensor?.flowRate),
      sensorPressure: num(sensor?.pressure),
      nominalFlow: num(pipe.nominalFlowRate),
      pipeFlow: num(pipe.currentFlowRate),
      pipePressure: num(pipe.currentPressure),
      readingAt: sensor?.lastReading ?? null,
      readingAgeMinutes: Number.isNaN(readAt) ? null : Math.floor((now.getTime() - readAt) / 60_000),
      affectedLandmarks: affected.map((l) => l.name).join(', '),
      impactLandmark: impact?.name ?? null,
      impactKind: impact?.kind ?? null,
      families: impact ? (FAMILIES_BY_LANDMARK[impact.name] ?? null) : null,
      lastMaintenance: pipe.lastMaintenance ?? null,
      // Rule 5: shown as a detail only, never used for the order.
      daysSinceMaintenance: Number.isNaN(maintainedAt) ? null : Math.floor((now.getTime() - maintainedAt) / MS_PER_DAY),
      mapPath: pipe.mapPath ?? null,
    };
    return {
      item,
      // Maren: the backup loop always comes last of the visits, even in alarm — nobody depends on it.
      lastVisit: status !== 'OK' && !impact ? 1 : 0,
      severity: STATUS_ORDER.indexOf(status),
      people: impact ? priorityOf(impact.name) : priorityOf(NOBODY_DOWNSTREAM),
      depth: depth.get(pipe.ID) ?? Number.MAX_SAFE_INTEGER,
    };
  });

  // Rule 3 (upstream first) via depth: an upstream pipe has everyone of its downstream pipe behind
  // it too, so its people-priority is never worse — comparing depth after people is enough.
  const isOk = (row: { item: MorningRoundItem }): number => (row.item.status === 'OK' ? 1 : 0);
  rows.sort(
    (a, b) =>
      isOk(a) - isOk(b) ||
      a.lastVisit - b.lastVisit ||
      a.severity - b.severity ||
      a.people - b.people ||
      a.depth - b.depth ||
      a.item.pipeID.localeCompare(b.item.pipeID),
  );
  // Visits (not OK) are sorted first, so the first REPAIRS_PER_DAY rows that need a visit are today's.
  return rows.map((row, i) => ({ ...row.item, rank: i + 1, today: row.item.status !== 'OK' && i < REPAIRS_PER_DAY }));
}
