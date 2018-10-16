import { JiraCustomFields } from "./jiraCustomFields";
import { RestUtil } from "./restUtil";

export class JiraUtil {
  private domain = "https://jira.anthem.com";
  private issueUrl = `${this.domain}/rest/api/2/issue/`;
  private restUtil: RestUtil;

  constructor(username: string, password: string, jiraDomain: string) {
    this.domain = jiraDomain;
    this.issueUrl = `${this.domain}/rest/api/2/issue/`;
    this.restUtil = new RestUtil(username, password);
  }

  async fetchIssue(issueKey: string, params: any = {}) {
    return await this.restUtil.request({
      url: this.getJiraIssueUrl(issueKey, params)
    });
  }

  async updateTestExecution(
    testExecutionId: string,
    environment: string,
    teamId: string,
    summary: string
  ): Promise<any> {
    let fields = {
      environment: environment, //environment,
      summary: summary
    };

    fields[JiraCustomFields.getProp("revision")] = environment;
    fields[JiraCustomFields.getProp("testEnvironment")] = environment;
    fields[JiraCustomFields.getProp("itTeam")] = [
      {
        id: teamId //it team
      }
    ];
    return await this.restUtil.request({
      url: `${this.issueUrl}${testExecutionId}`,
      method: "PUT",
      body: JSON.stringify({
        fields: fields
      }),
      headers: {
        "content-type": "application/json"
      }
    });
  }

  private getJiraIssueUrl(issueKey: string, params: any = {}): string {
    let url = `${this.issueUrl}${issueKey}`;
    let paramString = "";
    for (const key in params) {
      paramString += `${key}=${params[key]}`;
    }

    return `${url}${url.indexOf("?") >= 0 ? "" : "?"}${paramString}`;
  }
}
