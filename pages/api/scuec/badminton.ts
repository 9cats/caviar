// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { AES, enc, mode, pad } from 'crypto-js';
import superagent from "superagent";
import { CookieAccessInfo } from "cookiejar";
import enableProxy from 'superagent-proxy';
import type { ResponseType } from '../_type';
import { delay, getRelativeDate, getTime } from "../_utils";

enableProxy(superagent);

var proxy = process.env.http_proxy || 'http://127.0.0.1:8560';

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) => {
  let {
    username = "username", // 用户名
    password = "password", // 密码

    txrsfrzh = "txrsfrzh", // 同行人学号
    yysjd1 = "yysjd1",     // 预约时间点1，例 19:00-20:00
    yysjd2 = "yysjd2",     // 预约时间点2，例 20:00-21:00
    yycdbh = "yycdbh",     // 预约场地编号
    yyxdrq = "yyxdrq",     // 预约相对日期，例如 '+1'，表示明天
  } = req.body;

  if (username && password && txrsfrzh && yysjd1 & yysjd2 && yycdbh && yyxdrq) {
    return res.status(200).json({
      success: false,
      data: '登陆失败',
    })
  }

  let sporter = new Sporter(username, password);

  /* 登陆 */
  if (!await sporter.login()) {
    return res.status(200).json({
      success: false,
      data: '登陆失败',
    })
  }

  /* 提交 */
  let result = await sporter.submit(txrsfrzh, yysjd1, yysjd2, yycdbh, getRelativeDate(yyxdrq));

  return res.status(200).json(result);
}

/* 返回加密后的密码 */
function encryptPassword(password: string, salt: string) {
  let plain = "ABCD".repeat(16) + password;
  let config = {
    iv: enc.Utf8.parse("ABCD".repeat(4)),
    mode: mode.CBC,
    padding: pad.Pkcs7
  }
  let key = enc.Utf8.parse(salt);

  return AES.encrypt(plain, key, config).toString();
}


class Sporter {
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
    let pwdEncryptSalt: RegExpExecArray | null = null;
    let execution: RegExpExecArray | null = null;

    /* 获取加密盐 execution */
    await this.agent
      .get('http://id.scuec.edu.cn/authserver/login')
      .then((res: { text: string; }) => {
        /* 从网页中获取 pwdEncryptSalt 和 execution */
        pwdEncryptSalt = /(?<=id="pwdEncryptSalt" value=")\w+(?=" )/.exec(res.text);
        execution = /(?<=name="execution" value=").+(?=" )/.exec(res.text);
      })

    /* 未能获取到 pwdEncryptSalt 和 execution */
    if (!(pwdEncryptSalt && execution)) return false;

    /* 登陆 */
    return await this.agent
      .post("http://id.scuec.edu.cn/authserver/login")
      .type('form')
      .send({
        username: this.username,
        password: encryptPassword(this.password, pwdEncryptSalt[0]),
        execution: execution[0],
        captcha: "", //验证码
        _eventId: "submit",
        cllt: "userNameLogin",
        dllt: "generalLogin",
        lt: "",
      })
      .then(async (res: any) => {
        /* 成功登陆并授权 */
        await delay(10);
        await this.agent.get("http://id.scuec.edu.cn/authserver/login?service=http://wfw.scuec.edu.cn/2021/08/29/book")
        return true;
      })
      .catch((e: any) => {
        /* 登陆失败 */
        return false;
      })
  }

  /* 提交 */
  async submit(txrsfrzh: string, yysjd1: string, yysjd2: string, yycdbh: string, yyrq: string): Promise<ResponseType> {
    type TaskParam = {
      type: "lock" | "submit",
      yysjd: string,
    }

    type TaskResponse = {
      name: string;
      data: any,
    }

    const tasksParams: TaskParam[] = [
      { type: "lock", yysjd: yysjd1 },
      { type: "lock", yysjd: yysjd2 },
      { type: "submit", yysjd: yysjd1 },
      { type: "submit", yysjd: yysjd2 }
    ]

    let intervalTasks_timer = setInterval(() => {
      tasksParams
        .map((param: TaskParam, index: number) => {
          setTimeout(() => {
            const { type, yysjd } = param;
            const url = type == "lock" ?
              "https://wfw.scuec.edu.cn/2021/08/29/book/check_playground_status" :
              "https://wfw.scuec.edu.cn/2021/08/29/book/book"
            // "http://localhost:3000/api/test/check_playground_status" :
            // "http://localhost:3000/api/test/book"
            const data = type == "lock" ?
              { yysjd, yycdbh, yyrq } :
              { yysj: yysjd, yycdbh, yyrq, txrsfrzh }

            let taskAgent = superagent.agent();
            taskAgent.set("Cookie", this.agent.jar.getCookies(new CookieAccessInfo("wfw.scuec.edu.cn", "/")).toLocaleString());

            taskAgent
              .post(url)
              .set("Content-Type", "application/x-www-form-urlencoded")
              .send(data)
              .timeout({ deadline: 1000, response: 1000 })
              //.proxy(proxy)
              //.withCredentials()
              .then((response: superagent.Response): TaskResponse => {
                const { body: data } = response
                return { data, name: `${this.username}|${type}|${yysjd}` }
              })
              .catch((error: superagent.ResponseError): TaskResponse => {
                if (error.status = 400) {
                  return { data: error.status, name: `${this.username}|${type}|${yysjd}` }
                }

                return { data: error.message, name: `${this.username}|${type}|${yysjd}` }
              })
              .then((response: TaskResponse) => {
                console.log(getTime(), response.name);
                console.log(getTime(), response.data);
              })
          }, 10 * index)
        })
    }, 500)

    setTimeout(() => { clearInterval(intervalTasks_timer) }, 1000 * 30);

    return { success: true, data: "任务已创建" };
  }
}