import IconPool from "sap/ui/core/IconPool";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * Maren's Morning Round. Models, root view and i18n are declared in manifest.json.
 *
 * @namespace oakhaven.waterround
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: "json",
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
  };

  public init(): void {
    // Tabler Icons as `sap-icon://ti/<name>` (font served by srv/lib/icon-fonts.ts).
    IconPool.registerFont({
      fontFamily: "tabler-icons",
      fontURI: "/vendor/tabler-icons/",
      collectionName: "ti",
      lazy: true,
    });
    super.init();
  }
}
