import { pantryOutlook, type PantryStock } from './lib/pantry-outlook';

interface CdsService {
  init(): Promise<void>;
  after(event: string, entity: string, handler: (results: unknown) => unknown): void;
}
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: {
    SELECT: { from(entity: string): { columns(...fields: string[]): {
      where(predicate: { ID: { in: string[] } }): PromiseLike<PantryStock[]>;
    } } };
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;

async function addOutlook(results: unknown): Promise<void> {
  const rows = (Array.isArray(results) ? results : [results]).filter(
    (row): row is { ID: string } => !!row && typeof row === 'object' && 'ID' in row && typeof row.ID === 'string',
  );
  if (!rows.length) return;
  const inputs = await cds.ql.SELECT.from('oakhaven.curse.StockItems')
    .columns('ID', 'itemID', 'currentQuantity', 'minStockLevel', 'consumptionRate')
    .where({ ID: { in: rows.map((row) => row.ID) } });
  const byId = new Map(inputs.map((input) => [input.ID, input]));
  const now = new Date();
  for (const row of rows) {
    const input = byId.get(row.ID);
    if (input) Object.assign(row, pantryOutlook(input, now));
  }
}

export default class FoodStockService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.after('READ', 'StockItems', addOutlook);
    return super.init();
  }
}
