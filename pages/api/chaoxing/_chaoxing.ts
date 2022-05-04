import * as superagent from "superagent";


export class ChaoXing {
  username: string;
  password: string;
  agent: superagent.SuperAgentStatic;

  /* 构造函数 */
  constructor(username: string, password: string) {
    this.username = username; //账号
    this.password = password; //密码
    this.agent = superagent.agent(); //agent
  }

  /* 登陆 */
  async login(): Promise<boolean> {
    let result = await this.agent
      .post('https://passport2.chaoxing.com/fanyalogin') //登陆接口
      .type('form') //发送数据格式 Form
      .send({ //发送数据
        uname: this.username,
        password: Buffer.from(this.password).toString('base64'),
        t: 'true'
      })
      .then(res => {
        console.log(res.text);
      })

    return true;
  }
}