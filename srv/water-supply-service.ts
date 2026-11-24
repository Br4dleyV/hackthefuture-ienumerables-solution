/**
 * Handlers of `WaterSupplyService` (see `water-supply-service.cds`).
 *
 * Everything you can read from the service is served by CAP's generic provider — no code needed.
 * Add a handler here only when you need logic: `this.before(...)` to validate, `this.on(...)` to
 * implement an action, `this.after(...)` to enrich what is read.
 *
 * `@sap/cds` ships no TypeScript declarations in this project, so it is loaded with `require`
 * and the part of its API this file uses is described in the small interfaces below.
 */
import { startDemoSensorFeed } from './lib/demo-freshness';
import { ledgerEvidence, ledgerTimeline } from './lib/ledger';
import { MISMATCH_TOLERANCE } from './lib/morning-round-config';
import { morningRound, type LandmarkInput, type MorningRoundItem, type PipeInput, type SensorInput } from './lib/morning-round';

// 👋 EXAMPLE — the shape of a WaterPipes row as our handler sees it. Every field is optional:
//    the client decides which fields it asks for ($select).
interface PipeRow {
  ID?: string;
  lastMaintenance?: string | null;
  daysSinceMaintenance?: number | null;
}

/** The slice of a CAP service this file uses. */
interface CdsService {
  init(): Promise<void>;
  after(event: string, entity: string, handler: (results: unknown) => unknown): void;
  on(event: string, entity: string, handler: () => unknown): void;
}

/** The slice of the `cds` facade this file uses. */
interface CdsApi {
  readonly ApplicationService: new (...args: readonly never[]) => CdsService;
  readonly ql: {
    readonly SELECT: {
      from(entity: string): {
        columns(...columns: readonly string[]): PromiseLike<unknown[]> & {
          where(predicate: Readonly<Record<string, unknown>>): PromiseLike<PipeRow[]>;
        };
      };
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cds = require('@sap/cds') as CdsApi;
const { SELECT } = cds.ql;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 👋 EXAMPLE — fills in the computed field `daysSinceMaintenance` on every pipe that is read.
 *
 * Registered with `this.after('READ', 'WaterPipes', …)`: CAP has already read the rows from the
 * database and hands them to us just before it sends them to the client — we only add a value.
 */
async function addDaysSinceMaintenance(results: unknown): Promise<void> {
  // 👋 EXAMPLE — reading a collection (/WaterPipes) gives an array; reading one pipe
  //    (/WaterPipes(<ID>)) gives a single object. Treat both the same way.
  const rows = (Array.isArray(results) ? results : [results]).filter(
    (row): row is PipeRow => row !== null && typeof row === 'object',
  );

  // 👋 EXAMPLE — the client may ask for only SOME fields, e.g. `$select=pipeID,daysSinceMaintenance`.
  //    UI5 always does that: it only requests the fields a view binds. Then `lastMaintenance` — the
  //    input we need — is not in the row. CAP always adds the key (`ID`), so we look the missing
  //    inputs up ourselves: ONE query for all rows that need it (never one query per row).
  const missingIds = rows.filter((row) => !('lastMaintenance' in row) && row.ID).map((row) => row.ID);
  const lastMaintenanceById = new Map<string, string | null | undefined>();
  if (missingIds.length > 0) {
    const pipes = await SELECT.from('oakhaven.curse.WaterPipes')
      .columns('ID', 'lastMaintenance')
      .where({ ID: { in: missingIds } });
    for (const pipe of pipes) lastMaintenanceById.set(pipe.ID ?? '', pipe.lastMaintenance);
  }

  // 👋 EXAMPLE — the actual calculation: whole days between the last maintenance and now.
  //    Computed on every read, so it is always up to date — nothing is stored.
  const now = Date.now();
  for (const row of rows) {
    const lastMaintenance = 'lastMaintenance' in row ? row.lastMaintenance : lastMaintenanceById.get(row.ID ?? '');
    row.daysSinceMaintenance = lastMaintenance
      ? Math.floor((now - Date.parse(lastMaintenance)) / MS_PER_DAY)
      : null;
  }
}

/** Reads the three inputs (one query each) and computes the round against the current time. */
async function readMorningRound(): Promise<MorningRoundItem[]> {
  const [pipes, sensors, landmarks] = await Promise.all([
    SELECT.from('oakhaven.curse.WaterPipes').columns(
      'ID', 'pipeID', 'location', 'startPoint', 'endPoint', 'nominalFlowRate', 'currentFlowRate', 'currentPressure', 'lastMaintenance', 'mapPath',
    ),
    SELECT.from('oakhaven.curse.Sensors').columns('pipe_ID', 'sensorID', 'flowRate', 'pressure', 'lastReading'),
    SELECT.from('oakhaven.curse.Landmarks').columns('name', 'kind', 'suppliedBy'),
  ]);
  // shortcut: ignores $filter/$orderby/$top and single-key reads — the UI reads the whole (6-row) list.
  return morningRound(pipes as PipeInput[], sensors as SensorInput[], landmarks as LandmarkInput[], new Date());
}

async function readLedger(): Promise<ReturnType<typeof ledgerEvidence>> {
  const audit = ['ID', 'modifiedAt', 'modifiedBy'];
  const [pipes, sensors, stock, repairs] = await Promise.all([
    SELECT.from('oakhaven.curse.WaterPipes').columns(...audit, 'pipeID', 'nominalFlowRate', 'currentFlowRate'),
    SELECT.from('oakhaven.curse.Sensors').columns(...audit, 'sensorID', 'pipe_ID', 'flowRate'),
    SELECT.from('oakhaven.curse.StockItems').columns(...audit, 'name', 'currentQuantity'),
    SELECT.from('oakhaven.curse.Repairs').columns(...audit, 'issue'),
  ]);
  // The ledger is a small read-only snapshot; the UI requests the whole list.
  return ledgerEvidence(pipes as Parameters<typeof ledgerEvidence>[0], sensors as Parameters<typeof ledgerEvidence>[1],
    stock as Parameters<typeof ledgerEvidence>[2], repairs as Parameters<typeof ledgerEvidence>[3], MISMATCH_TOLERANCE);
}

export default class WaterSupplyService extends cds.ApplicationService {
  override async init(): Promise<void> {
    this.on('READ', 'MorningRound', readMorningRound);
    this.on('READ', 'LedgerEvidence', readLedger);
    this.on('READ', 'LedgerTimeline', async () => [ledgerTimeline(await readLedger())]);
    // 👋 EXAMPLE — register the handler: after every READ of WaterPipes, add daysSinceMaintenance.
    this.after('READ', 'WaterPipes', addDaysSinceMaintenance);

    startDemoSensorFeed();
    return super.init();
  }
}
