'use strict';
const vscode = require("vscode");
const live_code_runner_1 = require("./live-code-runner");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
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
    let CodeRunner = new live_code_runner_1.LiveCodeRunner();
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
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map