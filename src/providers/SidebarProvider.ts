// import * as vscode from "vscode";
// import { getUri } from "../utilities/getUri";
// import { getNonce } from "../utilities/getNonce";

// export class SidebarProvider implements vscode.WebviewViewProvider {
//   _view?: vscode.WebviewView;
//   _doc?: vscode.TextDocument;

//   constructor(private readonly _extensionUri: vscode.Uri) {}

//   public resolveWebviewView(webviewView: vscode.WebviewView) {
//     this._view = webviewView;

//     webviewView.webview.options = {
//       // Allow scripts in the webview
//       enableScripts: true,

//       localResourceRoots: [
//         vscode.Uri.joinPath(this._extensionUri, "out"),
//         vscode.Uri.joinPath(this._extensionUri, "webview-ui/build"),
//       ],
//     };

//     webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

//     webviewView.webview.onDidReceiveMessage(async (data) => {
//       switch (data.type) {
//         case "onInfo": {
//           if (!data.value) {
//             return;
//           }
//           vscode.window.showInformationMessage(data.value);
//           break;
//         }
//         case "onError": {
//           if (!data.value) {
//             return;
//           }
//           vscode.window.showErrorMessage(data.value);
//           break;
//         }
//       }
//     });
//   }

//   public revive(panel: vscode.WebviewView) {
//     this._view = panel;
//   }

//   private _getHtmlForWebview(webview: vscode.Webview) {
//     const scriptUri = getUri(webview, this._extensionUri, [
//       "webview-ui",
//       "build",
//       "assets",
//       "index.js",
//     ]);
//     const stylesUri = getUri(webview, this._extensionUri, [
//       "webview-ui",
//       "build",
//       "assets",
//       "index.css",
//     ]);

//     // Use a nonce to only allow a specific script to be run.
//     const nonce = getNonce();

//     return /*html*/ `
//       <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
//           <link rel="stylesheet" type="text/css" href="${stylesUri}">
//           <title>Luna Sidebar</title>
//         </head>
//         <body>
//           <div id="root"></div>
//           <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
//         </body>
//       </html>
//     `;
//   }
// }


import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import { getNonce } from "../utilities/getNonce";
import { getUri } from "../utilities/getUri";

export class SidebarProvider
implements vscode.WebviewViewProvider {

  _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView
  ) {

    this._view = webviewView;

    webviewView.webview.options = {

      enableScripts: true,

      localResourceRoots: [

        vscode.Uri.joinPath(
          this.extensionUri,
          "webview-ui",
          "build"
        )

      ]

    };

    webviewView.webview.html =
      this.getHtml(
        webviewView.webview
      );

    webviewView.webview.onDidReceiveMessage(
      async (data) => {

        switch (data.type) {

          case "saveApiKey":

            await this.context.secrets.store(
              data.provider,
              data.apiKey
            );

            vscode.window.showInformationMessage(
              "API Key Saved"
            );

            break;

          case "getApiKey":

            const key =
              await this.context.secrets.get(
                data.provider
              );

            webviewView.webview.postMessage({

              type: "apiKeyLoaded",
              apiKey: key || ""

            });

            break;

        }

      }
    );

  }

  private getHtml(
    webview: vscode.Webview
  ) {

    const buildPath = path.join(
      this.extensionUri.fsPath,
      "webview-ui",
      "build",
      "assets"
    );

    const files =
      fs.readdirSync(buildPath);

    const jsFile =
      files.find(
        file => file.endsWith(".js")
      );

    const cssFile =
      files.find(
        file => file.endsWith(".css")
      );

    if (!jsFile || !cssFile) {

      throw new Error(
        "Build files not found"
      );

    }

    const scriptUri = getUri(
      webview,
      this.extensionUri,
      [
        "webview-ui",
        "build",
        "assets",
        jsFile
      ]
    );

    const stylesUri = getUri(
      webview,
      this.extensionUri,
      [
        "webview-ui",
        "build",
        "assets",
        cssFile
      ]
    );

    const nonce =
      getNonce();

    return `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
/>

<meta
http-equiv="Content-Security-Policy"
content="
default-src 'none';
style-src ${webview.cspSource} 'unsafe-inline';
script-src 'nonce-${nonce}';
"
/>

<link
href="${stylesUri}"
rel="stylesheet"
/>

</head>

<body>

<div id="root"></div>

<script
nonce="${nonce}"
type="module"
src="${scriptUri}"
></script>

</body>

</html>

`;

  }
}
