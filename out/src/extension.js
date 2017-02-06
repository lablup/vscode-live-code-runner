'use strict';
const vscode = require("vscode");
const Sorna = require("./sorna-api-lib-v1");
const live_code_runner_view_1 = require("./live-code-runner-view");
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
    class LiveCodeRunner {
        //private _config;
        constructor() {
            this.hash_type = 'sha256';
            this.baseURL = 'https://api.sorna.io';
            this.resultPanel = null;
            this.code = null;
            this.accessKey = null;
            this.secretKey = null;
            this.signKey = null;
            this.kernelId = null;
            this.kernelType = null;
            this.LiveCodeRunnerView = new live_code_runner_view_1.LiveCodeRunnerView();
            this.SornaAPILib = new Sorna.SornaAPILib();
            this._config = vscode.workspace.getConfiguration('live-code-runner');
            this.SornaAPILib.accessKey = this.getAccessKey();
            this.SornaAPILib.secretKey = this.getSecretKey();
            console.log(this._config);
        }
        getAccessKey() {
            console.log(this._config);
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
            this.LiveCodeRunnerView.clearConsoleMessage();
            return this.sendCode();
        }
        getAPIversion() {
            return this.SornaAPILib.getAPIversion();
        }
        createKernel(kernelType) {
            let parentObj = this;
            let msg = "Preparing kernel...";
            this.LiveCodeRunnerView.addConsoleMessage(msg);
            return this.SornaAPILib.createKernel(kernelType)
                .then(function (response) {
                let notification;
                if (response.ok === false) {
                    let errorMsg = `live-code-runner: ${response.statusText}`;
                    notification = vscode.window.showErrorMessage(errorMsg);
                    return false;
                }
                else if (response.status === 201) {
                    return response.json().then(function (json) {
                        console.log(`Kernel ID: ${json.kernelId}`);
                        parentObj.kernelId = json.kernelId;
                        msg = "Kernel prepared.";
                        parentObj.LiveCodeRunnerView.addConsoleMessage(msg);
                        //notification = atom.notifications.addSuccess(msg);
                        //setTimeout(() => notification.dismiss(), 1000);
                        parentObj.LiveCodeRunnerView.setKernelIndicator(kernelType);
                        return true;
                    });
                }
            }).catch(e => {
            });
            ;
        }
        destroyKernel(kernelId) {
            let msg = "Destroying kernel...";
            this.LiveCodeRunnerView.addConsoleMessage(msg);
            return this.SornaAPILib.destroyKernel(kernelId)
                .then(function (response) {
                if (response.ok === false) {
                    if (response.status !== 404) {
                        let errorMsg = `live-code-runner: kernel destroy failed - ${response.statusText}`;
                        let notification = vscode.window.showErrorMessage(errorMsg);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                return true;
            }, e => false);
        }
        refreshKernel() {
            let msg = "Refreshing kernel...";
            this.LiveCodeRunnerView.addConsoleMessage(msg);
            return this.SornaAPILib.refreshKernel(this.kernelId)
                .then(function (response) {
                let notification;
                if (response.ok === false) {
                    let errorMsg = `live-code-runner: ${response.statusText}`;
                    notification = vscode.window.showErrorMessage(errorMsg);
                }
                else {
                    if (response.status !== 404) {
                        msg = "live-code-runner: kernel refreshed";
                        notification = vscode.window.showInformationMessage(msg);
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
            }
            else {
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
                        }
                        else {
                            kernelName = "python3";
                        }
                        break;
                    case "r":
                        kernelName = "r3";
                        break;
                    case "julia":
                        kernelName = "julia";
                        break;
                    case "lua":
                        kernelName = "lua5";
                        break;
                    case "php":
                        kernelName = "php7";
                        break;
                    case "haskell":
                        kernelName = "haskell";
                        break;
                    case "nodejs":
                    case "javascript":
                        kernelName = "nodejs4";
                        break;
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
                notification = vscode.window.showErrorMessage(errorMsg + 'Check the grammar indicator at bottom bar and make sure that it is correctly recoginzed (NOT `Plain Text`).\nTry one of the followings:\n * Save current editor with proper file extension.\n * Install extra lauguage support package. (e.g. `language-r`, `language-haskell`)');
                return false;
            }
            if ((kernelType !== this.kernelType) || (this.kernelId === null)) {
                if (this.kernelId !== null) {
                    let destroyAndCreateAndRun = this.destroyKernel(this.kernelId)
                        .then(result => {
                        if (result === true) {
                            return this.createKernel(kernelType);
                        }
                        else {
                            return false;
                        }
                    })
                        .then(result => {
                        if (result === true) {
                            this.kernelType = kernelType;
                            return this.sendCode();
                        }
                    });
                    return true;
                }
                else {
                    let createAndRun = this.createKernel(kernelType).then((result) => {
                        console.log(result);
                        if (result === true) {
                            this.kernelType = kernelType;
                            return this.sendCode();
                        }
                    }).catch(e => {
                        console.log("Error during kernel spawning.");
                    });
                    return true;
                }
            }
            this.LiveCodeRunnerView.show();
            let msg = "Running...";
            this.LiveCodeRunnerView.clearContent();
            this.LiveCodeRunnerView.addConsoleMessage(msg);
            let editor = vscode.window.activeTextEditor;
            this.code = editor.document.getText();
            return this.SornaAPILib.runCode(this.code, this.kernelId)
                .then(response => {
                if (response.ok === false) {
                    errorMsg = `live-code-runner: ${response.statusText}`;
                    notification = vscode.window.showErrorMessage(errorMsg);
                    if (response.status === 404) {
                        this.createKernel(this.kernelType);
                    }
                }
                else {
                    msg = "live-code-runner: completed.";
                    notification = vscode.window.showInformationMessage(msg);
                    response.json().then(json => {
                        let buffer = '';
                        if (json.result.media) {
                            for (let m of Array.from(json.result.media)) {
                                if (m[0] === "image/svg+xml") {
                                    buffer = buffer + m[1];
                                }
                            }
                        }
                        if (json.result.stdout) {
                            //buffer = buffer + '<br /><pre>'+json.result.stdout+'</pre>';
                            buffer = json.result.stdout;
                        }
                        if (json.result.exceptions && (json.result.exceptions.length > 0)) {
                            let errBuffer = '';
                            for (let exception of Array.from(json.result.exceptions)) {
                                errBuffer = errBuffer + exception[0] + '(' + exception[1].join(', ') + ')';
                            }
                            this.LiveCodeRunnerView.setErrorMessage(errBuffer);
                        }
                        this.LiveCodeRunnerView.clearErrorMessage();
                        return this.LiveCodeRunnerView.setContent(buffer);
                    });
                }
                return true;
            });
        }
    }
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
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map