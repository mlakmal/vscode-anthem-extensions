import * as vscode from "vscode";
import Runner from "./Runner";

let runner: Runner, subscriptions: vscode.Disposable[];

export function activate(context: vscode.ExtensionContext) {
  runner = new Runner();
  subscriptions = [
    vscode.workspace.onDidChangeConfiguration(runner.handleConfigChanged()),
    vscode.window.onDidCloseTerminal(runner.handleTerminalClosed()),
    vscode.commands.registerCommand(
      "extension.unitTest.singleFileDebugFast",
      runner.handleUnitTestCommand("unitTest.singleFileDebugFast")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.singleFileDebugFastCoverage",
      runner.handleUnitTestCommand("unitTest.singleFileDebugFastCoverage")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.singleFileFull",
      runner.handleUnitTestCommand("unitTest.singleFileFull")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.folderDebugFast",
      runner.handleUnitTestCommand("unitTest.folderDebugFast")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.folderDebugFastCoverage",
      runner.handleUnitTestCommand("unitTest.folderDebugFastCoverage")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.folderFull",
      runner.handleUnitTestCommand("unitTest.folderFull")
    ),
    vscode.commands.registerCommand(
      "extension.bddTest.singleFileDebugFast",
      runner.handleBddTestCommand("bddTest.singleFileDebugFast")
    ),
    vscode.commands.registerCommand(
      "extension.bddTest.singleFileFull",
      runner.handleBddTestCommand("bddTest.singleFileFull")
    ),
    vscode.commands.registerCommand("extension.fetchTests", (e) => {
      runner.handleJiraXrayTestFetch(e);
    }),
    vscode.commands.registerCommand("extension.uploadTestResults", (e) => {
      runner.handleUploadCucumberTestResults(e);
    }),
    vscode.commands.registerCommand(
      "extension.unitTest.allFilesDebugFast",
      runner.handleUnitTestCommand("unitTest.allFilesDebugFast")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.allFilesDebugFastCoverage",
      runner.handleUnitTestCommand("unitTest.allFilesDebugFastCoverage")
    ),
    vscode.commands.registerCommand(
      "extension.unitTest.allFilesFull",
      runner.handleUnitTestCommand("unitTest.allFilesFull")
    )
  ];

  context.subscriptions.push(...subscriptions);
}

export function deactivate() {}
