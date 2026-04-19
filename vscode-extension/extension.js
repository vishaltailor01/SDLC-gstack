const vscode = require('vscode');

function runTaskLabel(label) {
  return vscode.commands.executeCommand('workbench.action.tasks.runTask', label)
    .catch(err => {
      vscode.window.showErrorMessage(`Failed to run task "${label}": ${err && err.message ? err.message : err}`);
    });
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('gstack.runTask.installDeps', () => runTaskLabel('gstack: Install deps')));
  context.subscriptions.push(vscode.commands.registerCommand('gstack.runTask.build', () => runTaskLabel('gstack: Build')));
  context.subscriptions.push(vscode.commands.registerCommand('gstack.runTask.test', () => runTaskLabel('gstack: Test')));
  context.subscriptions.push(vscode.commands.registerCommand('gstack.runTask.runBrowse', () => runTaskLabel('gstack: Run browse server')));
  context.subscriptions.push(vscode.commands.registerCommand('gstack.runTask.benchmarkDryRun', () => runTaskLabel('gstack: Model benchmark (dry-run)')));

  // Small activation note — non-blocking
  vscode.window.showInformationMessage('GStack Tasks: commands available via Command Palette (Ctrl+Shift+P).');
}

function deactivate() {}

module.exports = { activate, deactivate };
