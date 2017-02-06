'use strict';
import * as vscode from 'vscode';
import { LiveCodeRunner } from './live-code-runner';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
/*  class SornaCodeRunnerView implements vscode.TextDocumentContentProvider {
    public provideTextDocumentContent(): string {
      return this.createView();
    }
    private createView(): string {
      return `<body><em>TEST</em></body>`;
    }
  }*/

	//let provider = new SornaCodeRunnerView();
	//let registration = vscode.workspace.registerTextDocumentContentProvider('code-runner-view', provider);
	//let previewUri = vscode.Uri.parse('code-runner-view://authority/code-runner-view');
  //let SornaAPILib = new SornaAPILib();
  let CodeRunner = new LiveCodeRunner();
  let disposable = vscode.commands.registerCommand('extension.runCode', () => {
    return CodeRunner.sendCode();
    //.then((success) => {
		//return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Result').then((success) => {
		//}, (reason) => {
		//	vscode.window.showErrorMessage(reason);
		//});
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
