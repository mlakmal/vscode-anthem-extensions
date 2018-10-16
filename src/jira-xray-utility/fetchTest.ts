import * as fs from 'fs';
import * as Gherkin from 'gherkin';
import * as os from 'os';
import * as path from 'path';
import { JiraCustomFields } from './jiraCustomFields';
import { JiraUtil } from './jiraUtil';
import { XrayUtil } from './xrayUtil';

export class FetchJiraTest {
  private jiraUtil: JiraUtil;
  private xrayUtil: XrayUtil;
  private featurePath = '';

  constructor(username: string, password: string, private environment: string, featurePath: string, jiraDomain: string) {
    this.jiraUtil = new JiraUtil(username, password, jiraDomain);
    this.xrayUtil = new XrayUtil(username, password, jiraDomain);
    this.featurePath = featurePath;
  }

  fetchTest(key: string) {
    this.jiraUtil.fetchIssue(key).then(
      (result) => {
        let test = result;
        this.xrayUtil.fetchUsers(test).then(
          (result) => {
            let users = result;
            (users || []).forEach((user: any) => {
              this.generateUserTestFeatureFile(user, test);
            });
          },
          (error) => {
            // tslint:disable-next-line:no-console
            console.error(error);
          }
        );
      },
      (error) => {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
    );
  }

  private generateUserTestFeatureFile(user: any, test: any): any {
    if (!this.environment || (user.fields.environment || '').toLowerCase() === this.environment) {
      let index = user.fields.summary.lastIndexOf('-');
      let username = user.fields.summary.substr(0, index).trim();
      let key = `${test.key}(${username}).feature`;
      let feature = this.getFeatureText(this.combineTestWithUser(test, user));
      fs.writeFileSync(path.join(this.featurePath, key), feature, 'utf-8');
    }
  }

  private combineTestWithUser(test: any, user: any): any {
    let scenario: any = `${user.fields[JiraCustomFields.getProp('conditions')]}${os.EOL}${test.fields[JiraCustomFields.getProp('cucumberScenario')]}`;
    let clonedTest = JSON.parse(JSON.stringify(test));
    clonedTest.fields[JiraCustomFields.getProp('cucumberScenario')] = scenario;
    return clonedTest;
  }

  private getFeatureText(test: any) {
    let indent = '  ';
    let result = `Feature: ${test.fields.summary}${os.EOL}`;
    result += `${indent}${this.getTestTags(test).join(' ')}${os.EOL}`;
    result += `${indent}${test.fields[JiraCustomFields.getProp('cucumberTestType')].value}: ${test.fields.summary}${os.EOL}`;

    this.splitCucumberScenariosOnNewLines(test.fields[JiraCustomFields.getProp('cucumberScenario')]).forEach((scenarioLine) => {
      if (scenarioLine) {
        result += `${indent}${indent}${scenarioLine}${os.EOL}`;
      }
    });

    if (this.validFeature(result)) {
      return result;
    }

    throw new Error('Invalid feature');
  }

  private getTestTags(test: any): string[] {
    let result: string[] = [];
    result.push(`@${test.key}`);

    (test.fields.labels || []).forEach((tag: string) => {
      result.push(`${tag.startsWith('@') ? '' : '@'}${tag}`);
    });
    result.sort();

    return result;
  }

  private splitCucumberScenariosOnNewLines(scenarios: string): string[] {
    return (scenarios || '').split(/\r?\n/);
  }

  validFeature(feature: string): boolean {
    try {
      let parser = new Gherkin.Parser();
      let gherkinDocument = parser.parse(feature);
      let pickles = new Gherkin.Compiler().compile(gherkinDocument);
      return pickles.length > 0;
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(e);
      return false;
    }
  }
}
