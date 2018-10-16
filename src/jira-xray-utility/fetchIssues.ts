import { FetchJiraTest } from "./fetchTest";
import { JiraCustomFields } from "./jiraCustomFields";
import { JiraUtil } from "./jiraUtil";

export class FetchIssues {
  private jiraUtil: JiraUtil;
  private fetchTest: FetchJiraTest;
  private testKeys: any = [];

  constructor(
    username: string,
    password: string,
    environment: string,
    featurePath: string,
    jiraDomain: string
  ) {
    this.jiraUtil = new JiraUtil(username, password, jiraDomain);
    this.fetchTest = new FetchJiraTest(
      username,
      password,
      environment,
      featurePath,
      jiraDomain
    );
  }

  async fetch(keys: string[]) {
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      let result = await this.jiraUtil.fetchIssue(key, { field: "issuetype" });
      switch (result.fields.issuetype.name) {
        case "Test":
          this.insertTestKey(key);
          break;
        case "Test Plan":
        case "Test Set":
          let result2 = await this.jiraUtil.fetchIssue(key);
          (
            result2.fields[
              result.fields.issuetype.name === "Test Plan"
                ? JiraCustomFields.getProp("testPlanKeys")
                : JiraCustomFields.getProp("testSetKeys")
            ] || []
          ).forEach((childKey: string) => {
            this.insertTestKey(childKey);
          });
          break;
        default:
          throw new Error("invalid test type " + result.fields.issuetype.name);
      }
    }

    for (let index = 0; index < this.testKeys.length; index++) {
      await this.fetchTest.fetchTest(this.testKeys[index]);
    }
  }

  private insertTestKey(key: string) {
    if (this.testKeys.indexOf(key) < 0) {
      this.testKeys.push(key);
    }
  }
}
