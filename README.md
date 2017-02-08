# live-code-runner

Run codes in Visual Studio Code via Sorna Cloud API server (https://cloud.sorna.io). You can run your code (or code snippet) without installing or setting any programming environment with this extension.

 `live-code-runner` is Visual Studio Code editor extension to add remote code execution feature using [Sorna Cloud API Service](https://cloud.sorna.io). `live-code-runner` uses [Sorna framework](http://sorna.io) and [Sorna API](http://docs.sorna.io). Currently, Sorna supports 11 programming languages now.

## Set-up

 * Install `live-code-runner` extension.
 * Get Sorna API access / secret key at [Sorna Cloud API](https://cloud.sorna.io)
 * Type your keys on extension preferences page.
 * You are ready to go!

<iframe width="853" height="480" src="https://www.youtube.com/embed/IVX1SClEaMY" frameborder="0" allowfullscreen></iframe>

## Requirements

### Supported Languages / frameworks on Sorna Cloud

 * Python 2.7
 * Python 3.6
 * TensorFlow 0.12
 * Theano 0.8
 * Keras 1.2
 * PHP 7
 * Javascript (via V8 engine)
 * Node.js 4
 * R 3
 * Octave 4.2
 * Julia
 * haskell
 * Lua 5

### Languages (to be ready soon)

 * Rust
 * Swift (via Swift opensource version)
 * Caffe
 * C++ (via gcc)

## How-to

### API Key registration

 1. Get your own API key pair (API key / Secret key) at [Sorna Cloud API Service](https://cloud.sorna.io)
 2. Type your API key pair on preferences page (Code - Preferences - settings - 'live-code-runner')

### Run

 1. Write your code on editor.
 2. Run code by
  * Choose `Run code on Sorna` at context menu
  * Type `sorna` and choose `live-code-runner: Run` at command palette.
 3. Execution result will be shown at bottom pane. If there are interactive media outputs, right pane also will appear.

## Extension Settings

This extension contributes the following settings:

* `live-code-runner.accessKey`: set your access key created at https://cloud.sorna.io .
* `live-code-runner.secretKey`: set your secret key created at https://cloud.sorna.io .

## Known Issues

 * Text input support will be coming soon.

## Troubleshooting

 1. My language is not recognized
  * Make sure that language name of your code is correctly recognized by Visual Studio Code. You can see the grammar of current editor at the right side of bottom bar. If your language is not supported by Visual Studio Code, please install language support extensions.

## Release Notes

Refer [CHANGELOG](CHANGELOG.md) for details.