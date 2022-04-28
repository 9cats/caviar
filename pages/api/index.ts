// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import type { ResponseType } from './_type'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  res.status(200).json({
    success: true,
    msg: 'Hello World!',
  })
}
