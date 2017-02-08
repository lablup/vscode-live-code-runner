'use strict';
/*
vscode-live-code-runner
(C) Copyright 2016-2017 Lablup Inc.
Licensed under MIT
*/
/*jshint esnext: true */

import * as vscode from 'vscode';
import * as Sorna from './sorna-api-lib-v1';
import { LiveCodeRunnerView } from './live-code-runner-view';

export class LiveCodeRunner {
    private resultPanel;
    private code: string;
    public accessKey: string;
    public secretKey: string;
    private signKey: string;
    private apiVersion: 'v1.20160915';
    private hash_type = 'sha256';
    private baseURL = 'https://api.sorna.io';
    private kernelId: string;
    private kernelType: string;
    private SornaAPILib;
    private LiveCodeRunnerView;
    private _exec_starts: number;
    private _config: vscode.WorkspaceConfiguration;
    //private _config;
    constructor() {
        this.resultPanel = null;
        this.code = null;
        this.accessKey = null;
        this.secretKey = null;
        this.signKey = null;
        this.kernelId = null;
        this.kernelType = null;
        this.LiveCodeRunnerView = new LiveCodeRunnerView();
        this.SornaAPILib = new Sorna.SornaAPILib();
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
        this.SornaAPILib.accessKey = this.getAccessKey();
        this.SornaAPILib.secretKey = this.getSecretKey();
        this.LiveCodeRunnerView.clearConsole();
        return this.sendCode();
    }

    getAPIversion() {
        return this.SornaAPILib.getAPIversion();
    }

    createKernel(kernelType) {
        let parentObj = this;
        let msg = "Preparing kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg, 500);
        return this.SornaAPILib.createKernel(kernelType)
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
        });;
    }

    destroyKernel(kernelId) {
        let msg = "Destroying kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg);
        return this.SornaAPILib.destroyKernel(kernelId)
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
        let msg = "Refreshing kernel...";
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        vscode.window.setStatusBarMessage(msg);
        return this.SornaAPILib.refreshKernel(this.kernelId)
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
                if (code.search("tensorflow") > 0) {
                    kernelName = "tensorflow-python3-gpu";
                } else if (code.search("keras") > 0) {
                    kernelName = "tensorflow-python3-gpu";
                } else if (code.search("theano") > 0) {
                    kernelName = "python3-theano";
                } else if (code.search("caffe") > 0) {
                    kernelName = "python3-caffe";
                } else {
                    kernelName = "python3";
                }
                break;
                case "r": kernelName = "r3"; break;
                case "julia": kernelName = "julia"; break;
                case "lua": kernelName = "lua5"; break;
                case "php": kernelName = "php7"; break;
                case "haskell": kernelName = "haskell"; break;
                case "matlab": case "octave": kernelName = "octave4"; break;
                case "nodejs": case "javascript": kernelName = "nodejs4"; break;
                default: kernelName = null;
            }
            console.log(`Kernel Language: ${kernelName}`);
            return kernelName;
        }
    }

    sendCode() {
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
                        return this.sendCode();
                    }
                });
                return true;
            } else {
                let createAndRun = this.createKernel(kernelType).then( (result) => {
                    if (result === true) {
                        this.kernelType = kernelType;
                        return this.sendCode();
                    } else {
                        console.log("[ERROR] Kernel spawned but error found.");
                    }
                }).catch( e => {
                    console.log("[ERROR] Kernel spawning failed.");
                });
                return true;
            }
        }
        this.LiveCodeRunnerView.showConsole();
        let msg = "Running...";
        this.LiveCodeRunnerView.clearConsole();
        this.LiveCodeRunnerView.clearHtmlContent();
        this.LiveCodeRunnerView.addConsoleMessage(msg);
        let editor = vscode.window.activeTextEditor;
        this.code = editor.document.getText();
        this._exec_starts = new Date().getTime();
        return this.SornaAPILib.runCode(this.code, this.kernelId)
        .then( response => {
            if (response.ok === false) {
                errorMsg = `live-code-runner: ${response.statusText}`;
                notification = vscode.window.showErrorMessage(errorMsg);
                if (response.status === 404) {
                    this.createKernel(this.kernelType);
                }
            } else {
                msg = "live-code-runner: completed.";
                //notification = vscode.window.showInformationMessage(msg);
                vscode.window.setStatusBarMessage(msg, 800);
                setTimeout(() => { notification = undefined; }, 1000);
                response.json().then( json => {
                    let buffer = '';
                    let htmlOutput = '';
                    if (json.result.media) {
                        for (let m of Array.from(json.result.media)) {
                            if (m[0] === "image/svg+xml") {
                            htmlOutput = htmlOutput + m[1];
                            }
                        }
                    }
                    if (json.result.stdout) {
                        buffer = json.result.stdout;
                        htmlOutput = htmlOutput + '<br /><pre>'+json.result.stdout+'</pre>';
                    }
                    if (json.result.exceptions && (json.result.exceptions.length > 0)) {
                        let errBuffer = '';
                        for (let exception of Array.from(json.result.exceptions)) {
                            errBuffer = errBuffer + exception[0] + '(' + exception[1].join(', ') + ')';
                        }
                        this.LiveCodeRunnerView.setErrorMessage(errBuffer);
                    } 
                    if (htmlOutput != '') {
                        this.LiveCodeRunnerView.addHtmlContent(htmlOutput);                        
                        this.LiveCodeRunnerView.showResultPanel();
                    }
                    let elapsed = (new Date().getTime() - this._exec_starts) / 1000;
                    vscode.window.setStatusBarMessage('live-code-runner: finished running (' + elapsed + ' sec.)');
                    return this.LiveCodeRunnerView.addConsoleMessage(buffer);
                }
            );
            }
            return true;
        }
        );
    }
}

