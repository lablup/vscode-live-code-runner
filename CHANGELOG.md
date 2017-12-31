# Change Log
All notable changes to the "live-code-runner" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [3.0.0] - 2017-12-27
 - Rewritten with official backend.AI node.js library (backend.ai-client)
 - Unified view code for easier extension
 - Support custom endpoint

## [2.1.0] - 2017-12-21
 - Prepare to use backend.AI client library

## [2.0.0] - 2017-12-20
 - Support newer backend.AI API

## [1.3.0] - 2017-11-16
 - Update backend.ai client SDK

## [1.2.0] - 2017-10-13
 - Change runtime backend to Backend.AI

## [1.1.0] - 2017-3-19
 - Inline I/O support

## [1.0.0] - 2017-02-28
### Changed
 - Support Sorna Cloud API V2
 - Complete support of real-time interactive input commands (e.g. `a = input("hello world")`)
 - Generalized output pane. Now standard output / error and multimedia outputs are printed in one RESULT pane sequentially.

## [0.3.0] - 2017-02-13
### Changed
 - Supports real-time interactive input commands (e.g. `a = input("hello world")`)
  - Now supports for tensorflow kernel, and will be supported by other kernels soon.
 - Colorized console output to divide logs and results
 - Fully supports graphical output type. (e.g. plots, pictures)

## [0.2.0] - 2017-02-10
### Changed
 - Now non-ASCII source code is running without authentication problems.

## [0.1.3] - 2017-02-08
### Changed
 - Update package information
 - Add logo to the package description
 - Support running from context menu

## [0.1.1] - 2017-02-08
### Changed
 - Update documentations

## [0.1.0] - 2017-02-08
### Added
 - Initial release
 - Port Atom plugin to VSCode extension

[0.3.0]: https://github.com/lablup/vscode-live-code-runner/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/lablup/vscode-live-code-runner/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/lablup/vscode-live-code-runner/compare/v0.1.1...v0.1.3
[0.1.1]: https://github.com/lablup/vscode-live-code-runner/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/lablup/vscode-live-code-runner/releases/tag/v0.1.0
