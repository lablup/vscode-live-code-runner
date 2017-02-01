# live-code-runner README

Visual Studio Code extension to run code snippets via Sorna Cloud API server (https://cloud.sorna.io)

## Features


 `live-code-runner` is Visual Studio Code editor extension to add remote code execution feature using [Sorna Cloud API Service](https://cloud.sorna.io). `live-code-runner` uses [Sorna framework](http://sorna.io) and [Sorna API](http://docs.sorna.io). Currently, Sorna supports 11 programming languages now.

You can run your code (or code snippet) without installing or setting any programming environment  with this extension. All you need to run code is

 * Install `live-code-runner` extension.
 * Get Sorna API access / secret key at [Sorna Cloud API](https://cloud.sorna.io)
 * Type your keys on extension preferences page.
 * You are ready to go!

<iframe width="853" height="480" src="https://www.youtube.com/embed/IVX1SClEaMY" frameborder="0" allowfullscreen></iframe>

\!\[feature X\]\(images/feature-x.png\)

## Requirements

### Supported Language on Sorna Cloud

 * Python 2.7
 * Python 3.5
 * TensorFlow 0.11
 * PHP 7
 * Javascript (via V8 engine)
 * Node.js 4
 * R 3
 * Julia
 * haskell
 * Lua 5

### Languages (to be ready soon)

 * Octave
 * Rust
 * Swift (via Swift opensource version)
 * Theano
 * Caffe
 * Keras
 * C++ (via gcc)

## How-to

 1. Search and install `live-code-runner` via preferences - install.
 2. Get your own API key pair (API key / Secret key) at [Sorna Cloud API Service](https://cloud.sorna.io)
 3. Type your API key pair on preferences page (preferences - extensions - live-code-runner)
 4. Write your code on editor.
 5. Run code by
  * Choose `Run code on Sorna` at context menu
  * Type `sorna` and choose `live-code-runner: Run` at command palette.
 6. Execution result will be shown at bottom pane.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Troubleshooting

 1. My language is not recognized
  * Make sure that language name of your code is correctly recognized by Visual Studio Code. You can see the grammar of current editor at the right side of bottom bar. If your language is not supported by Visual Studio Code, please install language support extensions. For instance, install `language-r` extension to add R language support.

## Release Notes
