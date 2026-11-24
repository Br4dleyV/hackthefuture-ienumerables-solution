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

/**
 * Rowan's Monday page. Both lists are bound to CouncilService in Main.view.xml (order and levels
 * come from the backend); this controller turns codes into sentences and prints the page.
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

  public tierText(tier: Value): string {
    return this.text(`tier_${String(tier)}`);
  }

  public trendText(trend: Value): string {
    return this.text(`trend${String(trend)}`);
  }

  public trendState(trend: Value): `${ValueState}` {
    return trend === "BETTER" ? "Success" : trend === "WORSE" ? "Error" : "None";
  }

  public trendIcon(trend: Value): string {
    return trend === "BETTER" ? "sap-icon://ti/trending-up" : trend === "WORSE" ? "sap-icon://ti/trending-down" : trend === "SAME" ? "sap-icon://ti/equal" : "sap-icon://ti/point";
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

  public areaWater(code: Value): string {
    return this.text(`water_${String(code)}`);
  }

  public areaFood(code: Value, items: Value): string {
    return this.text(`food_${String(code)}`, [items]);
  }

  public costText(cost: Value): string {
    return Number(cost) > 0 ? this.text("crowns", [cost]) : this.text("noCrowns");
  }

  /** One plain sentence per spending line — routes by place name, never pipe codes (Rowan: no jargon). */
  public actionWhy(
    kind: Value, level: Value, target: Value, from: Value, to: Value,
    areas: Value, families: Value, days: Value, leadDays: Value,
  ): string {
    switch (kind) {
      case "REPAIR":
        if (!areas) return this.text("actionRepairNobody", [from, to]);
        if (level === "WORRY") return this.text("actionRepairWeak", [from, to, areas]);
        return families ? this.text("actionRepairFamilies", [from, to, families, areas]) : this.text("actionRepair", [from, to, areas]);
      case "CHECK_PIPE": return this.text("actionCheckPipe", [from, to]);
      case "CHECK_FOOD": return this.text("actionCheckFood", [target]);
      case "EMERGENCY_DELIVERY": return this.text("actionEmergencyDelivery", [target, days, leadDays]);
      case "ORDER": return this.text("actionOrder", [target]);
      default: return "";
    }
  }
}
