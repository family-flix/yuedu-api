/**
 * @file
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store";
import { User } from "@/domains/user";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { QidianClient } from "@/domains/novel_profile/qidian";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  //   const { authorization } = req.headers;
  //   const t_res = await User.New(authorization, store);
  //   if (t_res.error) {
  //     return e(t_res);
  //   }
  //   const user = t_res.data;
  const { keyword } = req.body as Partial<{ keyword: string }>;
  if (!keyword) {
    return e(Result.Err("缺少 keyword 参数"));
  }
  const client = new QidianClient();
  const r = await client.search(keyword);
  if (r.error) {
    return e(Result.Err(r.error.message));
  }
  const { items, page, page_size } = r.data;
  const data = {
    list: items,
    page,
    page_size,
  };
  res.status(200).json({ code: 0, msg: "", data });
}
