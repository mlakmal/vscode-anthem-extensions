import { JiraCustomFields } from "./jiraCustomFields";
import { RestUtil } from "./restUtil";

export class XrayUtil {
  private domain = "https://jira.anthem.com";
  private preconditionUrl = `${this.domain}/rest/api/2/search/`;
  private cucumberUploadUrl = `${
    this.domain
  }/rest/raven/1.0/import/execution/cucumber`;
  private linkTestPlanToExecution = `${
    this.domain
  }/rest/raven/1.0/api/testplan`;
  private restUtil: RestUtil;

  constructor(username: string, password: string, jiraDomain: string) {
    this.domain = jiraDomain;
    this.preconditionUrl = `${this.domain}/rest/api/2/search/`;
    this.cucumberUploadUrl = `${
      this.domain
    }/rest/raven/1.0/import/execution/cucumber`;
    this.linkTestPlanToExecution = `${this.domain}/rest/raven/1.0/api/testplan`;
    this.restUtil = new RestUtil(username, password);
  }

  fetchUsers(test: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (
        test &&
        test.fields &&
        test.fields[JiraCustomFields.getProp("preConditions")] &&
        test.fields[JiraCustomFields.getProp("preConditions")].length
      ) {
        this.fetchPreconditions(
          test.fields[JiraCustomFields.getProp("preConditions")]
        ).then(
          result => {
            let preconditions: any = [];
            (result.issues || []).forEach((precondition: any) => {
              if (
                precondition.fields &&
                precondition.fields.labels &&
                precondition.fields.labels.indexOf("TestUser") >= 0
              ) {
                preconditions.push(precondition);
              }
            });
            resolve(preconditions);
          },
          error => {
            reject(null);
          }
        );
      } else {
        resolve([]);
      }
    });
  }

  fetchPreconditions(preconditions: string[]): Promise<any> {
    return this.restUtil.request({
      url: this.getPreconditionUrl(preconditions)
    });
  }

  async uploadResults(json: string): Promise<any> {
    let result = await this.restUtil.request({
      url: this.cucumberUploadUrl,
      method: "POST",
      body: json,
      headers: {
        "content-type": "application/json"
      }
    });

    return result.testExecIssue.key;
  }

  async linkTestExecutionToTestPlan(
    testPlanId: string,
    testExecutionId: string
  ): Promise<any> {
    return await this.restUtil.request({
      url: this.getTestPlanLinkUrl(testPlanId),
      method: "POST",
      body: JSON.stringify({
        add: [testExecutionId]
      }),
      headers: {
        "content-type": "application/json"
      }
    });
  }

  private getTestPlanLinkUrl(testPlanId: string) {
    return `${this.linkTestPlanToExecution}/${testPlanId}/testexecution`;
  }

  private getPreconditionUrl(preconditions: string[]): string {
    let jql = `key in(${preconditions.join(",")})`;
    return `${this.preconditionUrl}?jql=${jql}&maxResults=1000`;
  }
}
