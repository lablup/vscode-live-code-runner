# live-code-runner

Run codes in Visual Studio Code via Backend.AI Cloud server (https://cloud.backend.ai). You can run your code (or code snippet) without installing or setting any programming environment with this extension.

 `live-code-runner` is Visual Studio Code editor extension to add remote code execution feature using [Backend.AI Cloud Service](https://cloud.backend.ai). `live-code-runner` uses [Backend.AI framework](https://www.lablup.ai/#/ground) and [Backend.AI API](http://docs.backend.ai). Currently, Backend.AI supports 15 programming languages now.

## How-to

### API Key registration

 1. Get your own API key pair (API key / Secret key) at [Backend.AI Cloud Service](https://cloud.backend.ai)
 2. Type your API key pair on preferences page (Code - Preferences - Settings - 'live-code-runner')

### Run

 1. Write your code on editor.
 2. Run code by
  * Choose `Run code on Backend.AI Cloud` at context menu OR
  * Type `backend` and choose `Run code on Backend.AI Cloud` at command palette.
 3. Execution result will be shown at bottom pane. If there are interactive media outputs, right pane also will appear.

<iframe width="853" height="480" src="https://www.youtube.com/embed/IVX1SClEaMY" frameborder="0" allowfullscreen></iframe>

## Requirements

### Supported Languages / frameworks on Lablup.AI Cloud

| Language      | Version | Batch | Query | Input Hook | TTY | ETC |
|---------------|------|---|---|---|---|-------------------|
| C             | 6.3  | O | O | O |   | GCC compiler      |
| C++ (C+14)    | 6.3  | O | O | O |   | GCC compiler      |
| Go            | 1.9  | O | O |   |   |                   | 
| Haskell       | 8.2  | O | O |   |   |                   |
| Java          | 8.0  | O | O |   |   |                   |
| Linux Console | -    |   | O | O | O | Not supported in this plugin (Soon!) |  
| Node.js       | 6    |   | O |   |   |                   |
| Octave        | 4.2  |   | O |   |   |                   |
| Python        | 2.7  | O | O | O |   |                   |
| Python        | 3.6  | O | O | O |   |                   | 
| Rust          | 1.21 | O | O |   |   |                   | 
| PHP           | 7.0  |   | O |   |   |                   |
| R             | 3.0  |   | O |   |   | CRAN R            |

| Deep-Learning Framework | Version | Batch | Query | Input Hook | TTY | ETC |
|---------------|------|---|---|---|---|-------------------|
| TensorFlow    | 1.4  | O | O | O |   | Bundled w/Keras 2 |
| PyTorch       | 0.2  | O | O | O |   |                   |
| Theano        | 0.9  | O | O | O |   | Bundled w/Keras 2 |
| CNTK          |(WIP) | O | O | O |   | Bundled w/Keras 2 |

### Languages (to be ready soon)

 * Swift (via Swift opensource version)

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
