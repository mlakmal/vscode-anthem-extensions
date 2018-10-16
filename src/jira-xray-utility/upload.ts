import * as fs from 'fs';
import * as path from 'path';
import { UploadResult } from './uploadResult';

let uploadResults = new UploadResult(process.env.npm_config_username, process.env.npm_config_password, "https://jira.anthem.com");
let issues = process.env.npm_config_testPlans;
if (issues) {
  let data = fs.readFileSync(path.join(process.cwd(), '/reports/json/cucumber_report.json'), 'utf-8');
  uploadResults.upload(data, process.env.npm_config_env, process.env.npm_config_teamId, issues);
}
