/**
 * Rowan's Monday page: is each part of the village all right, and where should this week's crowns go?
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

// Rowan said: Shepherd's Inn has its own well — it doesn't depend on Maren's pipes, but it stays on the page.
export const OWN_WELL: readonly string[] = ["Shepherd's Inn"];

// Rowan said: 500 crowns a week, no more. A pipe repair costs about 120; an emergency food delivery about
// 80 on top of the normal price (the normal price comes out of the pantry money, so only the 80 counts).
export const WEEKLY_BUDGET = 500;
export const REPAIR_COST = 120;
export const EMERGENCY_DELIVERY_EXTRA = 80;

// Tobin said: "I feel it first in the bakery — without enough flour, milk and butter I can't bake the
// morning bread." Who else feels a shortage first, nobody could tell us (Rowan sent us to Tobin, Tobin to
// Rowan). Our choice: a shortage of any other food counts for every part of the village.
export const BAKERY = 'The Bakery';
export const BAKERY_INGREDIENTS: readonly string[] = ['FLOUR', 'MILK', 'BUTTER'];

/** Worst first. UNKNOWN sits above WORRY, like Maren's "someone has to go and look". */
export type Level = 'URGENT' | 'UNKNOWN' | 'WORRY' | 'OK';
const LEVELS: readonly Level[] = ['URGENT', 'UNKNOWN', 'WORRY', 'OK'];
const worse = (a: Level, b: Level): Level => (LEVELS.indexOf(a) <= LEVELS.indexOf(b) ? a : b);

const PIPE_LEVEL: Record<Status, Level> = { EMERGENCY: 'URGENT', UNKNOWN: 'UNKNOWN', CHECK: 'UNKNOWN', WORRY: 'WORRY', OK: 'OK' };
const WATER_CODE: Record<Level, string> = { URGENT: 'WATER_BROKEN', UNKNOWN: 'WATER_UNSURE', WORRY: 'WATER_WEAK', OK: 'WATER_OK' };

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
  waterCode: string; // WATER_BROKEN | WATER_UNSURE | WATER_WEAK | WATER_OK | OWN_WELL | WATER_UNKNOWN
  foodCode: string; // FOOD_SHORT | FOOD_UNSURE (+ _BAKERY) | FOOD_OK
  foodItems: string;
  /** Rowan: "better or worse than last week" — compared with the last page the council printed. */
  trend: 'BETTER' | 'WORSE' | 'SAME' | 'NEW';
}

/** PAY = counted in this week's crowns; NO_CROWNS = costs nothing; CAN_WAIT = kept in reserve; NO_BUDGET = crowns are gone. */
export type Advice = 'PAY' | 'NO_CROWNS' | 'CAN_WAIT' | 'NO_BUDGET';

// Our choice (Rowan: "whether unspent crowns carry over, nobody ever told me — that's up to you experts"):
// don't spend on pipes nobody depends on; keep those crowns in reserve, e.g. for a pipe that Maren's check
// turns out to need repairing.
export const SPEND_ON_NOBODY = false;

export type ActionKind = 'REPAIR' | 'CHECK_PIPE' | 'CHECK_FOOD' | 'EMERGENCY_DELIVERY' | 'ORDER';

export interface ActionRow {
  ID: string;
  rank: number;
  kind: ActionKind;
  level: Level;
  /** Food item(s), or the pipe route in plain words (from → to) — never a pipe code (Rowan: no jargon). */
  target: string;
  fromPlace: string;
  toPlace: string;
  areas: string;
  families: number | null;
  days: number | null;
  leadDays: number | null;
  cost: number;
  /** Still fits in this week's budget, counted in this order. */
  fits: boolean;
  /** Why this line sits at this place (1 = people without water … 6 = nobody depends on it). */
  tier: number;
  advice: Advice;
}

export interface BudgetRow {
  ID: string;
  total: number;
  spend: number;
  left: number;
  /** When the council last printed the page — what "better or worse" is compared with. */
  comparedWith: string | null;
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

/** One row per part of the village: water + food, worst first. */
export function councilAreas(
  round: readonly MorningRoundItem[],
  served: ReadonlyMap<string, ReadonlySet<string>>,
  food: readonly FoodInput[],
  /** area → level on the last printed page (empty: nothing printed yet). */
  previous: ReadonlyMap<string, string> = new Map(),
): AreaRow[] {
  // "Nobody goes hungry this week": only food that runs out before a normal delivery (URGENT) or whose
  // count can't be right (UNKNOWN) matters here — low food that Tobin's normal order saves does not.
  const levels = food.map((item) => ({ item, level: foodLevel(item) })).filter((x) => x.level === 'URGENT' || x.level === 'UNKNOWN');
  const foodFor = (area: string): { level: Level; code: string; items: string } => {
    const bakery = area === BAKERY;
    const mine = levels.filter((x) => bakery || !BAKERY_INGREDIENTS.includes(x.item.itemID));
    if (!mine.length) return { level: 'OK', code: 'FOOD_OK', items: '' };
    const level = mine.map((x) => x.level).reduce(worse);
    const worst = mine.filter((x) => x.level === level);
    const ingredient = bakery && worst.some((x) => BAKERY_INGREDIENTS.includes(x.item.itemID));
    const code = `${level === 'URGENT' ? 'FOOD_SHORT' : 'FOOD_UNSURE'}${ingredient ? '_BAKERY' : ''}`;
    return { level, code, items: worst.map((x) => x.item.name).join(', ') };
  };
  const rows = COUNCIL_AREAS.map((area) => {
    const foodState = foodFor(area);
    const pipes = round.filter((p) => served.get(p.pipeID)?.has(area));
    // Own well: not on the pipes, so no pipe can hurt it. No pipe and no well → we don't know, never "all right".
    const water: { level: Level; code: string } = OWN_WELL.includes(area)
      ? { level: 'OK', code: 'OWN_WELL' }
      : !pipes.length
        ? { level: 'UNKNOWN', code: 'WATER_UNKNOWN' }
        : (() => {
            const level = pipes.map((p) => PIPE_LEVEL[p.status]).reduce(worse);
            return { level, code: WATER_CODE[level] };
          })();
    const level = worse(water.level, foodState.level);
    const before = LEVELS.indexOf(previous.get(area) as Level);
    const now = LEVELS.indexOf(level);
    return {
      area,
      level,
      waterCode: water.code,
      foodCode: foodState.code,
      foodItems: foodState.items,
      // LEVELS is worst-first: a higher index than last time means better.
      trend: before === -1 ? 'NEW' : now > before ? 'BETTER' : now < before ? 'WORSE' : 'SAME',
    } satisfies Omit<AreaRow, 'rank'>;
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
 *   3. numbers nobody can trust → check before paying (Ilse) — costs no crowns
 *   4. weak pipes with people behind them
 *   5. low food that Tobin's normal order still saves → no extra crowns
 *   6. pipes nobody depends on (Maren: the backup loop always last)
 * Then the 500 crowns are spent in that order; what no longer fits is marked "not this week", and
 * pipes nobody depends on wait while SPEND_ON_NOBODY is false (their crowns stay in reserve).
 */
export function councilActions(
  round: readonly MorningRoundItem[],
  served: ReadonlyMap<string, ReadonlySet<string>>,
  food: readonly FoodInput[],
): ActionRow[] {
  const peopleAreas = (pipeID: string): string[] => COUNCIL_AREAS.filter((area) => served.get(pipeID)?.has(area));
  const rows: { tier: number; order: number; row: Omit<ActionRow, 'rank' | 'fits' | 'tier' | 'advice'> }[] = round
    .filter((pipe) => pipe.status !== 'OK')
    .map((pipe) => {
      const areas = peopleAreas(pipe.pipeID);
      const level = PIPE_LEVEL[pipe.status];
      const check = level === 'UNKNOWN';
      const [from = '', to = ''] = (pipe.location ?? '').split(' → ');
      return {
        tier: !areas.length ? 6 : level === 'URGENT' ? 1 : check ? 3 : 4,
        order: pipe.rank,
        row: {
          ID: `pipe:${pipe.pipeID}`, kind: check ? 'CHECK_PIPE' : 'REPAIR', level, target: `${from} → ${to}`, fromPlace: from, toPlace: to,
          areas: areas.join(', '), families: pipe.families, days: null, leadDays: null, cost: check ? 0 : REPAIR_COST,
        },
      };
    });

  const levels = food.map((item) => ({ item, level: foodLevel(item) }));
  for (const { item, level } of levels.filter((x) => x.level === 'URGENT' || x.level === 'UNKNOWN')) {
    const urgent = level === 'URGENT';
    rows.push({
      tier: urgent ? 2 : 3,
      order: 1000 + (item.daysUntilEmpty ?? 0), // after the pipes of the same tier
      row: {
        ID: `food:${item.itemID}`, kind: urgent ? 'EMERGENCY_DELIVERY' : 'CHECK_FOOD', level, target: item.name, fromPlace: '', toPlace: '',
        areas: '', families: null, days: item.daysUntilEmpty, leadDays: item.leadDays, cost: urgent ? EMERGENCY_DELIVERY_EXTRA : 0,
      },
    });
  }
  // All "order today, no extra crowns" items in one line: the council only needs to know Tobin has it in hand.
  const toOrder = levels.filter((x) => x.level === 'WORRY').sort((a, b) => (a.item.daysUntilEmpty ?? 0) - (b.item.daysUntilEmpty ?? 0));
  if (toOrder.length) {
    rows.push({
      tier: 5,
      order: 0,
      row: {
        ID: 'food:ORDER', kind: 'ORDER', level: 'WORRY', target: toOrder.map((x) => x.item.name).join(', '), fromPlace: '', toPlace: '',
        areas: '', families: null, days: null, leadDays: null, cost: 0,
      },
    });
  }

  let left = WEEKLY_BUDGET;
  return rows
    .sort((a, b) => a.tier - b.tier || a.order - b.order)
    .map(({ tier, row }, i) => {
      const wait = tier === 6 && !SPEND_ON_NOBODY && row.cost > 0;
      const fits = !wait && row.cost <= left;
      if (fits) left -= row.cost;
      const advice: Advice = row.cost === 0 ? 'NO_CROWNS' : wait ? 'CAN_WAIT' : fits ? 'PAY' : 'NO_BUDGET';
      return { ...row, rank: i + 1, fits, tier, advice };
    });
}

/** The big picture in one line: "spend X of the 500 crowns, Y left". */
export function councilBudget(actions: readonly ActionRow[], comparedWith: string | null = null): BudgetRow {
  const spend = actions.filter((a) => a.fits).reduce((sum, a) => sum + a.cost, 0);
  return { ID: 'week', total: WEEKLY_BUDGET, spend, left: WEEKLY_BUDGET - spend, comparedWith };
}
