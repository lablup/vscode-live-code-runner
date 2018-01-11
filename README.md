# live-code-runner

Run codes in Visual Studio Code via Backend.AI Cloud server (https://cloud.backend.ai) or your own Backend.AI server. You can run your code (or code snippet) without installing or setting any programming environment with this extension.

 `live-code-runner` is Visual Studio Code editor extension to add remote code execution feature using [Backend.AI Cloud Service](https://cloud.backend.ai). `live-code-runner` uses [Backend.AI framework](https://www.lablup.ai/#/ground) and [Backend.AI API](http://docs.backend.ai). Currently, Backend.AI supports 15 programming languages now.

## How-to

### API Key registration

 1. Get your own API key pair (API key / Secret key) at [Backend.AI Cloud Service](https://cloud.backend.ai) or your on-premise Backend.AI server.
 2. Type your API key pair on preferences page (Code - Preferences - Settings - 'live-code-runner')

### Run

 1. Write your code on editor.
 2. Run code by
  * Choose `Run code on Backend.AI Cloud` at context menu OR
  * Type `backend` and choose `Run code on Backend.AI Cloud` at command palette.
 3. Execution result will be shown at bottom pane. If there are interactive media outputs, right pane also will appear.

<iframe width="853" height="480" src="https://www.youtube.com/embed/IVX1SClEaMY" frameborder="0" allowfullscreen></iframe>

## Requirements

## Supporting modes

Here we list the latest versions of our supported kernel images.  
"\*" in the Query mode column means that it supports preservation of global contexts across different query runs.

| Language      | Image Name              | Version | Batch | Query | Input Hook | TTY | Runtime Impl. |
|---------------|-------------------------|---------|-------|-------|---|---|--------------------|
| C             | `lablup/kernel-c`       | 6.3     | O     | O     | O |   | GCC on Alpine 3.6  |
| C++ (14)      | `lablup/kernel-cpp`     | 6.3     | O     | O     |   |   | GCC on Alpine 3.6  |
| Go            | `lablup/kernel-go`      | 1.9     | O     | O     |   |   |                    | 
| Haskell       | `lablup/kernel-haskell` | 8.2     | O     | O     |   |   |                    |
| Java          | `lablup/kernel-java`    | 8.0     | O     | O     |   |   |                    |
| Linux Console | `lablup/kernel-git`     | -       | -     | -     | - | O | Bash on Alpine 3.6 |  
| Lua           | `lablup/kernel-lua`     | 5.3     | O     | O     |   |   |                    |
| Node.js       | `lablup/kernel-nodejs`  | 6.11    | O     | O     |   |   |                    |
| Octave        | `lablup/kernel-octave`  | 4.2     | O     | O     |   |   |                    |
| ~Python~      | `lablup/kernel-python`  | 2.7     | O     | O     | O |   | temporarily unsupported |
| Python        | `lablup/kernel-python`  | 3.6     | O     | O\*   | O |   |                    |
| Rust          | `lablup/kernel-rust`    | 1.17    | O     | O     |   |   |                    |
| PHP           | `lablup/kernel-php`     | 7.1     | O     | O     |   |   |                    |
| R             | `lablup/kernel-r`       | 3.3     | O     | O     |   |   | CRAN R             |

| Deep-Learning Framework | Image Name           | Version | Batch | Query | Input Hook | TTY | Runtime Impl. |
|------------|-----------------------------------|---------|-------|-------|-----|---|-------------------|
| TensorFlow | `lablup/kernel-python-tensorflow` | 1.4     | O     | O\*   | O   |   | Bundled w/Keras 2 |
| TensorFlow | `lablup/kernel-python-tensorflow` | 1.3     | O     | O\*   | O   |   | Bundled w/Keras 2 |
| PyTorch    | `lablup/kernel-python-torch`      | 0.2     | O     | O\*   | O   |   |                   |
| Theano     | `lablup/kernel-python-theano`     | 1.0     | O     | O\*   | O   |   | Bundled w/Keras 2 |
| CNTK       | `lablup/kernel-python-cntk`       | (WIP)   | O     | O\*   | O   |   | Bundled w/Keras 2 |

### Languages and modes (to be ready soon)

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
