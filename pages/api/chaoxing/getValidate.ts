import type { NextApiRequest, NextApiResponse } from "next";
import type { ResponseType } from "../_type";
import * as superagent from "superagent";
import { generateCaptchaKey } from "../../../utils/generateCaptchaKey";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  let {
    num = "", // 个数
  } = req.body;
  let numInt = parseInt(num as string);

  if (!num) {
    return res.status(200).json({
      success: false,
      data: "未填写参数",
    });
  }

  let callback = (obj: any) => obj;

  let requestImageVerification: Array<Promise<any>> = [];

  for (var i = 0; i < numInt; i++) {
    const { captchaKey, token } = generateCaptchaKey();

    requestImageVerification.push(
      new Promise((resolve) => {
        setTimeout(async () => {
          const result = superagent
            .post("http://captcha.chaoxing.com/captcha/get/verification/image")
            .timeout(5000)
            .type("form")
            .send({
              callback: "callback",
              captchaId: "42sxgHoTPTKbt0uZxPJ7ssOvtXr3ZgZ1",
              type: "slide",
              version: "1.1.14",
              captchaKey,
              token,
              referer:
                "https://office.chaoxing.com/front/third/apps/seatengine/select",
            })
            .then((res) => {
              try {
                const result = eval(res.text);
                result.success = true;
                return result;
              } catch {
                return { success: false };
              }
            })
            .catch(() => {
              return { success: false };
            });

          resolve(result);
        }, i * 30);
      })
    );
  }


  const imageVerificationList = await Promise.all(requestImageVerification);

  let result = await superagent
    .post(`http://chaoxing_slidecaptcha_verify:8888/validate/get`)
    .send({
      num,
      imageVerificationList
    })
    .then(async (res: { body: ResponseType }) => {
      return res.body;
    })
    .catch(() => {
      return {
        success: false,
        data: "error",
      };
    });

  return res.status(200).json(result);
}

// await agent
// .post("http://captcha.chaoxing.com/captcha/get/verification/image")
// .timeout(5000)
// .type("form")
// .send({
//   callback: "callback",
//   captchaId: "42sxgHoTPTKbt0uZxPJ7ssOvtXr3ZgZ1",
//   type: "slide",
//   version: "1.1.13",
//   captchaKey,
//   token,
//   referer: "https://office.chaoxing.com/front/third/apps/seatengine/select",
// })
// .then((res) => {
//   try {
//     const result = eval(res.text);
//     result.success = true;
//     console.log(result);
//     return result;
//   } catch {
//     return { success: false };
//   }
// })
// .catch(() => {
//   return { success: false };
// });
