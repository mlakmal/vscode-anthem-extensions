# Anthem Extensions

## Features
- Right click file or folder and run unit tests or bdd tests.
    - for unit testing single spec file, you can right click on *spec.ts file and run unit test command only for that file.
    - for unit testing all *spec.ts files under given folder, you can right click a feature folder and run all unit tests under that folder.
    - for unit testing all *spec files under given application folder, you can right click application folder (which is under app folder ex: app/xyz) and run all unit tests.
    - for running single bdd test *.feature file, you can right click the feature file and run bdd test.
    - for running all bdd feature tests under application folder, you can right click application folder (ex: app/xyz) and run all feature files under that folder.
- Allow fetching cucumber feature files from JIRA Xray TestPlan, TestSet or Test Issue id's.

## Usage
After installing the extension make sure you configure the unit test and bdd test configurations to support your workspace.
### 1. Unit Test Configuration
Under your vs code workspace settings add below configuration. by default i have included the commands for unit testing in anthem angular framework below (this can be replaced by any command on your side).
All configuration settings for unit testing should be under "unitTest" json property.
``` json
"anthem": {
    "unitTest": {
      "enabled": true,
      "singleFileDebugFast": "gulp test --fast --debug --file=${lFile} --app=${app}",
      "singleFileDebugFastCoverage": "gulp test --coverage=true --fast --debug --file=${lFile} --app=${app}",
      "singleFileFull": "gulp test --coverage=true --file=${lFile} --app=${app}",
      "folderDebugFast": "gulp test --fast --debug --folder=${rPath} --app=${app}",
      "folderDebugFastCoverage": "gulp test --coverage=true --fast --debug --folder=${rPath} --app=${app}",
      "folderFull": "gulp test --coverage=true --folder=${rPath} --app=${app}",
      "allFilesDebugFast": "gulp test --fast --debug --app=${app}",
      "allFilesDebugFastCoverage": "gulp test --fast --debug --coverage=true --app=${app}",
      "allFilesFull": "gulp test --coverage=true --app=${app}"
    }
  }
```
#### 1.1 `enabled` - This enables unit test settings.
#### 1.2 `singleFileDebugFast` - Used to define unit test command for single spec file with debug and fast mode.
#### 1.3 `singleFileDebugFastCoverage` - Used to define unit test command for single spec file with debug, fast mode and coverage report.
#### 1.4 `singleFileFull` - Used to define unit test command for all spec files inside folder with debug, fast mode and coverage report.
#### 1.5 `folderDebugFast` - Used to define unit test command for all spec files inside folder with debug and fast mode.
#### 1.6 `folderDebugFastCoverage` - Used to define unit test command ffor all spec files inside folder with debug, fast mode and coverage report.
#### 1.7 `folderFull` - Used to define unit test command for all spec files inside folder with debug, fast mode and coverage report.

### 2. BDD Test Configuration
Below is a default confirguration for bdd test in anthem javascript automation test framework.
``` json
"anthem": {
    "bddTest": {
      "enabled": true,
      "singleFileDebugFast": "npm start --fast --debug --tests=${lFile} --app=${app}",
      "singleFileFull": "npm start --tests=${lFile} --app=${app}",
      "allFilesDebugFast": "npm start --fast --debug --app=${app}",
      "allFilesFull": "npm start --app=${app}"
    }
  }
```
#### 2.1 `jira.domain` - Include the jira domain url for your jira instnace. this will be used for cucumber feature file fetch from jira.
#### 2.2 `enabled` - This enables bdd test settings.
#### 2.2 `singleFileDebugFast` - Used to define bdd test command for running single feature file with debug and fast mode.
#### 2.3 `singleFileFull` - Used to define bdd test command for running single feature file with debug, fast mode and coverage report.
#### 2.4 `allFilesDebugFast` - Used to define bdd test command for all feature files under given application folder with debug, fast mode and coverage report.
#### 2.5 `allFilesFull` - Used to define bdd test command for all feature files under given application folder with full mode.

### 3. Fetch and Upload cucumer feature files and test results
You will need to define the below configurations under you workspace settings and user settings.
#### Workspace settings
``` json
"anthem": {
    "jira": {
      "domain": "https://jira.company.com"
    }
  }
```
#### User settings
Below username/password will be used to authenticate with jira instance when fetching cucumber feature files and uploading cucumber test results back to jira.
``` json
"anthem": {
        "jira": {
            "domain": "https://jira.anthem.com",
            "username": "jira userid",
            "password": "jira password"
        }
    }
```

### Screenshots
#### Unit testing Single File
![preview](https://github.com/mlakmal/vscode-anthem-extensions/raw/master/images/unit-file.gif)
#### Unit testing Folder
![preview](https://github.com/mlakmal/vscode-anthem-extensions/raw/master/images/unit-folder.gif)
#### Unit testing application folder
![preview](https://github.com/mlakmal/vscode-anthem-extensions/raw/master/images/unit-app.gif)

#### BDD testing Single File
![preview](https://github.com/mlakmal/vscode-anthem-extensions/raw/master/images/bdd-file.gif)
#### Unit testing application folder
![preview](https://github.com/mlakmal/vscode-anthem-extensions/raw/master/images/bdd-app.gif)