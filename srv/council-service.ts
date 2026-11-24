/**
 * Handlers of `CouncilService` (see `council-service.cds`): reads the village once per request and
 * reuses Maren's morning round and Tobin's pantry outlook, so the council sees the same truth they do.
 */
import { councilActions, councilAreas, type ActionRow, type AreaRow, type FoodInput } from './lib/council';
import { morningRound, servedLandmarks, type LandmarkInput, type PipeInput, type SensorInput } from './lib/morning-round';
import { pantryOutlook, type PantryStock } from './lib/pantry-outlook';

interface CdsService {
  init(): Promise<void>;
  on(event: string, entity: string, handler: () => unknown): void;
}
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: { readonly SELECT: { from(entity: string): { columns(...columns: readonly string[]): PromiseLike<unknown[]> } } };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;
const { SELECT } = cds.ql;

async function readVillage(): Promise<Parameters<typeof councilAreas>> {
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

// shortcut: both handlers ignore $filter/$orderby/$top — the page reads the whole (short) lists.
export default class CouncilService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.on('READ', 'Areas', async (): Promise<AreaRow[]> => councilAreas(...(await readVillage())));
    this.on('READ', 'Actions', async (): Promise<ActionRow[]> => councilActions(...(await readVillage())));
    return super.init();
  }
}
