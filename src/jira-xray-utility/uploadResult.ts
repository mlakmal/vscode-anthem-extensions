import { JiraUtil } from './jiraUtil';
import { XrayUtil } from './xrayUtil';

export class UploadResult {
  private jiraUtil: JiraUtil;
  private xrayUtil: XrayUtil;

  constructor(username: string, password: string, jiraDomain: string) {
    this.jiraUtil = new JiraUtil(username, password, jiraDomain);
    this.xrayUtil = new XrayUtil(username, password, jiraDomain);
  }

  async upload(json: string, environment: string, teamId: string, testPlanId?: string) {
    let testExecutionId = await this.xrayUtil.uploadResults(this.parseExecutionResults(json));

    if (testPlanId && testExecutionId) {
      await this.xrayUtil.linkTestExecutionToTestPlan(testPlanId, testExecutionId);
      await this.jiraUtil.updateTestExecution(testExecutionId, environment, teamId, `Execution results ${environment}`);
    }
  }

  private parseExecutionResults(result: string): string {
    let resJson = JSON.parse(result);
    resJson.forEach((feature) => {
      feature.elements.forEach((element) => {
        element.steps = element.steps.filter((step) => {
          return step.keyword !== 'After';
        });
      });
    });

    return JSON.stringify(resJson);
  }
}
