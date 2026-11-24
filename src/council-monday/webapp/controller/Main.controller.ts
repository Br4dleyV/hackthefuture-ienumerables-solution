import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type { ValueState } from "sap/ui/core/library";

type Value = string | number | null | undefined;

const STATE: Record<string, `${ValueState}`> = { URGENT: "Error", UNKNOWN: "None", WORRY: "Warning", OK: "Success" };
const ICON: Record<string, string> = {
  URGENT: "sap-icon://ti/alert-octagon",
  UNKNOWN: "sap-icon://ti/help-circle",
  WORRY: "sap-icon://ti/alert-triangle",
  OK: "sap-icon://ti/circle-check",
};
const WATER_STATE: Record<string, `${ValueState}`> = {
  WATER_BROKEN: "Error", WATER_UNSURE: "None", WATER_WEAK: "Warning", WATER_OK: "Success", OWN_WELL: "Success", WATER_UNKNOWN: "None",
};

/**
 * Rowan's Monday page. All lists are bound to CouncilService in Main.view.xml (order, levels and costs
 * come from the backend); this controller turns codes into short words and prints the page.
 *
 * @namespace oakhaven.council.controller
 */
export default class Main extends Controller {
  private bundle?: ResourceBundle;

  public onInit(): void {
    this.getView()?.setModel(new JSONModel({ loadedAt: new Date() }), "view");
    void this.start();
  }

  private async start(): Promise<void> {
    this.bundle = await (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle();
    // Formatters may have run before the texts were loaded: read once more now that they are.
    this.getOwnerComponent()?.getModel()?.refresh();
  }

  /** The date on the printed page = when this data was read. */
  public onLoaded(): void {
    (this.getView()?.getModel("view") as JSONModel).setProperty("/loadedAt", new Date());
  }

  /**
   * Rowan: "on paper, if you please" — the browser's print dialog (style.css makes it paper-friendly).
   * Afterwards the server remembers what the council saw, so next time the page says "better or worse".
   */
  public async onPrint(): Promise<void> {
    // tsconfig has no DOM types (lib: ES2022), so describe the one browser function we need.
    (globalThis as unknown as { print(): void }).print();
    const model = this.getOwnerComponent()?.getModel() as ODataModel;
    try {
      await model.bindContext("/recordPrintedPage(...)").invoke();
      MessageToast.show(this.text("printSaved"));
      model.refresh();
    } catch (error) {
      MessageBox.error(error instanceof Error ? error.message : String(error));
    }
  }

  private text(key: string, args?: Value[]): string {
    // Decimals may arrive as "3.33": Number() keeps them short ("3.33", "4").
    const show = (a: Value): string => (a === null || a === undefined || a === "" ? "?" : Number.isNaN(Number(a)) ? String(a) : String(Number(a)));
    return this.bundle?.getText(key, args?.map(show)) ?? "";
  }

  public levelText(level: Value): string {
    return this.text(`level${String(level)}`);
  }

  public levelState(level: Value): `${ValueState}` {
    return STATE[String(level)] ?? "None";
  }

  public levelIcon(level: Value): string {
    return ICON[String(level)] ?? ICON.UNKNOWN;
  }

  /** "3 All right" — the count of village parts per level, for the summary at the top. */
  public levelCount(level: string, count: Value): string {
    return `${String(count ?? 0)} ${this.levelText(level)}`;
  }

  public trendText(trend: Value): string {
    return this.text(`trend${String(trend)}`);
  }

  public waterText(code: Value): string {
    return this.text(`water_${String(code)}`);
  }

  public waterState(code: Value): `${ValueState}` {
    return WATER_STATE[String(code)] ?? "None";
  }

  public foodText(code: Value, items: Value): string {
    return this.text(`food_${String(code)}`, [items]);
  }

  public foodState(code: Value): `${ValueState}` {
    const value = String(code);
    return value.startsWith("FOOD_SHORT") ? "Error" : value.startsWith("FOOD_UNSURE") ? "None" : "Success";
  }

  public costsCrowns(cost: Value): boolean {
    return Number(cost) > 0;
  }

  public costText(cost: Value): string {
    return this.text("crowns", [cost]);
  }

  /** A note only for CAN_WAIT (backup pipe: crowns stay in reserve) and NO_BUDGET (500 crowns used up). */
  public hasNote(advice: Value): boolean {
    return advice === "CAN_WAIT" || advice === "NO_BUDGET";
  }

  public noteText(advice: Value): string {
    return advice === "CAN_WAIT" ? this.text("canWait") : advice === "NO_BUDGET" ? this.text("notThisWeek") : "";
  }

  public noteState(advice: Value): `${ValueState}` {
    return advice === "NO_BUDGET" ? "Warning" : "Information";
  }

  /** Short title per line — places by name, never pipe codes (Rowan: no jargon). */
  public actionTitle(kind: Value, target: Value, from: Value, to: Value, areas: Value): string {
    switch (kind) {
      case "REPAIR": return areas ? this.text("titleRepair", [to]) : this.text("titleRepairBackup", [from]);
      case "CHECK_PIPE": return this.text("titleCheckPipe", [to]);
      case "CHECK_FOOD": return this.text("titleCheckFood", [target]);
      case "EMERGENCY_DELIVERY": return this.text("titleEmergencyDelivery", [target]);
      case "ORDER": return this.text("titleOrder", [target]);
      default: return "";
    }
  }

  /** Short why = why it sits at this place (Rowan: "tell us why something comes first"). */
  public actionWhy(tier: Value, kind: Value, families: Value, areas: Value, days: Value, leadDays: Value): string {
    if (Number(tier) === 1) return families ? this.text("why_1_families", [families]) : this.text("why_1", [areas]);
    if (Number(tier) === 2) return this.text("why_2", [days, leadDays]);
    return this.text(`why_${String(tier)}`);
  }
}
