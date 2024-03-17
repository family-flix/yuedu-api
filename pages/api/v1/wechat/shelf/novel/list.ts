/**
 * @file 使用游标而非分页的列表接口
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { Member } from "@/domains/user/member";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";
import { NovelCore } from "@/domains/novel";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { page = 1, page_size = 20 } = req.body as Partial<{
    page: number;
    page_size: number;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const r = await NovelCore.fetch_novels_of_member({ page, page_size, member, store });
  if (r.error) {
    return e(Result.Err(r.error.message));
  }
  const data = r.data;
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
