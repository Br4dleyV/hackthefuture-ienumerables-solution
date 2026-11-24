/**
 * Quick checks for the council page. Run: `docker compose exec app npx tsx srv/lib/council.check.ts`
 */
import assert from 'node:assert/strict';
import { councilActions, councilAreas, councilBudget, foodLevel, type FoodInput } from './council';
import { morningRound, servedLandmarks, type PipeInput, type SensorInput } from './morning-round';

const now = new Date('2026-11-24T06:00:00Z');
const P = (ID: string, pipeID: string, start: string, end: string, nominal: number, flow: number, pressure: number): PipeInput => ({
  ID, pipeID, location: `${start} → ${end}`, startPoint: start, endPoint: end, nominalFlowRate: nominal, currentFlowRate: flow, currentPressure: pressure,
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
    'South Meadow Farms:WORRY',
    'Central Market Square:OK',
    'North Mill House:OK',
    "Shepherd's Inn:OK", // own well (Rowan), and nobody goes hungry this week
  ],
);
// Tobin: flour, milk and butter → the bakery feels it first (butter's impossible count: we don't know if he can bake).
const bakery = (list: FoodInput[]) => councilAreas(round, served, list).find((a) => a.area === 'The Bakery');
assert.equal(bakery(food)?.foodCode, 'FOOD_UNSURE_BAKERY');
const milkShort = councilAreas(round, served, [...food, F('Milk', 'PANIC', 0.5, 1, true)]);
assert.equal(milkShort.find((a) => a.area === 'The Bakery')?.foodCode, 'FOOD_SHORT_BAKERY');
assert.equal(milkShort.find((a) => a.area === 'South Meadow Farms')?.foodCode, 'FOOD_OK'); // milk only stops the bakery
// Any other food running out counts for every part of the village (our choice — nobody could tell us more).
const applesShort = councilAreas(round, served, [F('Apples', 'PANIC', 2, 7, true)]);
assert.ok(applesShort.every((a) => a.level === 'URGENT' && a.foodCode.startsWith('FOOD_SHORT')));

const actions = councilActions(round, served, food);
assert.deepEqual(
  actions.map((a) => `${a.kind}:${a.target}:${a.cost}`),
  [
    'REPAIR:North Mill House → North Residential Area:120',
    'CHECK_PIPE:Central Market Square → The Bakery:0',
    'CHECK_FOOD:Butter:0',
    'REPAIR:Central Market Square → South Meadow Farms:120',
    'ORDER:Eggs:0',
    'REPAIR:North Mill House → Silverbrook Spring:120',
  ],
);
// The backup loop waits (nobody depends on it): its 120 crowns stay in reserve.
assert.deepEqual(actions.map((a) => a.advice), ['PAY', 'NO_CROWNS', 'NO_CROWNS', 'PAY', 'NO_CROWNS', 'CAN_WAIT']);
assert.deepEqual(councilBudget(actions), { ID: 'week', total: 500, spend: 240, left: 260, comparedWith: null });

// 500 crowns: four repairs fit (480), the fifth is "not this week"; the loop still waits.
const broken = pipes.map((p) => ({ ...p, currentFlowRate: 1, currentPressure: 1 }));
const allBroken = councilActions(morningRound(broken, sensors.map((s) => ({ ...s, flowRate: 1, pressure: 1 })), landmarks, now), served, food);
assert.deepEqual(allBroken.filter((a) => a.kind === 'REPAIR').map((a) => a.advice), ['PAY', 'PAY', 'PAY', 'PAY', 'NO_BUDGET', 'CAN_WAIT']);

// Better or worse than the last printed page.
const trends = councilAreas(round, served, food, new Map([['North Residential Area', 'OK'], ['South Meadow Farms', 'URGENT'], ['North Mill House', 'OK']]));
const trendOf = (area: string) => trends.find((a) => a.area === area)?.trend;
assert.equal(trendOf('North Residential Area'), 'WORSE');
assert.equal(trendOf('South Meadow Farms'), 'BETTER');
assert.equal(trendOf('North Mill House'), 'SAME');
assert.equal(trendOf('The Bakery'), 'NEW'); // not on the last page

console.log('council checks OK');
