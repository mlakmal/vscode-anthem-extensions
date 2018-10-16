export class JiraCustomFields {
  private static testType = "customfield_14120";
  private static cucumberTestType = "customfield_14121";
  private static cucumberScenario = "customfield_14122";
  private static sprints = "customfield_11224";
  private static testSetKeys = "customfield_14126";
  private static testPlanKeys = "customfield_14726";
  private static preConditions = "customfield_14127";
  private static preConType = "customfield_14129";
  private static conditions = "customfield_14130";
  private static revision = "customfield_14136";
  private static testEnvironment = "customfield_14725";
  private static itTeam = "customfield_12479";

  static setProps(props: any) {
    for (const key in props) {
      if (this[key]) {
        this[key] = props[key];
      }
    }
  }

  static getProp(key: string): string{
    return this[key];
  }
}
