'use strict';
/*
vscode-live-code-runner
(C) Copyright 2016-2017 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
import * as vscode from 'vscode';
import { LiveCodeRunner } from './live-code-runner';

export function activate(context: vscode.ExtensionContext) {
  let CodeRunner = new LiveCodeRunner();
  let disposable = vscode.commands.registerCommand('live-code-runner.runCode', () => {
    return CodeRunner.runcode();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}
