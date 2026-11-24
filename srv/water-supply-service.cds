using { oakhaven.curse as db } from '../db/schema';

/**
 * Water data of Oakhaven: pipes, their sensors and repairs, and the village landmarks.
 * Served at /odata/v4/water-supply — try http://localhost:4004/odata/v4/water-supply/WaterPipes
 */
// `impl` points CAP at the TypeScript handler file (written without the `.ts` extension).
service WaterSupplyService @(path: 'water-supply', impl: 'srv/water-supply-service') {

  @readonly
  entity WaterPipes as projection on db.WaterPipes {
    *,
    // 👋 EXAMPLE — a computed field. `virtual` = part of the API, but not a column in the database.
    //    CAP returns null for it until a handler fills it in: see addDaysSinceMaintenance in
    //    water-supply-service.ts. Shown as a column in src/oakhaven-app/webapp/view/Main.view.xml.
    virtual null as daysSinceMaintenance : Integer
  };

  @readonly
  entity Sensors    as projection on db.Sensors;

  @readonly
  entity Repairs    as projection on db.Repairs;

  @readonly
  entity Landmarks  as projection on db.Landmarks;

  @readonly @cds.persistence.skip
  entity LedgerEvidence {
    key ID               : UUID;
        recordName       : String;
        recordType       : String;
        evidence         : String;
        observed         : Decimal(15,2);
        pipeFlow         : Decimal(15,2);
        capacity         : Decimal(15,2);
        modifiedAt       : DateTime;
        modifiedBy       : String;
        nightEdit        : Boolean;
        systemEdit       : Boolean;
        unnamedEdit      : Boolean;
        relatedCount     : Integer;
        councilCandidate : Boolean;
  }

  /** Ilse: "when it all started, and whether it happened at once or bit by bit" — one row. */
  @readonly @cds.persistence.skip
  entity LedgerTimeline {
    key ID          : String;
        oddChanges  : Integer;   // changed at night, under a system account or without a name
        firstChange : DateTime;
        lastChange  : DateTime;
        nights      : Integer;   // different record dates they fall on (1 = all at once)
  }

  /**
   * Maren's morning round: every pipe, in visiting order, with status and the "why" inputs.
   * No table (`@cds.persistence.skip`): computed on every READ from pipes + sensors + landmarks
   * in water-supply-service.ts → srv/lib/morning-round.ts. Try /odata/v4/water-supply/MorningRound
   */
  @readonly @cds.persistence.skip
  entity MorningRound {
    key pipeID           : String;
        rank             : Integer;
        today            : Boolean; // one of the crew's REPAIRS_PER_DAY visits for today
        status           : String;  // EMERGENCY | WORRY | CHECK | UNKNOWN | OK
        reasonCode       : String;  // READINGS | NO_SENSOR | MISSING | STALE | NEGATIVE | OVER_NOMINAL | SENSOR_VS_PIPE
        location         : String;
        sensorID         : String;
        flowPercent      : Integer;        // sensor flow / nominal, rounded
        sensorFlow       : Decimal(15, 2); // L/min
        sensorPressure   : Decimal(15, 2); // PSI
        nominalFlow      : Decimal(9, 2);  // L/min
        pipeFlow         : Decimal(9, 2);  // L/min — the pipe record's own value, for comparison
        pipePressure     : Decimal(9, 2);  // PSI
        readingAt        : DateTime;
        readingAgeMinutes: Integer;
        affectedLandmarks: String;
        impactLandmark   : String;
        impactKind       : String;
        families         : Integer;
        lastMaintenance  : DateTime;
        daysSinceMaintenance : Integer;
        mapPath          : String;
  }
}
