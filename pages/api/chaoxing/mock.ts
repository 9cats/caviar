import type { NextApiRequest, NextApiResponse } from "next";
import * as superagent from "superagent";
import { generateCaptchaKey } from "../../../utils/generateCaptchaKey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let callback = (obj: any) => obj;
  const { captchaKey, token } = generateCaptchaKey();

  const result = await superagent
    .post("http://captcha.chaoxing.com/captcha/get/verification/image")
    .timeout(5000)
    .type("form")
    .send({
      callback: "callback",
      captchaId: "42sxgHoTPTKbt0uZxPJ7ssOvtXr3ZgZ1",
      type: "slide",
      version: "1.1.13",
      captchaKey,
      token,
      referer: "https://office.chaoxing.com/front/third/apps/seatengine/select",
    })
    .then((res) => {
      try {
        const result = eval(res.text);
        result.success = true;
        // console.log(result);
        return result;
      } catch {
        return { success: false };
      }
    })
    .catch(() => {
      return { success: false };
    });

  return res.status(200).json(result);
}
