# GStack VS Code Tasks

Tiny extension that exposes the common `gstack:` tasks in the Command Palette.

Usage

- Open the `vscode-extension` folder in VS Code and press F5 to run an Extension Development Host.
- From the host, open the Command Palette (Ctrl+Shift+P) and run commands like `GStack: Build` or `GStack: Test`.

Notes

- The extension invokes the workspace task labels declared in `.vscode/tasks.json`. Make sure you have the `gstack:` tasks present in your workspace `.vscode/tasks.json` (this repo already contains one).
- If you prefer, you can wire these commands to keybindings or add them to the global command palette via a packaged VSIX.
