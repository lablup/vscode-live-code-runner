'use strict';
import * as vscode from 'vscode';
import { LiveCodeRunner } from './live-code-runner';

export function activate(context: vscode.ExtensionContext) {
  let CodeRunner = new LiveCodeRunner();
  let disposable = vscode.commands.registerCommand('extension.runCode', () => {
    return CodeRunner.sendCode();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}
