import * as superagent from "superagent";
import type { ResponseType } from '../_type';
import { getRelativeDate } from "../_utils";

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
  async login(): Promise<Boolean> {
    return await this.agent
      .post('https://passport2.chaoxing.com/fanyalogin') //登陆接口
      .type('form') //发送数据格式 Form
      .send({ //发送数据
        uname: this.username,
        password: Buffer.from(this.password).toString('base64'),
        t: 'true'
      })
      .then(async res => {
        let result = JSON.parse(res.text).status;

        /* 登陆到 office.chaoxing.com */
        await this.agent.get('https://office.chaoxing.com/front/third/apps/seat/index');
        return result;
      })
      .catch(e => {
        return false;
      })
  }

  /* 签到 */
  async sign(): Promise<ResponseType> {
    /* 获取最近的预约信息 */
    let recentID = await this.agent
      .get('https://office.chaoxing.com/data/apps/seatengine/reservelist')
      .query({
        pageSize: '1',
        seatId: '602'
      })
      .then(res => {
        try {
          return res.body.data.reserveList[0].id;
        } catch (e) {
          return null;
        }
      })

    if (!recentID) {
      return {
        success: false,
        data: "未能获取到最近的预约信息"
      };
    }

    /* 签到 */
    return await this.agent
      .get('https://office.chaoxing.com/data/apps/seatengine/sign')
      .query({ id: recentID })
      .then(res => {
        return {
          success: res.body.success,
          data: res.body.msg
        }
      })
  }

  /* 获取 Token */
  async getToken(roomId: String): Promise<String> {
    return await this.agent
      .get("https://office.chaoxing.com/front/apps/seatengine/select")
      .query({
        id: roomId,
        day: getRelativeDate("1"),
        backLevel: "2",
        seatId: "602"
      })
      .then(res => {
        let index = res.text.indexOf("token: '") + 8;
        return res.text.slice(index, index + 32); //获取token
      })
  }

  /* 预约 */
  async sbumit(roomId: String, seatNum: String, startTime: String, endTime: String, token: String): Promise<ResponseType> {
    return await this.agent
      .post('https://office.chaoxing.com/data/apps/seatengine/submit')
      .type('form') //发送数据格式 Form
      .send({ //发送数据
        roomId: roomId,
        startTime: startTime,
        endTime: endTime,
        day: getRelativeDate("1"),
        seatNum: seatNum,
        token: token
      })
      .then(res => {
        return {
          success: res.body.success,
          data: res.body.msg
        }
      })
  }
}