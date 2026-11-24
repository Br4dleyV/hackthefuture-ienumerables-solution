import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type Context from "sap/ui/model/Context";
import type { ValueState } from "sap/ui/core/library";

type Value = string | number | null | undefined;

const REFRESH_MS = 20_000;

const STATE: Record<string, `${ValueState}`> = {
  EMERGENCY: "Error",
  WORRY: "Warning",
  CHECK: "Information",
  UNKNOWN: "None",
  OK: "Success",
};
const ICON: Record<string, string> = {
  EMERGENCY: "sap-icon://ti/alert-octagon",
  WORRY: "sap-icon://ti/alert-triangle",
  CHECK: "sap-icon://ti/zoom-question",
  UNKNOWN: "sap-icon://ti/help-circle",
  OK: "sap-icon://ti/circle-check",
};
const SECTION: Record<string, string> = {
  EMERGENCY: "sectionUrgent",
  WORRY: "sectionUrgent",
  // Maren: "someone has to go and look"; Ilse: clashing numbers can't be trusted until Maren checks.
  CHECK: "sectionUrgent",
  UNKNOWN: "sectionUrgent",
  OK: "sectionOk",
};

/**
 * The morning round. The lists are bound to /MorningRound in Main.view.xml (the order and status
 * come from the backend); this controller only refreshes every 20 s and turns codes into texts.
 *
 * @namespace oakhaven.waterround.controller
 */
export default class Main extends Controller {
  private bundle?: ResourceBundle;
  private timer?: ReturnType<typeof setInterval>;

  public onInit(): void {
    this.getView()?.setModel(new JSONModel({ lastUpdated: null }), "view");
    void this.start();
  }

  public onExit(): void {
    clearInterval(this.timer);
  }

  private async start(): Promise<void> {
    const i18n = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
    this.bundle = await i18n.getResourceBundle();
    // Re-read once now (formatters may have run before the texts were loaded), then every 20 s,
    // so "older than 15 minutes" is re-checked live by the backend.
    this.onRefresh();
    this.timer = setInterval(() => this.onRefresh(), REFRESH_MS);
  }

  public onRefresh(): void {
    this.getOwnerComponent()?.getModel()?.refresh();
  }

  public onListUpdateFinished(): void {
    (this.getView()?.getModel("view") as JSONModel).setProperty("/lastUpdated", new Date());
  }

  private text(key: string, args?: Value[]): string {
    // Decimals arrive raw ("22.00"): Number() drops the trailing zeros → "22".
    const show = (a: Value): string => (a === null || a === undefined || a === "" ? "?" : Number.isNaN(Number(a)) ? String(a) : String(Number(a)));
    return this.bundle?.getText(key, args?.map(show)) ?? "";
  }

  /** Group function of the morning list: one header per section. */
  public getSection(context: Context): { key: string; text: string } {
    const key = SECTION[String(context.getProperty("status"))] ?? "sectionUnknown";
    return { key, text: this.text(key) };
  }

  public statusText(status: Value): string {
    return this.text(`status${String(status)}`);
  }

  public statusState(status: Value): `${ValueState}` {
    return STATE[String(status)] ?? "None";
  }

  public statusIcon(status: Value): string {
    return ICON[String(status)] ?? ICON.UNKNOWN;
  }

  /** The one "why" sentence, e.g. "Flow 31% of normal, 22 PSI — 140 families in North Residential Area without water." */
  public formatWhy(
    status: Value, reasonCode: Value, flowPercent: Value, pressure: Value, age: Value,
    sensorFlow: Value, pipeFlow: Value, pipePressure: Value, nominal: Value,
    landmark: Value, kind: Value, families: Value,
  ): string {
    switch (reasonCode) {
      case "NO_SENSOR": return this.text("whyNoSensor");
      case "MISSING": return this.text("whyMissing");
      case "STALE": return this.text("whyStale", [age]);
      case "NEGATIVE": return this.text("whyNegative", [sensorFlow, pressure]);
      case "OVER_NOMINAL": return this.text("whyOverNominal", [sensorFlow, nominal, pipeFlow]);
      case "SENSOR_VS_PIPE": return this.text("whySensorVsPipe", [sensorFlow, pressure, pipeFlow, pipePressure]);
    }
    const readings = this.text("whyReadings", [flowPercent, pressure]);
    if (status === "OK") return readings;
    const impact = !landmark
      ? this.text("impactNobody")
      : families
        ? this.text("impactFamilies", [families, landmark])
        : (this.bundle?.getText(`impact${String(kind)}`, [String(landmark)], true) ?? this.text("impactOther", [landmark]));
    return this.text("whyWithImpact", [readings, impact]);
  }
}
