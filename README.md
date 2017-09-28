# live-code-runner

Run codes in Visual Studio Code via Lablup.AI Cloud API server (https://cloud.backend.ai). You can run your code (or code snippet) without installing or setting any programming environment with this extension.

 `live-code-runner` is Visual Studio Code editor extension to add remote code execution feature using [Lablup.AI API Service](https://cloud.backend.ai). `live-code-runner` uses [Lablup.AI framework](http://backend.ai) and [Lablup.AI API](http://docs.backend.ai). Currently, Lablup.AI supports 11 programming languages now.

## How-to

### API Key registration

 1. Get your own API key pair (API key / Secret key) at [Lablup.AI Cloud Service](https://cloud.backend.ai)
 2. Type your API key pair on preferences page (Code - Preferences - Settings - 'live-code-runner')

### Run

 1. Write your code on editor.
 2. Run code by
  * Choose `Run code on Lablup.AI` at context menu OR
  * Type sorna and choose `Run code on Lablup.AI` at command palette.
 3. Execution result will be shown at bottom pane. If there are interactive media outputs, right pane also will appear.

<iframe width="853" height="480" src="https://www.youtube.com/embed/IVX1SClEaMY" frameborder="0" allowfullscreen></iframe>

## Requirements

### Supported Languages / frameworks on Lablup.AI Cloud

 * Python 2.7
 * Python 3.6
 * TensorFlow 1.3
 * Theano 0.8
 * Keras 2.0
 * PHP 7.0
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

## Extension Settings

This extension contributes the following settings:

* `live-code-runner.accessKey`: set your access key created at https://cloud.backend.ai .
* `live-code-runner.secretKey`: set your secret key created at https://cloud.backend.ai .

## Known Issues

 * Text input support will be coming soon.

## Troubleshooting

 1. My language is not recognized
  * Make sure that language name of your code is correctly recognized by Visual Studio Code. You can see the grammar of current editor at the right side of bottom bar. If your language is not supported by Visual Studio Code, please install language support extensions.

## Release Notes

Refer [CHANGELOG](CHANGELOG.md) for details.

## Contribution

We endorse you to fork this [repository](https://github.com/lablup/vscode-live-code-runner). Pull requests are welcomed.
