import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
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

  /** Rowan: "on paper, if you please" — the browser's print dialog; style.css makes it paper-friendly. */
  public onPrint(): void {
    // tsconfig has no DOM types (lib: ES2022), so describe the one browser function we need.
    (globalThis as unknown as { print(): void }).print();
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

  public areaName(area: Value): string {
    return area === "PANTRY" ? this.text("pantryArea") : String(area ?? "");
  }

  public areaWhy(reasonCode: Value, subjects: Value): string {
    return this.text(`areaWhy_${String(reasonCode)}`, [subjects]);
  }

  /** One sentence per spending line: what to do, and why it sits at this place. */
  public actionWhy(kind: Value, level: Value, target: Value, areas: Value, families: Value, days: Value, leadDays: Value): string {
    switch (kind) {
      case "REPAIR":
        if (!areas) return this.text("actionRepairNobody", [target]);
        if (level === "WORRY") return this.text("actionRepairWeak", [target, areas]);
        return families ? this.text("actionRepairFamilies", [target, families, areas]) : this.text("actionRepair", [target, areas]);
      case "CHECK_PIPE": return this.text("actionCheckPipe", [target, areas]);
      case "CHECK_FOOD": return this.text("actionCheckFood", [target]);
      case "EMERGENCY_DELIVERY": return this.text("actionEmergencyDelivery", [target, days, leadDays]);
      case "ORDER": return this.text("actionOrder", [target]);
      default: return "";
    }
  }
}
