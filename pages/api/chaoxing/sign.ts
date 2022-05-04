import type { NextApiRequest, NextApiResponse } from 'next';
import { stdout } from 'process';
import type { ResponseType } from '../_type';
import {ChaoXing} from './_chaoxing';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  let {
    username = "", // 用户名
    password = "", // 密码
  } = req.body;

  if (!(username && password)) {
    return res.status(200).json({
      success: false,
      msg: '未填写参数',
    })
  }

  let student = new ChaoXing(username, password);
  await student.login();

  return res.status(200).json({
    success: true,
    msg: '测试通过',
  })
}