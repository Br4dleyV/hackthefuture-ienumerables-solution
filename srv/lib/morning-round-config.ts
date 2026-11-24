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
// Maren said: the backup loop always comes last, even in alarm — nobody depends on it (see morning-round.ts sort).
export const PEOPLE_FIRST: readonly string[] = ['North Residential Area', 'The Bakery', 'South Meadow Farms', NOBODY_DOWNSTREAM];

// Maren said: ~140 families live in North Residential.
export const FAMILIES_BY_LANDMARK: Readonly<Record<string, number>> = { 'North Residential Area': 140 };

// Maren said: an emergency always comes first, whoever sits behind it; "I don't know" goes after the
// emergencies but before "visit this week" — someone has to go and look.
// Ilse said: when sensor and pipe clash, trust neither until Maren has checked → CHECK sits with UNKNOWN.
export const STATUS_ORDER = ['EMERGENCY', 'UNKNOWN', 'CHECK', 'WORRY', 'OK'] as const;

// Maren said: one crew, two repairs a day at most — one in the morning, one in the afternoon.
// Our choice (Maren: "that's for you to work out"): keep the whole list, mark the first two visits "today".
export const REPAIRS_PER_DAY = 2;

// Ilse said: a sensor showing more than double what its pipe can carry cannot be true.
export const IMPOSSIBLE_FLOW_FACTOR = 2;

// Our choice (Ilse: "that's for Maren and for you to decide"): sensor and pipe record clash when > 20 % apart.
export const MISMATCH_TOLERANCE = 0.2;
