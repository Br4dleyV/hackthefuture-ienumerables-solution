/**
 * Rowan's Monday page: water and food per part of the village, and where this week's crowns should go.
 * The lists are not stored (`@cds.persistence.skip`): computed on every READ in council-service.ts from the
 * pipes, sensors, landmarks and pantry. Only a printed page is remembered (db.CouncilSnapshots), to compare.
 * Try /odata/v4/council/Actions, /Areas and /Budget
 */
service CouncilService @(path: 'council', impl: 'srv/council-service') {

  /** The big picture in one row: spend X of the 500 crowns, Y left. */
  @readonly @cds.persistence.skip
  entity Budget {
    key ID    : String;
        total : Integer;
        spend : Integer;
        left  : Integer;
        comparedWith : DateTime; // when the council last printed the page (null: never)
        areasUrgent  : Integer;  // number of village parts per level — the big picture in four numbers
        areasUnsure  : Integer;
        areasWorry   : Integer;
        areasOk      : Integer;
  }

  /** The page was printed: remember what the council saw, to say "better or worse" next time. */
  action recordPrintedPage();

  /** "If you had our crowns this week, this is where they should go, and why" — in order. */
  @readonly @cds.persistence.skip
  entity Actions {
    key ID       : String;
        rank     : Integer;
        kind     : String;  // REPAIR | CHECK_PIPE | CHECK_FOOD | EMERGENCY_DELIVERY | ORDER
        level    : String;  // URGENT | UNKNOWN | WORRY | OK
        target   : String;
        fromPlace: String;  // pipe route in plain words (no pipe codes)
        toPlace  : String;
        areas    : String;
        families : Integer;
        days     : Decimal(9, 2);
        leadDays : Integer;
        cost     : Integer; // crowns
        fits     : Boolean; // counted in this week's crowns
        tier     : Integer; // why it sits here: 1 people without water … 6 nobody depends on it
        advice   : String;  // PAY | NO_CROWNS | CAN_WAIT | NO_BUDGET
  }

  /** One row per part of the village: water + food, worst first. */
  @readonly @cds.persistence.skip
  entity Areas {
    key area      : String;
        rank      : Integer;
        level     : String;
        waterCode : String; // WATER_BROKEN | WATER_UNSURE | WATER_WEAK | WATER_OK | OWN_WELL | WATER_UNKNOWN
        foodCode  : String; // FOOD_SHORT | FOOD_UNSURE (+ _BAKERY) | FOOD_OK
        foodItems : String;
        trend     : String; // BETTER | WORSE | SAME | NEW — compared with the last printed page
  }
}
