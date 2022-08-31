import type { NextApiRequest, NextApiResponse } from "next";
import type { ResponseType } from "../_type";
import * as superagent from "superagent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  let {
    num = "", // 个数
  } = req.body;

  if (!num) {
    return res.status(200).json({
      success: false,
      data: "未填写参数",
    });
  }

  let agent = superagent.agent(); //agent

  let result = await agent
    .get(`http://chaoxing_slidecaptcha_verify:8888/validate/get?num=${num}`)
    .then(async (res) => {
      console.log(res.body);
      if (res.body.success) {
        return {
          success: true,
          data: "null",
        };
      } else {
        return {
          success: false,
          data: "null",
        };
      }
    })
    .catch((e) => {
      return {
        success: false,
        data: "error",
      };
    });

  return res.status(200).json(result);
}
