import { FetchIssues } from "./fetchIssues";
let fetchTests = new FetchIssues(
  process.env.npm_config_username,
  process.env.npm_config_password,
  "dev",
  (process.env.PWD ? process.env.PWD : process.cwd()) +
    `/e2e/${process.env.npm_config_app}/features/`,
  "https://jira.anthem.com"
);
let issues: string[] = [];

issues = (
  process.env.npm_config_testPlans ||
  process.env.npm_config_testSets ||
  process.env.npm_config_tests ||
  ""
).split(",");
if (issues.length) {
  fetchTests.fetch(issues);
}
