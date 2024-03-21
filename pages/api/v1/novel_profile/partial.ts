/**
 * @file 使用游标而非分页的列表接口
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { User } from "@/domains/user/index";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);

  const { authorization } = req.headers;
  const { novel_id } = req.body as Partial<{
    novel_id: string;
  }>;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"novel_profile"> = {
    id: novel_id,
  };
  const r = await store.prisma.novel_profile.findFirst({
    where,
    include: {
      author: true,
    },
  });
  if (!r) {
    return e(Result.Err("没有匹配的记录"));
  }
  const { id, name, cover_path, author } = r;
  const data = {
    id,
    name,
    cover_path,
    author: {
      name: author.name,
    },
    tips: [],
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
