import { commands, ExtensionContext, window } from "vscode";
import { SidebarProvider } from "./providers/SidebarProvider";

export function activate(context: ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    window.registerWebviewViewProvider("luna.sidebar", sidebarProvider),
  );
}
