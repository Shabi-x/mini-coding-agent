import * as vscode from "vscode";

export class AgentWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Thenable<void> | void {
    // 构造安全的 URI 用于 webview 加载
    const ScriptUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri,
      "agent-webview",
      "dist",
      "assets",
      "index.js"
    ));
    const StyleUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(
      this.context.extensionUri,
      "agent-webview",
      "dist",
      "assets",
      "index.css"
    ));
    // 允许webview加载本地资源
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    webviewView.webview.html = 
    `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>agent-webview</title>
          <script type="module" crossorigin src="${ScriptUri}"></script>
          <link rel="stylesheet" crossorigin href="${StyleUri}">
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>`
      ;
  }
}
