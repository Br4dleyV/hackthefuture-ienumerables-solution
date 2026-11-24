/**
 * Quick checks for Maren's rules. Run: `docker compose exec app npx tsx srv/lib/morning-round.check.ts`
 * (prints "morning-round checks OK" or throws on the first failing assert).
 */
import assert from 'node:assert/strict';
import { assess, morningRound, type PipeInput, type SensorInput } from './morning-round';

const now = new Date('2026-11-24T06:00:00Z');
const ago = (ms: number): string => new Date(now.getTime() - ms).toISOString();
const pipe = (nominal: number): PipeInput => ({ ID: 'p', pipeID: 'P', nominalFlowRate: nominal });
const sensor = (flow: number, pressure: number, readAt = ago(0)): SensorInput => ({ pipe_ID: 'p', flowRate: flow, pressure, lastReading: readAt });

// Rule 1 — strictly below.
assert.equal(assess(pipe(50), sensor(40, 60), now).status, 'OK'); // exactly 80 %
assert.equal(assess(pipe(70), sensor(56, 60), now).status, 'OK'); // exactly 80 %, float-noisy division
assert.equal(assess(pipe(100), sensor(90, 40), now).status, 'OK'); // exactly 40 PSI
assert.equal(assess(pipe(100), sensor(79.9, 60), now).status, 'WORRY');
assert.equal(assess(pipe(100), sensor(90, 39.9), now).status, 'WORRY');
assert.equal(assess(pipe(1000), sensor(499, 60), now).status, 'EMERGENCY'); // 49.9 %
assert.equal(assess(pipe(100), sensor(90, 24.9), now).status, 'EMERGENCY');
assert.equal(assess(pipe(100), sensor(50, 60), now).status, 'WORRY'); // exactly 50 % is not EMERGENCY (but < 80 %)
assert.equal(assess(pipe(100), sensor(90, 25), now).status, 'WORRY'); // exactly 25 PSI is not EMERGENCY (but < 40)

// Rule 2 — stale or missing → UNKNOWN.
assert.equal(assess(pipe(100), sensor(90, 60, ago(15 * 60_000)), now).status, 'OK'); // exactly 15 min
assert.equal(assess(pipe(100), sensor(90, 60, ago(15 * 60_000 + 1000)), now).status, 'UNKNOWN'); // 15 min 1 s
assert.equal(assess(pipe(100), undefined, now).reasonCode, 'NO_SENSOR');
assert.equal(assess(pipe(100), { pipe_ID: 'p', flowRate: null, pressure: 60, lastReading: ago(0) }, now).reasonCode, 'MISSING');
assert.equal(assess({ ID: 'p', pipeID: 'P', nominalFlowRate: null }, sensor(90, 60), now).reasonCode, 'MISSING');

// Rule 6 — impossible numbers → CHECK, never OK.
assert.equal(assess(pipe(50), sensor(140, 47), now).reasonCode, 'OVER_NOMINAL');
assert.equal(assess(pipe(50), sensor(100, 47), now).status, 'OK'); // exactly double: Ilse only said "more than double" is impossible
assert.equal(assess(pipe(100), sensor(-1, 60), now).reasonCode, 'NEGATIVE');
assert.equal(assess({ ...pipe(100), currentFlowRate: 90 }, sensor(60, 60), now).reasonCode, 'SENSOR_VS_PIPE');

// The seed data → expected order from the interview.
const P = (ID: string, pipeID: string, start: string, end: string, nominal: number, flow: number, pressure: number): PipeInput => ({
  ID, pipeID, startPoint: start, endPoint: end, nominalFlowRate: nominal, currentFlowRate: flow, currentPressure: pressure,
});
const S = (pipeID: string, flow: number, pressure: number): SensorInput => ({ pipe_ID: pipeID, flowRate: flow, pressure, lastReading: ago(0) });
const spring = 'Silverbrook Spring', market = 'Central Market Square', mill = 'North Mill House';
const pipes = [
  P('1', 'PRIMARY-MAIN', spring, market, 150, 142, 58),
  P('2', 'NORTH-BRANCH-01', market, mill, 80, 76, 52),
  P('3', 'NORTH-BRANCH-02', mill, 'North Residential Area', 65, 20, 22),
  P('4', 'BAKERY-BRANCH', market, 'The Bakery', 50, 47, 47),
  P('5', 'SOUTH-BRANCH', market, 'South Meadow Farms', 60, 40, 38),
  P('6', 'SECONDARY-LOOP', mill, spring, 40, 12, 20),
];
const sensors = [S('1', 142, 58), S('2', 76, 52), S('3', 20, 22), S('4', 140, 47), S('5', 40, 38), S('6', 12, 20)];
const landmarks = [
  { name: 'North Residential Area', kind: 'residential', suppliedBy: 'NORTH-BRANCH-02' },
  { name: 'The Bakery', kind: 'bakery', suppliedBy: 'BAKERY-BRANCH' },
  { name: 'South Meadow Farms', kind: 'farm', suppliedBy: 'SOUTH-BRANCH' },
];
const round = morningRound(pipes, sensors, landmarks, now);
assert.deepEqual(
  round.map((i) => `${i.pipeID}:${i.status}`),
  // Backup loop last of the visits even in alarm (Maren); clashing numbers before "visit this week" (Ilse + Maren).
  ['NORTH-BRANCH-02:EMERGENCY', 'BAKERY-BRANCH:CHECK', 'SOUTH-BRANCH:WORRY', 'SECONDARY-LOOP:EMERGENCY', 'PRIMARY-MAIN:OK', 'NORTH-BRANCH-01:OK'],
);
// Maren: two repairs a day → the first two visits are today's; a pipe that is fine never is.
assert.deepEqual(round.filter((i) => i.today).map((i) => i.pipeID), ['NORTH-BRANCH-02', 'BAKERY-BRANCH']);
assert.equal(round[0].families, 140);
assert.equal(round[0].flowPercent, 31);
assert.equal(round.find((i) => i.pipeID === 'PRIMARY-MAIN')?.affectedLandmarks, 'North Residential Area, The Bakery, South Meadow Farms');

// Rule 3 — same line, both EMERGENCY: upstream NORTH-BRANCH-01 before NORTH-BRANCH-02.
const brokenUpstream = pipes.map((p) => (p.ID === '2' ? { ...p, currentFlowRate: 10, currentPressure: 10 } : p));
const sameLine = morningRound(brokenUpstream, sensors.map((s) => (s.pipe_ID === '2' ? S('2', 10, 10) : s)), landmarks, now);
assert.deepEqual(sameLine.slice(0, 2).map((i) => i.pipeID), ['NORTH-BRANCH-01', 'NORTH-BRANCH-02']);

// A sensor that stops reporting turns its pipe UNKNOWN, never OK.
const silent = morningRound(pipes, sensors.map((s) => (s.pipe_ID === '1' ? { ...s, lastReading: ago(16 * 60_000) } : s)), landmarks, now);
assert.equal(silent.find((i) => i.pipeID === 'PRIMARY-MAIN')?.status, 'UNKNOWN');
// Maren: "I don't know" comes after the emergencies, before "visit this week".
assert.deepEqual(
  silent.slice(0, 5).map((i) => `${i.pipeID}:${i.status}`),
  ['NORTH-BRANCH-02:EMERGENCY', 'PRIMARY-MAIN:UNKNOWN', 'BAKERY-BRANCH:CHECK', 'SOUTH-BRANCH:WORRY', 'SECONDARY-LOOP:EMERGENCY'],
);

console.log('morning-round checks OK');
