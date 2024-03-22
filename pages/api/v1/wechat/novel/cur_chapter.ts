/**
 * @file 获取指定小说的章节列表
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
  const { novel_id } = req.body as Partial<{
    novel_id: string;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const r = await NovelCore.Get({ id: novel_id, member, store });
  if (r.error) {
    return e(Result.Err(r.error.message));
  }
  const novel = r.data;
  const r2 = await novel.fetch_cur_chapter();
  if (r2.error) {
    return e(Result.Err(r2.error.message));
  }
  const data = r2.data;
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
