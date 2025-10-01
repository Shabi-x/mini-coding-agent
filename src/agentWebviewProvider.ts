import * as vscode from "vscode";

export class AgentWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private context: vscode.ExtensionContext) {}
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Thenable<void> | void {
    // 解决了 VS Code 扩展中 webview 安全限制问题：
    // 1. webview 默认不能直接访问本地文件系统，需要通过 asWebviewUri 转换为安全 URI
    // 2. 使用 Uri.joinPath 确保跨平台路径兼容性，避免硬编码路径分隔符
    // 3. 通过这种方式，webview 可以安全地加载扩展包内的资源文件
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
    
    // 解决了 webview 内容安全策略（CSP）限制：
    // 1. enableScripts: true - 允许 webview 中执行 JavaScript，默认是禁用的
    // 2. localResourceRoots: [this.context.extensionUri] - 明确指定 webview 可以访问的本地资源范围
    //    这限制了 webview 只能访问扩展目录下的资源，防止访问系统其他敏感文件
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
