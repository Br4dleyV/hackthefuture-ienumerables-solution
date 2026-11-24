/**
 * Rowan's Monday page: water and food per part of the village, and where this week's money should go.
 * Nothing is stored (`@cds.persistence.skip`): both lists are computed on every READ in council-service.ts
 * from the pipes, sensors, landmarks and pantry. Try /odata/v4/council/Actions and /odata/v4/council/Areas
 */
service CouncilService @(path: 'council', impl: 'srv/council-service') {

  /** One row per part of the village (+ one for the village pantry), worst first. */
  @readonly @cds.persistence.skip
  entity Areas {
    key area       : String;
        rank       : Integer;
        level      : String; // URGENT | UNKNOWN | WORRY | OK
        reasonCode : String; // PIPE_EMERGENCY | PIPE_UNKNOWN | PIPE_CHECK | PIPE_WORRY | PIPES_OK | NO_PIPE | FOOD_<level>
        subjects   : String; // the pipes or food items behind the level, comma-separated
  }

  /** "If you had our crowns this week, this is where they should go, and why" — in order. */
  @readonly @cds.persistence.skip
  entity Actions {
    key ID       : String;
        rank     : Integer;
        kind     : String; // REPAIR | CHECK_PIPE | CHECK_FOOD | EMERGENCY_DELIVERY | ORDER
        level    : String;
        target   : String;
        areas    : String;
        families : Integer;
        days     : Decimal(9, 2);
        leadDays : Integer;
  }
}
