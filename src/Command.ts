import Path from "./common/Path";
import { idToCommandMap, CommandMapper } from "./CommandMapper";
import { format } from "./util/formatter";

export default class Command {
  constructor(private mapper: CommandMapper) {}

  cd(cwd: string, wd?: string) {
    if (wd !== cwd) return format(this.mapper.changeCwd.command, { cwd });
  }

  runCommand(command: string, filePath: Path, environment?: string): string {
    let cmd = "";
    if (command.indexOf("unitTest") >= 0) {
      cmd = this.mapper.commands.unitTest[command.replace("unitTest.", "")];
    } else if (command.indexOf("bddTest") >= 0) {
      cmd = this.mapper.commands.bddTest[command.replace("bddTest.", "")];
    }

    // find template command: run file
    let isInOuterShell = this.mapper.commands.newWindow.enable;
    // handle prefix: @in, @out
    cmd = cmd.replace(/^@(out|in)\s+/, (match, $switch) => {
      if ($switch === "out") isInOuterShell = true;
      else if ($switch === "in") isInOuterShell = false;
      return "";
    });

    // handle variables: ${`javascript`}
    cmd = this.parseTemplate2({ id: "", command: cmd }, script => {
      let arr = filePath.partitions();
      let opts: any = {
        file: arr[0],
        root: arr[1],
        rPath: arr[2],
        dir: arr[3],
        lFile: arr[4],
        sFile: arr[5],
        ext: arr[6]
      };
      if (/(\/|\\\\)(app|irx)(\/|\\\\)/.test(filePath.fsPath())) {
        let matches = /(\/|\\\\)(app|e2e)(\/|\\)([a-z]{3})(\/|\\\\?)/.exec(
          filePath.fsPath()
        );
        if (matches && matches.length >= 5) {
          opts.app = matches[4];
        }
      }
      if (environment) {
        opts.env = environment;
      }

      if (script.indexOf("--app") >= 0 && !opts.app) {
        script = script.replace("--app=${app}", "");
      }

      if (script.indexOf("--env") >= 0 && !opts.env) {
        script = script.replace("--env=${env}", "");
      }

      for (const key in opts) {
        script = script.replace(
          "${" + key + "}",
          Path.unifiedSeparator(Path.wrapWhiteSpace((opts[key] || "").trim()))
        );
      }
      return script;
    });

    // handle template command: run in inner/outer terminal
    return isInOuterShell
      ? format(this.mapper.commands.newWindow.command, { command: cmd })
      : cmd;
  }

  run(filePath: Path): string {
    // find template command: run file
    let { id, command } = this.mapper.getMap(filePath.fsPath()),
      isInOuterShell = this.mapper.newWindow.enable;
    // handle prefix: @in, @out
    command = command.replace(/^@(out|in)\s+/, (match, $switch) => {
      if ($switch === "out") isInOuterShell = true;
      else if ($switch === "in") isInOuterShell = false;
      return "";
    });
    // handle variables: ${`javascript`}
    command = this.parseTemplate({ id, command }, script => {
      let [file, root, rPath, dir, lFile, sFile, ext] = filePath.partitions();
      return Path.unifiedSeparator(Path.wrapWhiteSpace(eval(script)));
    });
    // handle template command: run in inner/outer terminal
    return isInOuterShell
      ? format(this.mapper.newWindow.command, { command })
      : command;
  }

  private parseTemplate(
    map: idToCommandMap,
    parser: (variable: string) => string
  ): string {
    return map.command.replace(
      /\$\{((?:\$\{.*\}|[^}])+)\}/g,
      (match, script) => {
        try {
          console.log(parser(script));
          return parser(script);
        } catch (e) {
          throw {
            type: "error.commandParsedFail",
            commandId: map.id,
            message: e.message
          };
        }
      }
    );
  }

  private parseTemplate2(
    map: idToCommandMap,
    parser: (variable: string) => string
  ): string {
    return parser(map.command);
  }
}
