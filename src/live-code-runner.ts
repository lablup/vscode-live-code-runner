'use strict';
/*
vscode-live-code-runner
(C) Copyright 2016-2017 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */

import * as vscode from 'vscode';
import * as BackendAI from './backend-ai-api-v3';
import { LiveCodeRunnerView } from './live-code-runner-view';

export class LiveCodeRunner {
    private resultPanel;
    private code: string;
    public accessKey: string;
    public secretKey: string;
    private runId: string;
    private signKey: string;
    private apiVersion: 'v2.20160915';
    private hash_type = 'sha256';
    private baseURL = 'https://api.backend.ai';
    private kernelId: string;
    private kernelType: string;
    private BackendAISDK;
    private LiveCodeRunnerView;
    private _exec_starts: number;
    private _config: vscode.WorkspaceConfiguration;
    public continuation: boolean;
    public waiting_input: boolean;

    //private _config;
    constructor() {
        this.resultPanel = null;
        this.code = null;
        this.accessKey = null;
        this.secretKey = null;
        this.runId = null;
        this.signKey = null;
        this.kernelId = null;
        this.kernelType = null;
        this.LiveCodeRunnerView = new LiveCodeRunnerView();
        this.BackendAISDK = new BackendAI.BackendAISDK();
        this.continuation = false;
        this.waiting_input = false;
    }

    getAccessKey() {
        let accessKey = this._config.get('accessKey');
        return accessKey;
    }

    getSecretKey() {
        let secretKey = this._config.get('secretKey');
        return secretKey;
    }

    checkMandatorySettings() {
        let missingSettings = [];
        if (this.getAccessKey() === undefined) {
        missingSettings.push("Access Key");
        }
        if (this.getSecretKey() === undefined) {
        missingSettings.push("Secret Key");
        }
        if (missingSettings.length) {
        this.notifyMissingMandatorySettings(missingSettings);
        }
        return missingSettings.length === 0;
    }

    notifyMissingMandatorySettings(missingSettings) {
        let notification;
        let context = this;
        let errorMsg = `live-code-runner: Please input following settings: ${missingSettings.join(', ')}`;

        notification = vscode.window.showInformationMessage(errorMsg);
        return true;
    }

    runcode() {
        this._config = vscode.workspace.getConfiguration('live-code-runner');
        this.BackendAISDK.accessKey = this.getAccessKey();
        this.BackendAISDK.secretKey = this.getSecretKey();
        this.LiveCodeRunnerView.clearConsole();
        let errorMsg, notification;
        let kernelType = this.chooseKernelType();
        if (kernelType === null) {
            errorMsg = "live-code-runner: language is not specified by Visual Studio Code.";
            notification = vscode.window.showErrorMessage(errorMsg);
            vscode.window.setStatusBarMessage(errorMsg, 1000);
            return false;
        }
        if ((kernelType !== this.kernelType) || (this.kernelId === null)) {
            if (this.kernelId !== null) {
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
                    console.log("[ERROR] Kernel spawning failed.");
                });
                return true;
            }
        } else {
            return this.sendCode();
        }
    }

    getAPIversion() {
        return this.BackendAISDK.getAPIversion();
    }

    createKernel(kernelType) {
        this.continuation = false;
        this.waiting_input = false;
        let parentObj = this;
        let msg = "Preparing kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg, 500);
        return this.BackendAISDK.createKernel(kernelType)
        .then( function(response) {
            let notification;
            if (response.ok === false) {
                let errorMsg = `live-code-runner: ${response.statusText}`;
                notification = vscode.window.showErrorMessage(errorMsg);
                return false;
            } else if (response.status === 201) {
                return response.json().then( function(json) {
                    console.log(`Kernel ID: ${json.kernelId}`);
                    parentObj.kernelId = json.kernelId;
                    msg = "Kernel prepared.";
                    parentObj.LiveCodeRunnerView.addConsoleMessage(msg);
                    vscode.window.setStatusBarMessage(msg, 500);
                    return true;
                });
            }
        }).catch( e => {
        });
    }

    destroyKernel(kernelId) {
        this.continuation = false;
        this.waiting_input = false;
        let msg = "Destroying kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg, 500);
        return this.BackendAISDK.destroyKernel(kernelId)
            .then( function(response) {
                if (response.ok === false) {
                    if (response.status !== 404) {
                        let errorMsg = `live-code-runner: kernel destroy failed - ${response.statusText}`;
                        let notification = vscode.window.showErrorMessage(errorMsg);
                        return false;
                    } else {
                        return true;
                    }
                }
                return true;
            }, e => false);
    }

    refreshKernel() {
        this.continuation = false;
        this.waiting_input = false;
        let msg = "Refreshing kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg);
        return this.BackendAISDK.refreshKernel(this.kernelId)
            .then( function(response) {
                let notification;
                if (response.ok === false) {
                    let errorMsg = `live-code-runner: ${response.statusText}`;
                    notification = vscode.window.showErrorMessage(errorMsg);
                    vscode.window.setStatusBarMessage(msg, 500);
                } else {
                    if (response.status !== 404) {
                        msg = "live-code-runner: kernel refreshed";
                        notification = vscode.window.showInformationMessage(msg);
                        vscode.window.setStatusBarMessage(msg, 500);
                    }
                }
                return true;
            }, e => false);
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
        this.LiveCodeRunnerView.showConsole();
        let mode = "query";
        if (this.waiting_input === true) {
            console.log("Sending input...");
            mode = "input";
            this.waiting_input = false;
            this.LiveCodeRunnerView.addHtmlContent(`<span class="live-console stdout">${this.escapeHtml(this.code + '\n')}</span>`);
        } else if (this.continuation === true) {
            this.code = '';
            mode = "continue";
        } else {
            this.LiveCodeRunnerView.clearConsole();
            this.LiveCodeRunnerView.clearHtmlContent();
            this.LiveCodeRunnerView.addConsoleMessage('[LOG] Running...');
            let editor = vscode.window.activeTextEditor;
            this.code = editor.document.getText();
            this._exec_starts = new Date().getTime();
        }
        return this.BackendAISDK.runCode(this.code, this.kernelId, this.runId, mode)
            .then( response => {
                if (response.ok === false) {
                    response.json().then(json => {
                        let errorMsg = `live-code-runner: ${response.statusText}: ${json['title']}`;
                        vscode.window.showErrorMessage(errorMsg);
                    })
                    this.continuation = false;
                    return true;
                }
                response.json().then( json => {
                    let buffer = '';
                    let htmlOutput = '';
                    if (json.result.status) {
                        if (json.result.status == "continued") {
                            this.continuation = true;
                            let msg = "live-code-runner: executing...";
                            vscode.window.setStatusBarMessage(msg, 2000);
                            setTimeout(() => this.sendCode(), 1);
                        } else if (json.result.status == "waiting-input") {
                            this.continuation = true;
                            this.waiting_input = true;
                        } else {
                            this.continuation = false;
                            this.waiting_input = false;
                        }
                    }
                    if (json.result.console) {
                        for (let c of Array.from(json.result.console)) {
                            if (c[0] == 'stdout') {
                                htmlOutput = htmlOutput  + `<span class="live-console stdout">${this.escapeHtml(c[1])}</span>`;
                            }
                            if (c[0] == 'stderr') {
                                htmlOutput = htmlOutput  + `<span class="live-console stderr">${this.escapeHtml(c[1])}</span>`;
                            }
                            if (c[0] == 'media') {
                                if (c[1][0] === "image/svg+xml") {
                                    htmlOutput = htmlOutput + c[1][1];
                                }
                            }
                        }
                    }
                    if (htmlOutput != '') {
                        this.LiveCodeRunnerView.addHtmlContent(htmlOutput);
                        this.LiveCodeRunnerView.showResultPanel();
                    }
                    if (buffer != '') {
                        this.LiveCodeRunnerView.addConsoleMessage(buffer);
                    }
                    if (json.result.status == "finished") {
                        let elapsed = (new Date().getTime() - this._exec_starts) / 1000;
                        vscode.window.setStatusBarMessage(`live-code-runner: finished running (${elapsed} sec.)`);
                        let msg = `[LOG] Finished. (${elapsed} sec.)`;
                        this.LiveCodeRunnerView.addConsoleMessage(msg);
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
                });
                return true;
            }
        );
    }
    escapeHtml(text) {
        return text.replace(/[\"&<>]/g, function (a) {
        return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
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

