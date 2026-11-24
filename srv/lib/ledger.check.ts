/**
 * Quick checks for Ilse's ledger. Run: `docker compose exec app npx tsx srv/lib/ledger.check.ts`
 */
import assert from 'node:assert/strict';
import { ledgerEvidence, ledgerTimeline } from './ledger';

const pipes = [
  { ID: 'p4', pipeID: 'BAKERY-BRANCH', nominalFlowRate: 50, currentFlowRate: 47, modifiedAt: '2026-09-10T14:30:00Z', modifiedBy: 'tobin.reyes' },
  { ID: 'p1', pipeID: 'PRIMARY-MAIN', nominalFlowRate: 150, currentFlowRate: 142, modifiedAt: '2026-08-20T11:05:00Z', modifiedBy: 'maren.holt' },
];
const sensors = [
  { ID: 's4', sensorID: 'SENS-004', pipe_ID: 'p4', flowRate: 140, modifiedAt: '2026-11-17T03:13:00Z', modifiedBy: 'system' },
  { ID: 's1', sensorID: 'SENS-001', pipe_ID: 'p1', flowRate: 142, modifiedAt: '2026-11-17T04:00:00Z', modifiedBy: 'maren.holt' },
];
const stock = [{ ID: 'b', name: 'Butter', currentQuantity: -3, modifiedAt: '2026-11-17T03:13:00Z', modifiedBy: 'system' }];
const repairs = [{ ID: 'r', issue: 'Replaced valve seal', modifiedAt: '2026-11-17T03:13:00Z', modifiedBy: 'system' }];

const rows = ledgerEvidence(pipes, sensors, stock, repairs, 0.2);
const row = (name: string) => rows.find((r) => r.recordName === name) ?? rows.find((r) => r.recordName.startsWith(name));

// Ilse: more than double what the pipe carries cannot be true — and then the pipe line is marked too.
assert.equal(row('SENS-004')?.evidence, 'OVER_CAPACITY');
assert.equal(row('BAKERY-BRANCH')?.evidence, 'CLASHES_WITH_SENSOR');
assert.ok(!row('PRIMARY-MAIN')); // nothing odd about it → not in the list

// Night = midnight up to (not including) four: Tobin starts at four.
assert.equal(row('SENS-004')?.nightEdit, true); // 03:13
assert.ok(!row('SENS-001')); // 04:00, signed, value fine → not suspicious

// Odd value + other lines changed the same odd way that night → fits a pattern.
assert.equal(row('SENS-004')?.councilCandidate, true);
assert.equal(row('Butter')?.councilCandidate, true);
assert.equal(row('Replaced valve seal')?.councilCandidate, false); // odd change, but nothing wrong with the value

// When it started, and all in one night or bit by bit.
assert.deepEqual(ledgerTimeline(rows), {
  ID: 'trail', oddChanges: 3, firstChange: '2026-11-17T03:13:00Z', lastChange: '2026-11-17T03:13:00Z', nights: 1,
});

console.log('ledger checks OK');
