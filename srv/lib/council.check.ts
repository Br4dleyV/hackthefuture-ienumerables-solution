/**
 * Quick checks for the council page. Run: `docker compose exec app npx tsx srv/lib/council.check.ts`
 */
import assert from 'node:assert/strict';
import { councilActions, councilAreas, foodLevel, PANTRY, type FoodInput } from './council';
import { morningRound, servedLandmarks, type PipeInput, type SensorInput } from './morning-round';

const now = new Date('2026-11-24T06:00:00Z');
const P = (ID: string, pipeID: string, start: string, end: string, nominal: number, flow: number, pressure: number): PipeInput => ({
  ID, pipeID, startPoint: start, endPoint: end, nominalFlowRate: nominal, currentFlowRate: flow, currentPressure: pressure,
});
const S = (pipeID: string, flow: number, pressure: number): SensorInput => ({ pipe_ID: pipeID, flowRate: flow, pressure, lastReading: now.toISOString() });
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
const F = (name: string, stockStatus: string, daysUntilEmpty: number | null, leadDays: number, orderLate: boolean): FoodInput => ({
  itemID: name.toUpperCase(), name, stockStatus, daysUntilEmpty, leadDays, orderLate,
});
const food = [F('Eggs', 'PANIC', 3.33, 2, true), F('Butter', 'UNKNOWN', null, 2, false), F('Salt', 'OK', 75, 7, false)];

// Food: emergency delivery only when it runs out before a normal delivery could arrive.
assert.equal(foodLevel(F('Milk', 'OK', 0.5, 1, true)), 'URGENT');
assert.equal(foodLevel(F('Eggs', 'PANIC', 3.33, 2, true)), 'WORRY');
assert.equal(foodLevel(F('Salt', 'OK', 75, 7, false)), 'OK');

const round = morningRound(pipes, sensors, landmarks, now);
const served = servedLandmarks(pipes, landmarks);
assert.ok(served.get('PRIMARY-MAIN')?.has(mill)); // the main line also feeds the mill, via NORTH-BRANCH-01
assert.ok(!served.get('SECONDARY-LOOP')?.has('North Residential Area')); // the loop feeds nobody

assert.deepEqual(
  councilAreas(round, served, food).map((a) => `${a.area}:${a.level}`),
  [
    'North Residential Area:URGENT',
    'The Bakery:UNKNOWN', // sensor and pipe record clash — check first
    "Shepherd's Inn:UNKNOWN", // no pipe on record → never "all right"
    `${PANTRY}:UNKNOWN`, // butter at an impossible count
    'South Meadow Farms:WORRY',
    'Central Market Square:OK',
    'North Mill House:OK',
  ],
);
assert.deepEqual(
  councilActions(round, served, food).map((a) => `${a.kind}:${a.target}`),
  ['REPAIR:NORTH-BRANCH-02', 'CHECK_PIPE:BAKERY-BRANCH', 'CHECK_FOOD:Butter', 'REPAIR:SOUTH-BRANCH', 'ORDER:Eggs', 'REPAIR:SECONDARY-LOOP'],
);

console.log('council checks OK');
