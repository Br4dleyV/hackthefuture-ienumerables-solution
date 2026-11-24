/**
 * Maren's rules for the morning round, in one place. Values marked "Maren said" come from the
 * interview; values marked "OPEN QUESTION" are placeholders until we ask her.
 */

// Maren said: strictly below these limits (exactly 80 % / 40 PSI is still OK).
export const EMERGENCY_FLOW_PERCENT = 50;
export const EMERGENCY_PRESSURE_PSI = 25;
export const WORRY_FLOW_PERCENT = 80;
export const WORRY_PRESSURE_PSI = 40;

// Maren said: a reading older than 15 minutes means "I don't know".
export const STALE_AFTER_MS = 15 * 60 * 1000;

/** Root of the network: every line starts here. */
export const ROOT_LANDMARK = 'Silverbrook Spring';

/** Stands for "pipe with nobody behind it" (e.g. the backup loop) in PEOPLE_FIRST. */
export const NOBODY_DOWNSTREAM = '(nobody downstream)';

// Maren said: on different lines, people first — homes, then bakery, then farm.
// OPEN QUESTION — confirm with Maren: where does the backup loop (SECONDARY-LOOP) go? For now: after the farm.
export const PEOPLE_FIRST: readonly string[] = ['North Residential Area', 'The Bakery', 'South Meadow Farms', NOBODY_DOWNSTREAM];

// Maren said: ~140 families live in North Residential.
export const FAMILIES_BY_LANDMARK: Readonly<Record<string, number>> = { 'North Residential Area': 140 };

// OPEN QUESTION — confirm with Maren: where do UNKNOWN pipes go? For now: own section below the urgent ones.
// (CHECK = "numbers don't add up — check with Ilse".) Reorder this list to move a whole section.
export const STATUS_ORDER = ['EMERGENCY', 'WORRY', 'CHECK', 'UNKNOWN', 'OK'] as const;

// OPEN QUESTION — confirm with Maren: what weighs more, severity or who is behind the pipe?
// true = severity first, then upstream/people. false = who is behind it first, then severity.
export const SEVERITY_FIRST = true;

// OPEN QUESTION — confirm with Maren: how many pipes can the crew do in one morning? 0 = show the whole list.
export const CREW_CAPACITY = 0;

// OPEN QUESTION — confirm with Maren/Ilse: when do sensor and pipe values "clearly" disagree? For now: > 20 %.
export const MISMATCH_TOLERANCE = 0.2;
