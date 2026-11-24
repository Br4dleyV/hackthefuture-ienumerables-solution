import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import type Dialog from "sap/m/Dialog";
import type { Button$PressEvent } from "sap/m/Button";
import type { ListBase$UpdateFinishedEvent } from "sap/m/ListBase";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";

interface DeliveryForm {
  quantity: string;
  supplier: string;
  receivedAt: Date | null;
}

/**
 * The one page of the Oakhaven app. Every table is bound straight to the OData services in
 * Main.view.xml, so this controller only keeps a small "view" model with UI state.
 *
 * @namespace oakhaven.village.controller
 */
export default class Main extends Controller {
  private deliveryDialog?: Dialog;

  public onInit(): void {
    const viewModel = new JSONModel({
      // Resolved through the module system so the image also loads inside the launchpad.
      mapUrl: sap.ui.require.toUrl("oakhaven/village/img/oakhaven-map.jpg"),
      counts: {},
      delivery: { quantity: "", supplier: "", receivedAt: null },
    });
    this.getView()?.setModel(viewModel, "view");
  }

  /** Shows the number of rows of a table as the count on its tab. */
  public onTableUpdateFinished(event: ListBase$UpdateFinishedEvent): void {
    const view = this.getView();
    const table = event.getSource();
    if (!view || !table) return;
    const viewModel = view.getModel("view") as JSONModel;
    viewModel.setProperty(`/counts/${view.getLocalId(table.getId())}`, event.getParameter("total"));
  }

  /** Opens the "delivery arrived" dialog for the pressed pantry row (supplier and time pre-filled). */
  public async onReceiveDelivery(event: Button$PressEvent): Promise<void> {
    const context = event.getSource().getBindingContext("food") as Context;
    // loadFragment adds the dialog to the view's dependents, so it is destroyed with the view.
    this.deliveryDialog ??= (await this.loadFragment({ name: "oakhaven.village.view.ReceiveDelivery" })) as Dialog;
    const form: DeliveryForm = { quantity: "", supplier: String(context.getProperty("supplierName") ?? ""), receivedAt: new Date() };
    (this.getView()?.getModel("view") as JSONModel).setProperty("/delivery", form);
    this.deliveryDialog.setBindingContext(context, "food");
    this.deliveryDialog.open();
  }

  /** Calls FoodStockService.receiveDelivery on the item; the server validates and updates the stock. */
  public async onSaveDelivery(): Promise<void> {
    const dialog = this.deliveryDialog;
    const context = dialog?.getBindingContext("food") as Context | undefined;
    if (!dialog || !context) return;
    const form = (this.getView()?.getModel("view") as JSONModel).getProperty("/delivery") as DeliveryForm;
    const model = context.getModel() as ODataModel;
    const action = model.bindContext("FoodStockService.receiveDelivery(...)", context);
    action
      .setParameter("quantity", form.quantity)
      .setParameter("supplier", form.supplier)
      // CDS DateTime has seconds precision: ISO without milliseconds.
      .setParameter("receivedAt", form.receivedAt ? `${form.receivedAt.toISOString().slice(0, 19)}Z` : null);
    dialog.setBusy(true);
    try {
      await action.invoke();
      const bundle = await (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle();
      MessageToast.show(bundle.getText("receiveDone", [String(context.getProperty("name"))]) ?? "");
      dialog.close();
      model.refresh();
    } catch (error) {
      MessageBox.error(error instanceof Error ? error.message : String(error));
    } finally {
      dialog.setBusy(false);
    }
  }

  public onCancelDelivery(): void {
    this.deliveryDialog?.close();
  }
}
