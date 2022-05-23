import type { NextApiRequest, NextApiResponse } from 'next';
import type { ResponseType } from '../_type';
import { ChaoXing } from './_chaoxing';
import { delay, getTime } from '../_utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    username, // 用户名
    password, // 密码
    roomId,   // 教室id
    seatNum,  // 座位号
    startTime,// 开始时间
    endTime,  // 结束时间
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
  let token = await student.getToken(roomId);
  let result: ResponseType = await student.sbumit(roomId, seatNum, startTime, endTime, token);

  if (result.success) return res.status(200).json(result); //一次成功

  /* 异步请求，高频率 */
  let IsTimeout = false, IsSuccess = false;
  setTimeout(() => { IsTimeout = true }, 1000 * 20); //20 sec 时间

  while (!IsTimeout) {
    student.sbumit(roomId, seatNum, startTime, endTime,token).then(sbumitRes => {
      result = sbumitRes
      console.log(getTime(), sbumitRes)
      if (sbumitRes.success) {
        IsSuccess = true;
        res.status(200).json(result);
      }
    })

    if (IsSuccess) return;

    await delay(100);
  }

  return res.status(200).json(result); //超时
}