// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AgentWebviewProvider } from './agentWebviewProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('mini-coding-agent 扩展已激活');

  // 注册 webview 视图提供者
  const provider = new AgentWebviewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "mini-coding-agent-view",
      provider
    )	
  );

}

// This method is called when your extension is deactivated
export function deactivate() {}
