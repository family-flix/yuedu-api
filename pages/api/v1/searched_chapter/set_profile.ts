/**
 * @file 给搜索到的章节关联章节详情
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
  const { searched_chapter_id, chapter_profile } = req.body as Partial<{
    searched_chapter_id: string;
    chapter_profile: {
      id: string;
      name: string;
    };
  }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  if (!chapter_profile) {
    return e(Result.Err("缺少 chapter_profile 参数"));
  }
  const profile = await store.prisma.novel_chapter_profile.findFirst({
    where: {
      id: chapter_profile.id,
    },
  });
  if (!profile) {
    return e(Result.Err("没有匹配的记录"));
  }
  const where: ModelQuery<"searched_chapter"> = {
    id: searched_chapter_id,
  };
  const r = await store.prisma.searched_chapter.findFirst({
    where,
  });
  if (!r) {
    return e(Result.Err("没有匹配的记录"));
  }
  await store.prisma.searched_chapter.update({
    where: {
      id: r.id,
    },
    data: {
      chapter_profile_id: profile.id,
    },
  });
  res.status(200).json({
    code: 0,
    msg: "设置成功",
    data: null,
  });
}
