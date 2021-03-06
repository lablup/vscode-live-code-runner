'use strict';
/*
vscode-live-code-runner
(C) Copyright 2016-2017 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */
import * as vscode from 'vscode';

export class LiveCodeRunnerView {
    public result;
    public console_log;
    private provider;
    private registration;
    private previewUri;
    constructor(){
        this.console_log = vscode.window.createOutputChannel("Backend.AI");
        this.provider = new SornaCodeRunnerInteractiveView();
        this.registration = vscode.workspace.registerTextDocumentContentProvider('code-runner-view', this.provider);
        this.previewUri = vscode.Uri.parse('code-runner-view://authority/code-runner-view');
    }

    // Clear content
    clearConsole() {
        return this.console_log.clear();
    }

    // Set error message
    setErrorMessage(content) {
        return this.console_log.appendLine('[ERROR] '+ content);
    }

    // Adds console message
    addConsoleMessage(content) {
        return this.console_log.appendLine(content);
    }

    showConsole() {
        return this.console_log.show();
    }

    addOutput(consoleItems) {
        let html: string = '';
        for (let c of Array.from(consoleItems)) {
            switch (c[0]) {
            case 'stdout':
                html += `<span class="live-console stdout">${this.escapeHtml(c[1])}</span>`;
                break;
            case 'stderr':
                html += `<span class="live-console stderr">${this.escapeHtml(c[1])}</span>`;
                break;
            case 'media':
                switch (c[1][0]) {
                case 'image/svg+xml':
                    html += c[1][1];
                    break;
                default:
                    // pass
                }
                break;
            default:
                // pass
            }
        }
        this.addHtmlContent(html);
        return html != '';
    }

    addHtmlContent(content) {
        this.provider.appendContent(content);
    	return this.provider.update(this.previewUri);
    }

    clearHtmlContent() {
        this.provider.clearContent();
    	return this.provider.update(this.previewUri);
    }

    showResultPanel(){
        return vscode.commands.executeCommand('vscode.previewHtml', this.previewUri, vscode.ViewColumn.Two, 'RESULT');
    }

    private escapeHtml(text) {
        return text.replace(/[\"&<>]/g, function (a) {
        return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
        });
    }
}

export class SornaCodeRunnerInteractiveView implements vscode.TextDocumentContentProvider {
    private _content: string;
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createView();
    }
    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    public setContent(content): boolean {
        this._content = content;
        return true;
    }
    public appendContent(content): boolean {
        if (this._content === undefined) {
            this._content = '';
        }
        this._content = this._content + content;
        return true;
    }
    public clearContent(): boolean {
        this._content = `<style>
            .live-console {
                font-family: monospace;
                white-space: pre;
            }
            .stderr {
                color: #ff2222;
            }
        </style>`;
        return true;
    }
    private createView(): string {
        if (this._content === undefined) {
            this._content = '';
        }
        return `<style>
            .live-console {
                font-family: monospace;
                white-space: pre;
            }
            .stderr {
                color: #ff2222;
            }
        </style>` + this._content;
    }
}

