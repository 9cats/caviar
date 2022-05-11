import type { NextApiRequest, NextApiResponse } from 'next';
import type { ResponseType } from '../_type';
import { ChaoXing } from './_chaoxing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  let {
    username, // 用户名
    password, // 密码
    roomId,   // 教室id
    seatNum   // 座位号
  } = req.body;

  if (!(username && password && roomId && seatNum)) {
    return res.status(200).json({
      success: false,
      data: '未填写参数',
    })
  }

  let student = new ChaoXing(username, password);

  /* 登陆 */
  if (!await student.login()) {
    return res.status(200).json({
      success: false,
      data: '登陆失败，密码错误',
    })
  }

  /* 签到 */
  let result = await student.sbumit(roomId, seatNum);
  return res.status(200).json(result)
}