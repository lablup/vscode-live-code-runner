'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
//import SornaAPILib from './sorna-api-lib-v1';
//var fetch, Headers = require('whatwg-fetch');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.runCode', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
/*
class SornaCodeRunnerView {
  constructor() {
    this.closeView = this.closeView.bind(this);
    this.refreshKernel = this.refreshKernel.bind(this);
    this.caller = vscode.window.createOutputChannel("Live Code Runner");

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('live-code-runner');

    // Create message element
    let consoleMessage = document.createElement('div');
    consoleMessage.classList.add('live-code-runner-console-message');
    this.element.appendChild(consoleMessage);

    let errorMessage = document.createElement('div');
    errorMessage.classList.add('live-code-runner-error-message');
    this.element.appendChild(errorMessage);

    let message = document.createElement('div');
    message.classList.add('live-code-runner-result');
    this.element.appendChild(message);


    let buttonArea = document.createElement('div');
    buttonArea.classList.add('live-code-runner-buttons');
    let closeButton = document.createElement('span');
    closeButton.addEventListener('click', this.closeView.bind(this));
    closeButton.classList.add('icon');
    closeButton.classList.add('icon-x');
    let refreshButton = document.createElement('span');
    refreshButton.addEventListener('click', this.refreshKernel.bind(this));
    refreshButton.classList.add('icon');
    refreshButton.classList.add('icon-repo-sync');
    this.kernelIndicator = document.createElement('span');
    this.kernelIndicator.classList.add('live-code-runner-kernel-indicator');
    buttonArea.appendChild(this.kernelIndicator);
    buttonArea.appendChild(refreshButton);
    buttonArea.appendChild(closeButton);

    this.element.appendChild(buttonArea);
    this.outputPanel.append(this.element);
  }

  closeView() {
    this.clearView();
    return this.caller.resultPanel.hide();
  }

  refreshKernel() {
    this.clearView();
    return this.caller.refreshKernel();
  }

  setKernelIndicator(kernelName) {
    this.kernelIndicator.textContent = kernelName;
  }

  // Clear all views
  clearView() {
     this.element.children[2].innerHTML = '';
     this.element.children[1].textContent = '';
     return this.element.children[0].innerHTML = '';
  }

  // Set content
  setContent(content) {
     return this.element.children[2].innerHTML = content;
  }

  // Clear content
  clearContent() {
     return this.element.children[2].innerHTML = '';
  }

  // Set error message
  setErrorMessage(content) {
     return this.element.children[1].textContent = content;
   }

  // Adds console message
  addConsoleMessage(content) {
     return this.element.children[0].innerHTML = this.element.children[0].innerHTML + '<br />' +  content;
  }

  // Clears console message
  clearConsoleMessage() {
     return this.element.children[0].innerHTML = '';
  }

  // Clears error message
  clearErrorMessage() {
    return this.element.children[1].textContent = '';
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    return this.element.remove();
  }

  getElement() {
    return this.element;
  }
}*/
/*
class LiveCodeRunner {
  constructor() {
    this.LiveCodeRunnerView = null;
    this.resultPanel = null;
    this.subscriptions = null;
    this.code = null;
    this.accessKey = null;
    this.secretKey = null;
    this.signKey = null;
    this.apiVersion = 'v1.20160915';
    this.hash_type = 'sha256';
    this.baseURL = 'https://api.sorna.io';
    this.kernelId = null;
    this.kernelType = null;
    this.SornaAPILib = null;
  }


  activate(state) {
    this.LiveCodeRunnerView = new LiveCodeRunnerView(state.LiveCodeRunnerViewState, this);
    this.resultPanel = atom.workspace.addBottomPanel({item: this.LiveCodeRunnerView.getElement(), visible: false});
    this.SornaAPILib = new SornaAPILib();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.checkMandatorySettings();

    // Register command
    return this.subscriptions.add(atom.commands.add('atom-text-editor',
      {'live-code-runner:run': () => this.runcode()})
    );
  }

  deactivate() {
    this.resultPanel.destroy();
    return this.subscriptions.dispose();
  }

  getAccessKey() {
    let accessKey = 'test';
    if (accessKey) {
      accessKey = accessKey.trim();
    }
    return accessKey;
  }

  getSecretKey() {
    let secretKey = 'test';
    if (secretKey) {
      secretKey = secretKey.trim();
    }
    return secretKey;
  }

  checkMandatorySettings() {
    let missingSettings = [];
    if (!this.getAccessKey()) {
      missingSettings.push("Access Key");
    }
    if (!this.getSecretKey()) {
      missingSettings.push("Secret Key");
    }
    if (missingSettings.length) {
      this.notifyMissingMandatorySettings(missingSettings);
    }
    this.SornaAPILib.accessKey = this.getAccessKey();
    this.SornaAPILib.secretKey = this.getSecretKey();
    return missingSettings.length === 0;
  }

  notifyMissingMandatorySettings(missingSettings) {
    let notification;
    let context = this;
    let errorMsg = `live-code-runner: Please input following settings: ${missingSettings.join(', ')}`;

    notification = vscode.window.showInformationMessage(errorMsg);
    return true;
  }

  goToPackageSettings() {
    return atom.workspace.open("atom://config/packages/live-code-runner");
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
      .then( function(response) {
        let notification;
        if (response.ok === false) {
          let errorMsg = `live-code-runner: ${response.statusText}`;
          notification = vscode.window.showErrorMessage(errorMsg);
          return false;
        } else if (response.status === 201) {
          return response.json().then( function(json) {
            console.debug(`Kernel ID: ${json.kernelId}`);
            parentObj.kernelId = json.kernelId;
            msg = "Kernel prepared.";
            parentObj.LiveCodeRunnerView.addConsoleMessage(msg);
            //notification = atom.notifications.addSuccess(msg);
            //setTimeout(() => notification.dismiss(), 1000);
            parentObj.LiveCodeRunnerView.setKernelIndicator(kernelType);
            return true;
          });
        }
      }, function(e) {}
      );
  }

  destroyKernel(kernelId) {
    let msg = "Destroying kernel...";
    this.LiveCodeRunnerView.addConsoleMessage(msg);
    return this.SornaAPILib.destroyKernel(kernelId)
      .then( function(response) {
        if (response.ok === false) {
          if (response.status !== 404) {
            let errorMsg = `live-code-runner: kernel destroy failed - ${response.statusText}`;
            let notification = atom.notifications.addError(errorMsg,
              {dismissable: true});
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
    return this.SornaAPILib.refreshKernel(this.kernelId)
      .then( function(response) {
        let notification;
        if (response.ok === false) {
          let errorMsg = `live-code-runner: ${response.statusText}`;
          notification = vscode.window.showErrorMessage(errorMsg);
        } else {
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
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      grammar = editor.getGrammar();
    } else {
      grammar = null;
    }
    if (grammar) {
      let kernelName;
      let grammarName = (grammar.name || grammar.scopeName).toLowerCase();
      switch (grammarName) {
        case "python":
          let code = editor.getText();
          if (code.search("tensorflow") > 0) {
            kernelName = "tensorflow-python3-gpu";
          } else {
            kernelName = "python3";
          }
          break;
        case "r": kernelName = "r3"; break;
        case "julia": kernelName = "julia"; break;
        case "lua": kernelName = "lua5"; break;
        case "php": kernelName = "php7"; break;
        case "haskell": kernelName = "haskell"; break;
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
      errorMsg = "live-code-runner: language is not specified by Atom.";
      notification = vscode.window.showErrorMessage(errorMsg + 'Check the grammar indicator at bottom bar and make sure that it is correctly recoginzed (NOT `Plain Text`).\nTry one of the followings:\n * Save current editor with proper file extension.\n * Install extra lauguage support package. (e.g. `language-r`, `language-haskell`)');
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
        }
        )
        .then( result => {
          if (result === true) {
            this.kernelType = kernelType;
            return this.sendCode();
          }
        }
        );
        return true;
      } else {
        let createAndRun = this.createKernel(kernelType).then( result => {
          if (result === true) {
            this.kernelType = kernelType;
            return this.sendCode();
          }
        }
        );
        return true;
      }
    }
    this.resultPanel.show();
    let msg = "Running...";
    this.LiveCodeRunnerView.clearContent();
    this.LiveCodeRunnerView.addConsoleMessage(msg);
    let editor = atom.workspace.getActiveTextEditor();
    this.code = editor.getText();
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
          notification = vscode.window.showInformationMessage(msg);
          response.json().then( json => {
            let buffer = '';
            if (json.result.media) {
              for (let m of Array.from(json.result.media)) {
                if (m[0] === "image/svg+xml") {
                  buffer = buffer + m[1];
                }
              }
            }
            if (json.result.stdout) {
              buffer = buffer + '<br /><pre>'+json.result.stdout+'</pre>';
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
          }
          );
        }
        setTimeout(() => notification.dismiss(), 1000);
        return true;
      }
      );
  }
};*/
//# sourceMappingURL=extension.js.map