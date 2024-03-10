/**
 * @file 获取指定小说的章节内容
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { Member } from "@/domains/user/member";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { file_id } = req.body as Partial<{
    file_id: string;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  if (!file_id) {
    return e(Result.Err("缺少 file_id 参数"));
  }
  const searched_chapter = await store.prisma.searched_chapter.findFirst({
    where: {
      id: file_id,
    },
  });
  if (!searched_chapter) {
    return e(Result.Err("没有匹配的记录"));
  }
  const { id, name, order, content } = searched_chapter;
  const data = {
    id,
    name,
    order,
    content,
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
