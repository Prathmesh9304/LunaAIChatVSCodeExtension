import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

const PROVIDER_CONFIGS: Record<
  string,
  { endpoint: string; format: "openai" | "anthropic" | "gemini" | "ollama" }
> = {
  "OpenAI": { endpoint: "https://api.openai.com/v1/chat/completions", format: "openai" },
  "Mistral": { endpoint: "https://api.mistral.ai/v1/chat/completions", format: "openai" },
  "Groq": { endpoint: "https://api.groq.com/openai/v1/chat/completions", format: "openai" },
  "Ollama": { endpoint: "http://localhost:11434/api/chat", format: "ollama" },
  "Google Gemini": { endpoint: "https://generativelanguage.googleapis.com/v1beta/models/", format: "gemini" },
  "Anthropic": { endpoint: "https://api.anthropic.com/v1/messages", format: "anthropic" }
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, "out"),
        vscode.Uri.joinPath(this._extensionUri, "webview-ui/build"),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Setup file watcher for luna-config.json in workspace
    const configWatcher = vscode.workspace.createFileSystemWatcher("**/luna-config.json");
    const changeSub = configWatcher.onDidChange(async () => {
      const config = await this._readConfig();
      this._view?.webview.postMessage({ type: "config", value: config });
    });
    const createSub = configWatcher.onDidCreate(async () => {
      const config = await this._readConfig();
      this._view?.webview.postMessage({ type: "config", value: config });
    });
    const deleteSub = configWatcher.onDidDelete(async () => {
      const config = await this._readConfig();
      this._view?.webview.postMessage({ type: "config", value: config });
    });

    // Setup file watcher for luna-history.json in workspace
    const historyWatcher = vscode.workspace.createFileSystemWatcher("**/luna-history.json");
    const historyChangeSub = historyWatcher.onDidChange(async () => {
      const history = await this._readHistory();
      this._view?.webview.postMessage({ type: "history", value: history });
    });
    const historyCreateSub = historyWatcher.onDidCreate(async () => {
      const history = await this._readHistory();
      this._view?.webview.postMessage({ type: "history", value: history });
    });
    const historyDeleteSub = historyWatcher.onDidDelete(async () => {
      const history = await this._readHistory();
      this._view?.webview.postMessage({ type: "history", value: history });
    });

    webviewView.onDidDispose(() => {
      changeSub.dispose();
      createSub.dispose();
      deleteSub.dispose();
      configWatcher.dispose();

      historyChangeSub.dispose();
      historyCreateSub.dispose();
      historyDeleteSub.dispose();
      historyWatcher.dispose();
    });

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "getConfig": {
          const config = await this._readConfig();
          webviewView.webview.postMessage({ type: "config", value: config });
          break;
        }
        case "getHistory": {
          const history = await this._readHistory();
          webviewView.webview.postMessage({ type: "history", value: history });
          break;
        }
        case "saveSession": {
          const { sessionId, title, messages } = data.value;
          try {
            const history = await this._readHistory();
            const idx = history.findIndex((h: any) => h.id === sessionId);
            if (idx >= 0) {
              history[idx] = {
                ...history[idx],
                messages,
                timestamp: Date.now()
              };
            } else {
              history.push({
                id: sessionId,
                title,
                timestamp: Date.now(),
                messages
              });
            }
            history.sort((a: any, b: any) => b.timestamp - a.timestamp);
            await this._writeHistory(history);
            webviewView.webview.postMessage({ type: "history", value: history });
          } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to save history: ${err.message}`);
          }
          break;
        }
        case "deleteSession": {
          const { sessionId } = data.value;
          try {
            const history = await this._readHistory();
            const updated = history.filter((h: any) => h.id !== sessionId);
            await this._writeHistory(updated);
            webviewView.webview.postMessage({ type: "history", value: updated });
          } catch (err: any) {
            vscode.window.showErrorMessage(`Failed to delete history: ${err.message}`);
          }
          break;
        }
        case "sendMessage": {
          const { message, provider: providerName, model: modelName } = data.value;
          try {
            const config = await this._readConfig();
            const configItem = config.find(
              (c: any) => c.provider === providerName && c.model === modelName
            );
            if (!configItem || !configItem.apiKey) {
              webviewView.webview.postMessage({
                type: "error",
                value: `No API Key found for provider "${providerName}" and model "${modelName}". Please configure it in Settings.`
              });
              break;
            }
            const apiKey = configItem.apiKey;

            let userPrompt = message;
            if (this._shouldIncludeCodeContext(message)) {
              const activeEditor = vscode.window.activeTextEditor;
              if (activeEditor) {
                const document = activeEditor.document;
                const fileName = document.fileName;
                const fileLanguage = document.languageId;
                const selection = activeEditor.selection;
                const selectedText = document.getText(selection);
                
                let codeSnippet = "";
                if (selectedText && selectedText.trim().length > 0) {
                  codeSnippet = `\n\nHere is the selected code from the file "${fileName}" (language: ${fileLanguage}):\n\`\`\`${fileLanguage}\n${selectedText}\n\`\`\`\n`;
                } else {
                  const fileText = document.getText();
                  codeSnippet = `\n\nHere is the content of the file "${fileName}" (language: ${fileLanguage}):\n\`\`\`${fileLanguage}\n${fileText}\n\`\`\`\n`;
                }
                userPrompt = `${message}${codeSnippet}`;
              }
            }

            const reply = await this._callProviderAPI(providerName, modelName, apiKey, userPrompt);
            webviewView.webview.postMessage({ type: "reply", value: reply });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: "error",
              value: err.message || "An unexpected error occurred."
            });
          }
          break;
        }
        case "saveConfig": {
          await this._writeConfig(data.value);
          vscode.window.showInformationMessage("Configuration saved successfully.");
          break;
        }
        case "editConfig": {
          const uri = this._getConfigUri();
          try {
            await vscode.workspace.fs.stat(uri);
          } catch (e) {
            // Write default config if not existing
            await this._writeConfig(this._getDefaultConfig());
          }
          const doc = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(doc);
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getConfigUri(): vscode.Uri {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return vscode.Uri.joinPath(workspaceFolders[0].uri, "luna-config.json");
    }
    // Fallback to extension context global storage
    return vscode.Uri.joinPath(this._extensionUri, "luna-config.json");
  }

  private async _readConfig(): Promise<any> {
    const uri = this._getConfigUri();
    try {
      const data = await vscode.workspace.fs.readFile(uri);
      const content = new TextDecoder().decode(data);
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return this._getDefaultConfig();
    }
  }

  private async _writeConfig(config: any): Promise<void> {
    const uri = this._getConfigUri();
    const content = JSON.stringify(config, null, 2);
    const data = new TextEncoder().encode(content);
    await vscode.workspace.fs.writeFile(uri, data);
  }

  private _getDefaultConfig() {
    return [];
  }

  private _shouldIncludeCodeContext(message: string): boolean {
    const msg = message.toLowerCase();
    const keywords = [
      "this code",
      "this file",
      "my code",
      "code here",
      "current file",
      "current code",
      "active file",
      "active code",
      "explain this",
      "refactor this",
      "analyze this",
      "optimize this",
      "fix this",
      "find bugs in this",
      "review this",
      "what does this do",
      "explain the code",
      "refactor the code",
      "analyze the code",
      "optimize the code",
      "fix the code",
      "review the code",
      "selected code",
      "selected file"
    ];
    return keywords.some(keyword => msg.includes(keyword));
  }

  private _mapModelName(provider: string, model: string): string {
    return model;
  }

  private async _callProviderAPI(
    providerName: string,
    model: string,
    apiKey: string,
    prompt: string
  ): Promise<string> {
    const apiModel = this._mapModelName(providerName, model);
    const systemPrompt = `You are Luna, an intelligent code analysis and refactoring assistant. You are integrated as a VS Code extension interface designed to help developers refactor and analyze their code directly within the IDE.

PROJECT CONTEXT:
- You were developed as a Major Project ("Code Refactoring and Analyzing Tool") by final-year Computer Engineering students: Jay Zore, Om Pimple, and Prathmesh Bhoir.
- Your developers are from Dr. Babasaheb Ambedkar Technological University (DBATU), Lonere.
- If asked about your creators, university, or extension context, share these details proudly and concisely.

INSTRUCTIONS:
1. **Analyze the Input**: Determine if the input is a conversational message (e.g., "Hi", "Hello", "How are you", "Explain this") or a reusable code snippet.

2. **IF CONVERSATIONAL / NOT CODE**:
   - Respond naturally, concisely, and helpfully.
   - Do NOT generate a structured Analysis Report.
   - Do NOT analyze simple strings like "Hello" as code.

3. **IF CODE SNIPPET / CODE-RELATED ANALYSIS REQUEST**:
   - Generate a structured, clean **Luna Analysis Report** in Markdown.
   - **Format**:
     - **Header**: Start immediately with a H2 header identifying the quality: e.g., \`## 🟢 Code Quality: Good\` (or valid rating/emoji: \`🟡 Code Quality: Needs Improvement\`, \`🔴 Code Quality: Critical Issues\`).
     - **Summary**: One line summary of what the code does.
     - **Input**: Show the user's code in a code block under \`### 📝 Source Code\`.
     - **Analysis**: Use these clear sections:
       - \`### ⚠️ Issues & Smells\` (Bulleted list of issues, be concise)
       - \`### 🛠️ Refactoring\` (Provide the refactored code in a clean code block)
       - \`### 💡 Best Practices\` (Bulleted list of recommendations)
   - **Style**:
     - Use emojis for visual hierarchy.
     - Keep text concise and readable.
     - Do not be overly verbose.
     - ALWAYS enclose any generated code from your side inside markdown code blocks (e.g. \`\`\`language\\ncode\\n\`\`\`) so the interface can display it properly.`;

    const providerKey = Object.keys(PROVIDER_CONFIGS).find(
      key => key.toLowerCase() === providerName.toLowerCase()
    ) || providerName;

    const providerConfig = PROVIDER_CONFIGS[providerKey];

    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${providerName}. Please add its configuration in SidebarProvider.ts.`);
    }

    const { endpoint, format } = providerConfig;

    switch (format) {
      case "openai": {
        const response = await (globalThis as any).fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: apiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`${providerName} API request failed: ${response.statusText} (${response.status}) - ${errText}`);
        }

        const data: any = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        throw new Error(`Invalid response from ${providerName} API.`);
      }

      case "gemini": {
        const url = `${endpoint}${apiModel}:generateContent?key=${apiKey}`;
        const response = await (globalThis as any).fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser request:\n${prompt}` }]
              }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API request failed: ${response.statusText} (${response.status}) - ${errText}`);
        }

        const data: any = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error("Invalid response from Gemini API.");
      }

      case "anthropic": {
        const response = await (globalThis as any).fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: apiModel,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              { role: "user", content: prompt }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Anthropic API request failed: ${response.statusText} (${response.status}) - ${errText}`);
        }

        const data: any = await response.json();
        if (data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text;
        }
        throw new Error("Invalid response from Anthropic API.");
      }

      case "ollama": {
        const response = await (globalThis as any).fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: apiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ],
            stream: false
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama API request failed: ${response.statusText} (${response.status}) - ${errText}`);
        }

        const data: any = await response.json();
        if (data.message && data.message.content) {
          return data.message.content;
        }
        throw new Error("Invalid response from Ollama API.");
      }

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private _getHistoryUri(): vscode.Uri {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return vscode.Uri.joinPath(workspaceFolders[0].uri, "luna-history.json");
    }
    return vscode.Uri.joinPath(this._extensionUri, "luna-history.json");
  }

  private async _readHistory(): Promise<any[]> {
    const uri = this._getHistoryUri();
    try {
      const data = await vscode.workspace.fs.readFile(uri);
      const content = new TextDecoder().decode(data);
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  private async _writeHistory(history: any[]): Promise<void> {
    const uri = this._getHistoryUri();
    const content = JSON.stringify(history, null, 2);
    const data = new TextEncoder().encode(content);
    await vscode.workspace.fs.writeFile(uri, data);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.js",
    ]);
    const stylesUri = getUri(webview, this._extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:; connect-src ${webview.cspSource};">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Luna Sidebar</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
