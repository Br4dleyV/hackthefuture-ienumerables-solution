/**
 * Handlers of `CouncilService` (see `council-service.cds`): reads the village once per request and
 * reuses Maren's morning round and Tobin's pantry outlook, so the council sees the same truth they do.
 */
import {
  councilActions, councilAreas, councilBudget, type ActionRow, type AreaRow, type BudgetRow, type FoodInput,
} from './lib/council';
import {
  morningRound, servedLandmarks, type LandmarkInput, type MorningRoundItem, type PipeInput, type SensorInput,
} from './lib/morning-round';
import { pantryOutlook, type PantryStock } from './lib/pantry-outlook';

interface Snapshot {
  takenAt: string;
  area: string;
  level: string;
}

interface CdsService {
  init(): Promise<void>;
  on(event: string, entity: string, handler: () => unknown): void;
  on(event: string, handler: () => unknown): void;
}
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: {
    readonly SELECT: { from(entity: string): { columns(...columns: readonly string[]): PromiseLike<unknown[]> } };
    readonly INSERT: { into(entity: string): { entries(rows: readonly Snapshot[]): PromiseLike<unknown> } };
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;
const { SELECT, INSERT } = cds.ql;

type Village = [MorningRoundItem[], Map<string, Set<string>>, FoodInput[]];

async function readVillage(): Promise<Village> {
  const [pipes, sensors, landmarks, stock] = await Promise.all([
    SELECT.from('oakhaven.curse.WaterPipes').columns(
      'ID', 'pipeID', 'location', 'startPoint', 'endPoint', 'nominalFlowRate', 'currentFlowRate', 'currentPressure', 'lastMaintenance', 'mapPath',
    ),
    SELECT.from('oakhaven.curse.Sensors').columns('pipe_ID', 'sensorID', 'flowRate', 'pressure', 'lastReading'),
    SELECT.from('oakhaven.curse.Landmarks').columns('name', 'kind', 'suppliedBy'),
    SELECT.from('oakhaven.curse.StockItems').columns('ID', 'itemID', 'name', 'currentQuantity', 'minStockLevel', 'consumptionRate'),
  ]);
  const now = new Date();
  const food = (stock as (PantryStock & { name: string })[]).map((item): FoodInput => {
    const { stockStatus, daysUntilEmpty, leadDays, orderLate } = pantryOutlook(item, now);
    return { itemID: item.itemID, name: item.name, stockStatus, daysUntilEmpty, leadDays, orderLate };
  });
  return [
    morningRound(pipes as PipeInput[], sensors as SensorInput[], landmarks as LandmarkInput[], now),
    servedLandmarks(pipes as PipeInput[], landmarks as LandmarkInput[]),
    food,
  ];
}

/** The newest printed page: when, and the level of each part of the village on it. */
async function lastPrinted(): Promise<{ at: string | null; levels: Map<string, string> }> {
  // shortcut: reads all snapshots and picks the newest here — fine at one page a week; add where/orderBy when it grows.
  const rows = (await SELECT.from('oakhaven.curse.CouncilSnapshots').columns('takenAt', 'area', 'level')) as Snapshot[];
  const at = rows.reduce<string | null>((newest, row) => (!newest || row.takenAt > newest ? row.takenAt : newest), null);
  return { at, levels: new Map(rows.filter((row) => row.takenAt === at).map((row) => [row.area, row.level])) };
}

async function readAreas(): Promise<AreaRow[]> {
  const [village, printed] = await Promise.all([readVillage(), lastPrinted()]);
  return councilAreas(...village, printed.levels);
}

async function readBudget(): Promise<BudgetRow[]> {
  const [village, printed] = await Promise.all([readVillage(), lastPrinted()]);
  return [councilBudget(councilActions(...village), printed.at, councilAreas(...village, printed.levels))];
}

/** Remembers what the council saw on the page it just printed. */
async function recordPrintedPage(): Promise<void> {
  const takenAt = `${new Date().toISOString().slice(0, 19)}Z`; // CDS DateTime: seconds precision
  const areas = councilAreas(...(await readVillage()));
  await INSERT.into('oakhaven.curse.CouncilSnapshots').entries(areas.map(({ area, level }) => ({ takenAt, area, level })));
}

// shortcut: the READ handlers ignore $filter/$orderby/$top — the page reads the whole (short) lists.
export default class CouncilService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.on('READ', 'Areas', readAreas);
    this.on('READ', 'Actions', async (): Promise<ActionRow[]> => councilActions(...(await readVillage())));
    this.on('READ', 'Budget', readBudget);
    this.on('recordPrintedPage', recordPrintedPage);
    return super.init();
  }
}
