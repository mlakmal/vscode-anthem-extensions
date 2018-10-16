import * as micromatch from 'micromatch';


interface Config {
    get(sections: string): any
    configs: any;
}

type nameToCommandMap = {
    name: string,
    enable?: boolean,
    command: string | { [platform: string]: string }
};
type globsToCommandMap = {
    globs: string,
    command: string | { [platform: string]: string },
    exceptions?: globsToCommandMap[]
};
type CommandMap = nameToCommandMap | globsToCommandMap;
export type idToCommandMap = {
    id: string,
    enable?: boolean,
    command: string,
    exceptions?: idToCommandMap[]
};


const MATCH_OPTION = { matchBase: true, dot: true },
    platform = process.platform;

export class CommandMapper {

    commands: any;
    changeCwd: idToCommandMap;
    newWindow: idToCommandMap;
    private maps: idToCommandMap[];

    handleConfigLoad() {
        return (configs: Config) => {
            /*this.changeCwd = this.formatMap(configs.get('changeCwd'));
            this.newWindow = this.formatMap(configs.get('runInNewTerminalWindows'));
            this.maps = this.formatMaps(configs.get('globsMapToCommand'));*/
            this.commands = configs.configs;
        }
    }

    private formatMap(map: CommandMap): idToCommandMap {
        map['id'] = 'name' in map ? (map as nameToCommandMap).name : (map as globsToCommandMap).globs;
        map.command = typeof map.command === 'string'
            ? map.command
            : map.command[platform];

        return map as any as idToCommandMap;
    }

    private formatMaps(maps: CommandMap[]): idToCommandMap[] {
        for (let map of maps) {
            this.formatMap(map);
            if ('exceptions' in map) this.formatMaps((map as globsToCommandMap).exceptions);
        }
        return maps as any as idToCommandMap[];
    }

    getMap(path: string): idToCommandMap {
        let map = this.searchMap(path, this.maps);

        if (!map) throw {
            type: 'error.noConfiguration',
            path: path,
            message: 'No configuration for this type of path.'
        }
        if (!map.command) throw {
            type: 'error.noCommandInThisPlatform',
            commandId: map.id,
            message: 'No command in this platform.'
        }

        return map;
    }

    private searchMap(path: string, types: idToCommandMap[]): idToCommandMap {
        let match: idToCommandMap,
            match2: idToCommandMap;

        for (let type of types)
            if (micromatch.isMatch(path, type.id, MATCH_OPTION)) {
                match = type;
                match2 = type.exceptions && this.searchMap(path, type.exceptions);
                return match2 || match;
            }
    }
}