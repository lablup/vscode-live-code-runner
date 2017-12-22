'use strict';
/*
vscode-live-code-runner
(C) Copyright 2016-2017 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */

import * as vscode from 'vscode';
import * as ai from 'backend.ai-client';
import { LiveCodeRunnerView } from './live-code-runner-view';

export class LiveCodeRunner {
    private resultPanel;
    private code: string;
    private runId: string;
    private signKey: string;
    private kernelId: string;
    private kernelType: string;
    private clientConfig: ai.backend.Config;
    private client: ai.backend.Client;
    private view: LiveCodeRunnerView;
    private _exec_starts: number;
    private _config: vscode.WorkspaceConfiguration;
    public continuation: boolean;
    public waiting_input: boolean;

    constructor() {
        this.resultPanel = null;
        this.code = null;
        this.runId = null;
        this.signKey = null;
        this.kernelId = null;
        this.kernelType = null;
        // config is read at first execution
        this.clientConfig = null;
        this.client = null;
        this.view = new LiveCodeRunnerView();
        this._exec_starts = 0;
        this._config = null;
        this.continuation = false;
        this.waiting_input = false;
    }

    get accessKey(): string {
        return this.clientConfig.accessKey;
    }

    get secretKey(): string {
        return this.clientConfig.secretKey;
    }

    get endpoint(): string {
        return this.clientConfig.endpoint;
    }

    private ensureClient() {
        if (this._config === null) {
            this._config = vscode.workspace.getConfiguration('live-code-runner');
            this.clientConfig = new ai.backend.ClientConfig(
                this._config.get('accessKey'),
                this._config.get('secretKey'),
                this._config.get('endpoint'),
            );
            let pkgVersion = '2.1.0';  // TODO: read from package.json
            this.client = new ai.backend.Client(
                this.clientConfig,
                `Live Code Runner ${pkgVersion}; VSCode ${vscode.version}`,
            );
        }
    }

    checkMandatorySettings() {
        let missingSettings = [];
        if (this.accessKey === undefined) {
            missingSettings.push("Access Key");
        }
        if (this.secretKey === undefined) {
            missingSettings.push("Secret Key");
        }
        if (missingSettings.length) {
            this.notifyMissingMandatorySettings(missingSettings);
        }
        return missingSettings.length === 0;
    }

    notifyMissingMandatorySettings(missingSettings) {
        let errorMsg = `live-code-runner: Please input following settings: ${missingSettings.join(', ')}`;
        vscode.window.showInformationMessage(errorMsg);
        return true;
    }

    runcode() {
        this.ensureClient();
        this.view.clearConsole();
        let kernelType = this.chooseKernelType();
        if (kernelType === null) {
            let errorMsg = "live-code-runner: Could not detect the code language.";
            vscode.window.showErrorMessage(errorMsg);
            vscode.window.setStatusBarMessage(errorMsg, 1000);
            return false;
        }
        if ((kernelType !== this.kernelType) || (this.kernelId === null)) {
            if (this.kernelId !== null) {
                console.log('runcode: destroyKernel');
                let destroyAndCreateAndRun = this.destroyKernel(this.kernelId)
                .then( result => {
                    if (result === true) {
                        return this.createKernel(kernelType);
                    } else {
                        return false;
                    }
                })
                .then( result => {
                    if (result === true) {
                        this.kernelType = kernelType;
                        this.runId = this.generateRunId();
                        return this.sendCode();
                    }
                });
                return true;
            } else {
                let createAndRun = this.createKernel(kernelType).then( (result) => {
                    if (result === true) {
                        this.kernelType = kernelType;
                        this.runId = this.generateRunId();
                        return this.sendCode();
                    } else {
                        console.log("[ERROR] Tried to spawn kernel but error found.");
                    }
                }).catch( e => {
                    console.log("[ERROR] Kernel creation request failed.", e);
                });
                return true;
            }
        } else {
            return this.sendCode();
        }
    }

    getAPIversion() {
        this.ensureClient();
        return this.client.getAPIversion()
        .then(response => {
            return response.version;
        }).catch((errorType, errorMsg) => {
            vscode.window.showErrorMessage(`live-code-runner: ${errorMsg}`);
            return false;
        });
    }

    createKernel(kernelType) {
        this.continuation = false;
        this.waiting_input = false;
        let msg = "Preparing kernel...";
        this.view.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg, 500);
        return this.client.createKernel(kernelType)
        .then(response => {
            this.kernelId = response.kernelId;
            let msg = "Kernel prepared.";
            this.view.addConsoleMessage(msg);
            vscode.window.setStatusBarMessage(msg, 500);
            return true;
        }).catch((errorType, errorMsg) => {
            vscode.window.showErrorMessage(`live-code-runner: ${errorMsg}`);
            vscode.window.setStatusBarMessage(errorMsg, 500);
            return false;
        });
    }

    destroyKernel(kernelId) {
        this.continuation = false;
        this.waiting_input = false;
        let msg = "Destroying kernel...";
        this.view.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg, 500);
        return this.client.destroyKernel(kernelId)
        .then(response => {
            return true;
        }).catch((errorType, errorMsg) => {
            vscode.window.showErrorMessage(`live-code-runner: ${errorMsg}`);
            vscode.window.setStatusBarMessage(errorMsg, 500);
            return false;
        });
    }

    refreshKernel() {
        this.continuation = false;
        this.waiting_input = false;
        let msg = "Refreshing kernel...";
        this.view.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg);
        return this.client.refreshKernel(this.kernelId)
        .then(response => {
            let msg = "live-code-runner: kernel refreshed";
            vscode.window.showInformationMessage(msg);
            vscode.window.setStatusBarMessage(msg, 500);
            return true;
        }).catch((errorType, errorMsg) => {
            vscode.window.showErrorMessage(`live-code-runner: ${errorMsg}`);
            vscode.window.setStatusBarMessage(errorMsg, 500);
            return false;
        });
    }

    chooseKernelType() {
        let grammar;
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            grammar = editor.document.languageId ? editor.document.languageId : null;
        } else {
            grammar = null;
        }
        if (grammar) {
            let kernelName;
            let grammarName = (grammar || grammar.scopeName).toLowerCase();
            switch (grammarName) {
                case "python":
                let code = editor.document.getText();
                if (code.search("import tensorflow") > 0) {
                    kernelName = "python-tensorflow:latest-gpu";
                } else if (code.search("import keras") > 0) {
                    kernelName = "python-tensorflow:latest-gpu";
                } else if (code.search("import theano") > 0) {
                    kernelName = "python-theano:latest";
                } else if (code.search("import caffe") > 0) {
                    kernelName = "python-caffe:latest";
                } else {
                    kernelName = "python:latest";
                }
                break;
                case "r": kernelName = "r:latest"; break;
                case "julia": kernelName = "julia:latest"; break;
                case "lua": kernelName = "lua:latest"; break;
                case "php": kernelName = "php:latest"; break;
                case "haskell": kernelName = "haskell:latest"; break;
                case "matlab": case "octave": kernelName = "octave:latest"; break;
                case "nodejs": case "javascript": kernelName = "nodejs:latest"; break;
                default: kernelName = null;
            }
            console.log(`Kernel Language: ${kernelName}`);
            return kernelName;
        }
    }

    sendCode() {
        this.view.showConsole();
        let mode = "query";
        if (this.waiting_input === true) {
            mode = "input";
            this.waiting_input = false;
            this.view.addOutput([['stdout', this.code + '\n']]);
        } else if (this.continuation === true) {
            this.code = '';
            mode = "continue";
        } else {
            this.view.clearConsole();
            this.view.clearHtmlContent();
            this.view.addConsoleMessage('[LOG] Running...');
            let editor = vscode.window.activeTextEditor;
            this.code = editor.document.getText();
            this._exec_starts = new Date().getTime();
        }
        return this.client.runCode(this.code, this.kernelId, this.runId, mode)
        .then(response => {
            let hasOutput = false;
            let msg = '';
            // state machine
            switch (response.result.status) {
            case 'continued':
                this.continuation = true;
                this.waiting_input = false;
                msg = "live-code-runner: executing...";
                vscode.window.setStatusBarMessage(msg, 2000);
                setTimeout(() => this.sendCode(), 1);
                break;
            case 'waiting-input':
                this.continuation = true;
                this.waiting_input = true;
                break;
            case 'build-finished':
                this.continuation = true;
                this.waiting_input = false;
                break;
            case 'finished':
                this.continuation = false;
                this.waiting_input = false;
                let elapsed = (new Date().getTime() - this._exec_starts) / 1000;
                vscode.window.setStatusBarMessage(`live-code-runner: finished running (${elapsed} sec.)`);
                msg = `[LOG] Finished. (${elapsed} sec.)`;
                this.view.addConsoleMessage(msg);
                break;
            default:
                this.continuation = false;
                this.waiting_input = false;
            }
            // handle results
            if (response.result.console) {
                hasOutput = this.view.addOutput(response.result.console);
                if (hasOutput) {
                    this.view.showResultPanel();
                }
            }
            if (this.waiting_input === true) {
                return vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: "Input to kernel",
                }).then( response => {
                    if (response === undefined) {
                        this.code = '';
                    } else {
                        this.code = response;
                    }
                    return this.sendCode();
                });
            } else {
                return true;
            }
        }).catch((errorType, errorMsg) => {
            vscode.window.showErrorMessage(`live-code-runner: ${errorMsg}`);
            switch (errorType) {
            case ai.backend.Client.ERR_SERVER:
                this.continuation = false;
                break;
            case ai.backend.Client.ERR_RESPONSE:
                break;
            case ai.backend.Client.ERR_REQUEST:
                break;
            }
            return false;
        });
    }

    generateRunId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
}