// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { AES, enc, mode, pad } from 'crypto-js';
import * as superagent from "superagent";
import type { ResponseType } from '../_type';
import {getRelativeDate} from "../_utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
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

  return res.status(200).json({
    success: true,
    data: result,
  })
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
        await this.agent.get("http://id.scuec.edu.cn/authserver/login?service=http://wfw.scuec.edu.cn/2021/08/29/book")
        return true;
      })
      .catch((e: any) => {
        /* 登陆失败 */
        return false;
      })
  }

  /* 提交 */
  async submit(txrsfrzh: string, yysjd1: string, yysjd2: string, yycdbh: string, yyrq: string): Promise<string> {
    let lock1 = this.agent
      .post("https://wfw.scuec.edu.cn/2021/08/29/book/check_playground_status")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        "yysjd": yysjd1, //预约的时间段
        "yyrq": yyrq, //预约日期
        "yycdbh": yycdbh, //预约场地编号
      })

    let lock2 = this.agent
      .post("https://wfw.scuec.edu.cn/2021/08/29/book/check_playground_status")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        "yysjd": yysjd2, //预约的时间段
        "yyrq": yyrq, //预约日期
        "yycdbh": yycdbh, //预约场地编号
      })

    await Promise.all([lock1, lock2]);

    let submit1 = this.agent
      .post("https://wfw.scuec.edu.cn/2021/08/29/book/book")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        "txrsfrzh": txrsfrzh, //同行人身份认证号
        "yysj": yysjd1,       //yydsj.replace('(', ''),
        "yyrq": yyrq,         //预约日期
        "yycdbh": yycdbh      //预约场地编号
      })
      .then((res: { text: any; }) => {
        return res.text;
      })

    let submit2 = this.agent
      .post("https://wfw.scuec.edu.cn/2021/08/29/book/book")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        "txrsfrzh": txrsfrzh, //同行人身份认证号
        "yysj": yysjd2,       //yydsj.replace('(', ''),
        "yyrq": yyrq,         //预约日期
        "yycdbh": yycdbh      //预约场地编号
      })
      .then((res: { text: any; }) => {
        return res.text;
      })

    return await Promise.all([submit1, submit2]).then(result => {
      return result[0] + result[1];
    });
  }
}