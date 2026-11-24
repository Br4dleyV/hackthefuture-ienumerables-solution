/**
 * Rowan's Monday page: is each part of the village all right, and where should this week's money go?
 * Pure functions on top of Maren's morning round and Tobin's pantry outlook — checked in council.check.ts.
 */
import type { MorningRoundItem, Status } from './morning-round';

// Rowan said: the council thinks in these parts of the village.
export const COUNCIL_AREAS: readonly string[] = [
  'North Residential Area',
  'The Bakery',
  'South Meadow Farms',
  'Central Market Square',
  'North Mill House',
  "Shepherd's Inn",
];

/** Key of the extra row for the village pantry (food is one pantry for the whole village). */
export const PANTRY = 'PANTRY';
// OPEN QUESTION — confirm with Rowan: does a food shortage hit the whole village or some parts first?
// For now: one "village pantry" row next to the six parts instead of copying it into every part.

/** Worst first. UNKNOWN sits above WORRY, like Maren's "someone has to go and look". */
export type Level = 'URGENT' | 'UNKNOWN' | 'WORRY' | 'OK';
const LEVELS: readonly Level[] = ['URGENT', 'UNKNOWN', 'WORRY', 'OK'];
const worse = (a: Level, b: Level): Level => (LEVELS.indexOf(a) <= LEVELS.indexOf(b) ? a : b);

const PIPE_LEVEL: Record<Status, Level> = { EMERGENCY: 'URGENT', UNKNOWN: 'UNKNOWN', CHECK: 'UNKNOWN', WORRY: 'WORRY', OK: 'OK' };

export interface FoodInput {
  itemID: string;
  name: string;
  stockStatus: string;
  daysUntilEmpty: number | null;
  leadDays: number;
  orderLate: boolean;
}

export interface AreaRow {
  area: string;
  rank: number;
  level: Level;
  reasonCode: string;
  subjects: string;
}

export type ActionKind = 'REPAIR' | 'CHECK_PIPE' | 'CHECK_FOOD' | 'EMERGENCY_DELIVERY' | 'ORDER';

export interface ActionRow {
  ID: string;
  rank: number;
  kind: ActionKind;
  level: Level;
  target: string;
  areas: string;
  families: number | null;
  days: number | null;
  leadDays: number | null;
}

/**
 * Rowan: "nobody goes hungry this week". URGENT = runs out before a normal delivery could arrive
 * (the council pays for an emergency delivery); WORRY = low, but Tobin's normal order arrives in time.
 */
export function foodLevel(item: FoodInput): Level {
  if (item.stockStatus === 'UNKNOWN') return 'UNKNOWN';
  if (item.daysUntilEmpty !== null && item.daysUntilEmpty < item.leadDays) return 'URGENT';
  return item.stockStatus === 'OK' && !item.orderLate ? 'OK' : 'WORRY';
}

/** One row per part of the village (water) plus one for the pantry (food), worst first. */
export function councilAreas(
  round: readonly MorningRoundItem[],
  served: ReadonlyMap<string, ReadonlySet<string>>,
  food: readonly FoodInput[],
): AreaRow[] {
  const rows: Omit<AreaRow, 'rank'>[] = COUNCIL_AREAS.map((area) => {
    const pipes = round.filter((p) => served.get(p.pipeID)?.has(area));
    // No pipe on record → we don't know, never a reassuring "all right".
    if (!pipes.length) return { area, level: 'UNKNOWN', reasonCode: 'NO_PIPE', subjects: '' };
    const level = pipes.map((p) => PIPE_LEVEL[p.status]).reduce(worse);
    const worst = pipes.filter((p) => PIPE_LEVEL[p.status] === level);
    return { area, level, reasonCode: level === 'OK' ? 'PIPES_OK' : `PIPE_${worst[0].status}`, subjects: worst.map((p) => p.pipeID).join(', ') };
  });
  const levels = food.map((item) => ({ item, level: foodLevel(item) }));
  const pantry = levels.map((x) => x.level).reduce(worse, 'OK');
  rows.push({
    area: PANTRY,
    level: pantry,
    reasonCode: `FOOD_${pantry}`,
    subjects: levels.filter((x) => x.level === pantry && pantry !== 'OK').map((x) => x.item.name).join(', '),
  });
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => LEVELS.indexOf(a.row.level) - LEVELS.indexOf(b.row.level) || a.i - b.i)
    .map(({ row }, i) => ({ ...row, rank: i + 1 }));
}

/**
 * "If you had our crowns this week, this is where they should go, and why."
 * Our choice (Rowan: "how you weigh one problem against another, I leave to you experts"):
 *   1. people without water now (water can't wait days, food can)
 *   2. food that runs out before a normal delivery → emergency delivery
 *   3. numbers nobody can trust → check before paying (Ilse)
 *   4. weak pipes with people behind them
 *   5. low food that Tobin's normal order still saves → no extra money
 *   6. pipes nobody depends on (Maren: the backup loop always last)
 */
export function councilActions(
  round: readonly MorningRoundItem[],
  served: ReadonlyMap<string, ReadonlySet<string>>,
  food: readonly FoodInput[],
): ActionRow[] {
  const peopleAreas = (pipeID: string): string[] => COUNCIL_AREAS.filter((area) => served.get(pipeID)?.has(area));
  const rows: { tier: number; order: number; row: Omit<ActionRow, 'rank'> }[] = round
    .filter((pipe) => pipe.status !== 'OK')
    .map((pipe) => {
      const areas = peopleAreas(pipe.pipeID);
      const level = PIPE_LEVEL[pipe.status];
      const tier = !areas.length ? 6 : level === 'URGENT' ? 1 : level === 'UNKNOWN' ? 3 : 4;
      return {
        tier,
        order: pipe.rank,
        row: {
          ID: `pipe:${pipe.pipeID}`, kind: level === 'UNKNOWN' ? 'CHECK_PIPE' : 'REPAIR', level, target: pipe.pipeID,
          areas: areas.join(', '), families: pipe.families, days: null, leadDays: null,
        },
      };
    });

  const levels = food.map((item) => ({ item, level: foodLevel(item) }));
  for (const { item, level } of levels.filter((x) => x.level === 'URGENT' || x.level === 'UNKNOWN')) {
    rows.push({
      tier: level === 'URGENT' ? 2 : 3,
      order: 1000 + (item.daysUntilEmpty ?? 0), // after the pipes of the same tier
      row: {
        ID: `food:${item.itemID}`, kind: level === 'URGENT' ? 'EMERGENCY_DELIVERY' : 'CHECK_FOOD', level, target: item.name,
        areas: '', families: null, days: item.daysUntilEmpty, leadDays: item.leadDays,
      },
    });
  }
  // All "order today, no extra money" items in one line: the council only needs to know Tobin has it in hand.
  const toOrder = levels.filter((x) => x.level === 'WORRY').sort((a, b) => (a.item.daysUntilEmpty ?? 0) - (b.item.daysUntilEmpty ?? 0));
  if (toOrder.length) {
    rows.push({
      tier: 5,
      order: 0,
      row: {
        ID: 'food:ORDER', kind: 'ORDER', level: 'WORRY', target: toOrder.map((x) => x.item.name).join(', '),
        areas: '', families: null, days: null, leadDays: null,
      },
    });
  }
  return rows.sort((a, b) => a.tier - b.tier || a.order - b.order).map(({ row }, i) => ({ ...row, rank: i + 1 }));
}
