import * as vscode from 'vscode';

export class AgentWebviewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
    webviewView.webview.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>mini-coding-agent</title>
    </head>
    <body>
      <h1>hello mini-coding-agent</h1>
    </body>
    </html>`;
  }
  
}