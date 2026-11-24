import { pantryOutlook, type PantryStock } from './lib/pantry-outlook';

interface DeliveryRequest {
  data: { quantity?: number | string | null; supplier?: string | null; receivedAt?: string | null };
  subject: unknown;
  error(code: number, message: string, target?: string): void;
}

interface CdsService {
  init(): Promise<void>;
  after(event: string, entity: string, handler: (results: unknown) => unknown): void;
  on(event: string, entity: string, handler: (req: DeliveryRequest) => unknown): void;
}
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: {
    SELECT: {
      from(entity: string): { columns(...fields: string[]): {
        where(predicate: { ID: { in: string[] } }): PromiseLike<PantryStock[]>;
      } };
      one: { from(subject: unknown): { columns(...fields: string[]): PromiseLike<{ ID: string } | undefined> } };
    };
    INSERT: { into(entity: string): { entries(row: Readonly<Record<string, unknown>>): PromiseLike<unknown> } };
    UPDATE(subject: unknown): { with(data: Readonly<Record<string, unknown>>): PromiseLike<unknown> };
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

/** Tobin: "enter product, quantity, supplier and receipt date/time myself, so stock reflects what arrived". */
async function receiveDelivery(req: DeliveryRequest): Promise<void> {
  const { quantity, supplier, receivedAt } = req.data;
  const amount = Number(quantity);
  const arrived = receivedAt ? Date.parse(receivedAt) : NaN;
  if (!(amount > 0)) return req.error(400, 'Enter a quantity above 0.', 'quantity');
  if (!supplier?.trim()) return req.error(400, 'Enter the supplier.', 'supplier');
  // A few minutes of slack for clocks that differ between laptop and server.
  if (Number.isNaN(arrived) || arrived > Date.now() + 5 * 60_000) {
    return req.error(400, 'Enter when the delivery arrived — not a time in the future.', 'receivedAt');
  }
  const item = await cds.ql.SELECT.one.from(req.subject).columns('ID');
  if (!item) return req.error(404, 'This stock item does not exist.');
  await cds.ql.INSERT.into('oakhaven.curse.StockReceivals')
    .entries({ item_ID: item.ID, quantityReceived: amount, supplier: supplier.trim(), receivedAt });
  await cds.ql.UPDATE(req.subject).with({ currentQuantity: { '+=': amount } });
}

export default class FoodStockService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.after('READ', 'StockItems', addOutlook);
    this.on('receiveDelivery', 'StockItems', receiveDelivery);
    return super.init();
  }
}
