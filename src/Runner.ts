import * as path from "path";
import * as vscode from "vscode";
import Message from "./common/Message";
import i18nConstructor from "./util/i18n";
import Config from "./common/Config";
import { CommandMapper } from "./CommandMapper";
import Command from "./Command";
import Terminal from "./common/Terminal";
import Path from "./common/Path";
import { format } from "./util/formatter";
import { FetchIssues } from "./jira-xray-utility/fetchIssues";
import { JiraCustomFields } from "./jira-xray-utility/jiraCustomFields";
import { UploadResult } from "./jira-xray-utility/uploadResult";
import * as fs from "fs";

export default class Runner {
  message: Message;
  i18n: i18nConstructor;
  terminal: Terminal;
  config: Config;
  commandMapper: CommandMapper;
  command: Command;

  constructor() {
    this.message = new Message("Anthem Extensions");
    this.i18n = new i18nConstructor(
      "en",
      vscode.env.language,
      path.join(__dirname, "../../locale/lang.%s.json")
    );
    this.terminal = new Terminal("Anthem Extensions");
    this.config = new Config("anthem");
    this.commandMapper = new CommandMapper();
    this.config.onDidLoad(this.commandMapper.handleConfigLoad());
    this.command = new Command(this.commandMapper);
  }

  handleUnitTestCommand(subCmd: string) {
    return (e?) => {
      try {
        this.runCommand(subCmd, this.getFilePath(e));
      } catch (ex) {
        console.error(ex);
      }
    };
  }

  handleBddTestCommand(subCmd: string) {
    return (e?) => {
      try {
        this.runCommand(subCmd, this.getFilePath(e));
      } catch (ex) {
        console.error(ex);
      }
    };
  }

  handleCommandRun() {
    return (e?) => {
      try {
        let editor = vscode.window.activeTextEditor,
          path = e
            ? e.fsPath
            : editor && !editor.document.isUntitled
              ? editor.document.fileName
              : undefined;

        if (!path) throw { type: "error.noFile", message: "No file to run." };

        this.run(path);
      } catch (e) {
        let msg = format(this.i18n.message(e.type), e);
        msg ? this.message.error(msg) : console.log(e);
      }
    };
  }

  runCommand(command: string, path: string) {
    let fsPath = new Path(path),
      root = Path.wrapWhiteSpace(fsPath.root());
    this.terminal
      //.exec(this.command.cd(root, this.terminal.cwd))
      .exec(this.command.runCommand(command, fsPath));
    this.terminal.cwd = root;
  }

  run(path: string): void {
    let fsPath = new Path(path),
      root = Path.wrapWhiteSpace(fsPath.root());
    this.terminal
      .exec(this.command.cd(root, this.terminal.cwd))
      .exec(this.command.run(fsPath));
    this.terminal.cwd = root;
  }

  handleConfigChanged() {
    return () => this.config.loadNamespace();
  }

  handleTerminalClosed() {
    return (closedTerminal: vscode.Terminal) => {
      if (this.terminal.equals(closedTerminal)) this.terminal.init();
    };
  }

  async handleUploadCucumberTestResults(e: any) {
    let uploadResults = new UploadResult(
      this.config.configs.jira.username,
      this.config.configs.jira.password,
      this.config.configs.jira.domain
    );

    const jiraIssueId = await vscode.window.showInputBox({
      placeHolder: "Jira Issue ID"
    });

    const testEnvironment = await vscode.window.showQuickPick(
      [
        { label: "dev", description: "dev" },
        { label: "sit", description: "sit" }
      ],
      {
        placeHolder: "Test Environment"
      }
    );

    const jiraTeamId = await vscode.window.showInputBox({
      placeHolder: "Jira Team ID (should be numeric)"
    });

    if (jiraIssueId) {
      let data = fs.readFileSync(e.fsPath, "utf-8");
      try {
        await uploadResults.upload(
          data,
          testEnvironment.label,
          jiraTeamId,
          jiraIssueId
        );
        vscode.window.showInformationMessage(
          "Uploading cucumber results completed!!!"
        );
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          `Error uploading cucumber results: ${(
            error.stack ||
            error.message ||
            ""
          ).slice(0, 200)}`
        );
      }
    }
  }

  async handleJiraXrayTestFetch(e: any) {
    /*const jiraIssueType = await vscode.window.showQuickPick(
      [
        { label: "Test Plan", description: "TestPlan" },
        { label: "Test Set", description: "TestSet" },
        { label: "Test", description: "Test" }
      ],
      { placeHolder: "Jira Issue Type" }
    );*/

    const jiraIssueIds = await vscode.window.showInputBox({
      placeHolder: "Jira ID(s)"
    });

    const testEnvironment = await vscode.window.showQuickPick(
      [
        { label: "dev", description: "dev" },
        { label: "sit", description: "sit" }
      ],
      {
        placeHolder: "Test Environment"
      }
    );

    if (jiraIssueIds.length && e.fsPath) {
      try {
        JiraCustomFields.setProps(this.config.configs.jira.customFieldMap);
        let fetchTests = new FetchIssues(
          this.config.configs.jira.username,
          this.config.configs.jira.password,
          testEnvironment.label,
          e.fsPath,
          this.config.configs.jira.domain
        );
        await fetchTests.fetch(jiraIssueIds.split(","));
        vscode.window.showInformationMessage(
          "Fetching ira test(s) completed!!!"
        );
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          `Error fetching jira tests: ${(
            error.stack ||
            error.message ||
            ""
          ).slice(0, 200)}`
        );
      }
    }
  }

  private getFilePath(e: any) {
    let editor = vscode.window.activeTextEditor,
      path = e
        ? e.fsPath
        : editor && !editor.document.isUntitled
          ? editor.document.fileName
          : undefined;

    if (!path) throw { type: "error.noFile", message: "No file to run." };
    return path;
  }
}
