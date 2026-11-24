import { IMPOSSIBLE_FLOW_FACTOR } from './morning-round-config';

export interface AuditRecord {
  ID: string;
  modifiedAt: string | null;
  modifiedBy: string | null;
}

interface LedgerRecord extends AuditRecord {
  recordName: string;
  recordType: 'SENSOR' | 'PIPE' | 'STOCK' | 'REPAIR';
  evidence: 'OVER_CAPACITY' | 'FLOW_MISMATCH' | 'CLASHES_WITH_SENSOR' | 'NEGATIVE_STOCK' | 'NONE';
  observed?: number | null;
  pipeFlow?: number | null;
  capacity?: number | null;
}

export interface LedgerRow extends LedgerRecord {
  nightEdit: boolean;
  systemEdit: boolean;
  unnamedEdit: boolean;
  relatedCount: number;
  councilCandidate: boolean;
}

/** Seconds precision ("2026-11-17T03:13:00Z"), like every other date in the app — UI5 shows it as a date. */
const toSeconds = (at: Date): string => `${at.toISOString().slice(0, 19)}Z`;

export function assessLedger(records: LedgerRecord[]): LedgerRow[] {
  const rows = records.map((record) => {
    const timestamp = record.modifiedAt ? new Date(record.modifiedAt) : null;
    const hour = timestamp?.getUTCHours();
    return {
      ...record,
      modifiedAt: timestamp && Number.isFinite(timestamp.getTime()) ? toSeconds(timestamp) : null,
      nightEdit: hour !== undefined && hour < 4,
      systemEdit: record.modifiedBy?.trim().toLowerCase() === 'system',
      unnamedEdit: !record.modifiedBy?.trim(),
      night: timestamp && Number.isFinite(timestamp.getTime()) ? timestamp.toISOString().slice(0, 10) : null,
    };
  });
  const suspicious = (row: typeof rows[number]): boolean => row.nightEdit || row.systemEdit || row.unnamedEdit;
  return rows.filter((row) => suspicious(row) || row.evidence !== 'NONE').map(({ night, ...row }) => {
    const relatedCount = night && suspicious({ night, ...row }) ? rows.filter((other) =>
      other.ID !== row.ID && other.night === night &&
      ((row.nightEdit && other.nightEdit) || (row.systemEdit && other.systemEdit) || (row.unnamedEdit && other.unnamedEdit)),
    ).length : 0;
    const { ID, recordName, recordType, evidence, observed, capacity, pipeFlow, modifiedAt, modifiedBy, nightEdit, systemEdit, unnamedEdit } = row;
    return { ID, recordName, recordType, evidence, observed, capacity, pipeFlow, modifiedAt, modifiedBy,
      nightEdit, systemEdit, unnamedEdit, relatedCount, councilCandidate: relatedCount > 0 && evidence !== 'NONE' };
  }).sort((a, b) => Number(b.councilCandidate) - Number(a.councilCandidate) || (b.modifiedAt ?? '').localeCompare(a.modifiedAt ?? ''));
}

/** Ilse: "when it all started, and whether it happened at once or bit by bit". */
export interface LedgerTimeline {
  ID: string;
  /** Odd changes = changed at night, under a system account or without a name. */
  oddChanges: number;
  firstChange: string | null;
  lastChange: string | null;
  /** Different nights (record dates) the odd changes fall on: 1 = all at once. */
  nights: number;
}

export function ledgerTimeline(rows: readonly LedgerRow[]): LedgerTimeline {
  const odd = rows
    .filter((row) => (row.nightEdit || row.systemEdit || row.unnamedEdit) && row.modifiedAt)
    .map((row) => toSeconds(new Date(row.modifiedAt ?? '')))
    .sort();
  return {
    ID: 'trail',
    oddChanges: odd.length,
    firstChange: odd[0] ?? null,
    lastChange: odd[odd.length - 1] ?? null,
    nights: new Set(odd.map((at) => at.slice(0, 10))).size,
  };
}

export function ledgerEvidence(
  pipes: (AuditRecord & { pipeID: string; nominalFlowRate: number | null; currentFlowRate: number | null })[],
  sensors: (AuditRecord & { sensorID: string; pipe_ID: string; flowRate: number | null })[],
  stock: (AuditRecord & { name: string; currentQuantity: number | null })[],
  repairs: (AuditRecord & { issue: string })[],
  mismatchTolerance: number,
): LedgerRow[] {
  const pipesById = new Map(pipes.map((pipe) => [pipe.ID, pipe]));
  const sensorRows = sensors.map((sensor): LedgerRecord => {
    const pipe = pipesById.get(sensor.pipe_ID);
    const observed = sensor.flowRate;
    const capacity = pipe?.nominalFlowRate ?? null;
    const pipeFlow = pipe?.currentFlowRate ?? null;
    const evidence = observed !== null && capacity !== null && Number(observed) > Number(capacity) * IMPOSSIBLE_FLOW_FACTOR ? 'OVER_CAPACITY'
      : observed !== null && pipeFlow !== null && Math.abs(observed - pipeFlow) > mismatchTolerance * Math.max(Math.abs(observed), Math.abs(pipeFlow))
        ? 'FLOW_MISMATCH' : 'NONE';
    return { ...sensor, recordType: 'SENSOR', recordName: pipe ? `${sensor.sensorID} · ${pipe.pipeID}` : sensor.sensorID, evidence, observed, pipeFlow, capacity };
  });
  // Ilse: "when a pipe and its sensor clash, mark both as not to be trusted" — so the pipe line shows up too.
  const clashBySensorPipe = new Map(
    sensorRows.filter((row) => row.evidence !== 'NONE').map((row) => [(row as LedgerRecord & { pipe_ID: string }).pipe_ID, row]),
  );
  return assessLedger([
    ...sensorRows,
    ...pipes.map((pipe): LedgerRecord => {
      const clash = clashBySensorPipe.get(pipe.ID);
      return clash
        ? { ...pipe, recordType: 'PIPE', recordName: pipe.pipeID, evidence: 'CLASHES_WITH_SENSOR', observed: clash.observed, pipeFlow: clash.pipeFlow, capacity: clash.capacity }
        : { ...pipe, recordType: 'PIPE', recordName: pipe.pipeID, evidence: 'NONE' };
    }),
    ...stock.map((item): LedgerRecord => ({ ...item, recordType: 'STOCK', recordName: item.name,
      evidence: item.currentQuantity !== null && item.currentQuantity < 0 ? 'NEGATIVE_STOCK' : 'NONE', observed: item.currentQuantity })),
    ...repairs.map((repair): LedgerRecord => ({ ...repair, recordType: 'REPAIR', recordName: repair.issue, evidence: 'NONE' })),
  ]);
}
