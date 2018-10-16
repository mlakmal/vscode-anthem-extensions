import * as request from "request";

export class RestUtil {
  private username: string;
  private password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async request(options: any): Promise<any> {
    return await new Promise((resolve, reject) => {
      options.auth = {
        user: this.username,
        password: this.password
      };
      options.strictSSL = false;
      request(options, (error: any, response: any, body: any) => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          reject(new Error(error || response.body));
          return;
        }

        resolve(this.parseJson(response.body));
      });
    });
  }

  private parseJson(json: string) {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }
}
