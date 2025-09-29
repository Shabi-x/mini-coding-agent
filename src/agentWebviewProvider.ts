import * as vscode from 'vscode';

export class AgentWebviewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
    throw new Error('Method not implemented.');
  }
  
}