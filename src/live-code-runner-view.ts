'use strict';
import * as vscode from 'vscode';

export class LiveCodeRunnerView {
    public result;
    public console_log;
    constructor(){
        this.result = vscode.window.createOutputChannel("Sorna");
        this.console_log = vscode.window.createOutputChannel("Sorna2");
    }
    // Clear all views
    clearView() {
        return this.result.clear();
    }

    // Set content
    setContent(content) {
        return this.result.append(content);
    }

    // Clear content
    clearContent() {
        return this.result.clear();
    }

    // Set error message
    setErrorMessage(content) {
        return this.result.append(content);
    }

    // Adds console message
    addConsoleMessage(content) {
        return this.result.appendLine(content);
    }

    // Clears console message
    clearConsoleMessage() {
        return this.result.clear();
    }

    // Clears error message
    clearErrorMessage() {
        return this.result.clear();
    }
    setKernelIndicator(kernelType) {
        return true;
    }

    show() {
        return this.result.show();
    }
}
