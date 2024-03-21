/**
 * @file 给章节设置书源章节
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
  const { chapter_id, searched_chapter_id } = req.body as Partial<{
    chapter_id: string;
    searched_chapter_id: string;
  }>;

  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  if (!chapter_id) {
    return e(Result.Err("缺少 chapter_id 参数"));
  }
  if (!searched_chapter_id) {
    return e(Result.Err("缺少 searched_chapter_id 参数"));
  }
  const chapter_profile = await store.prisma.novel_chapter_profile.findFirst({
    where: {
      id: chapter_id,
    },
  });
  if (!chapter_profile) {
    return e(Result.Err("没有匹配的记录"));
  }
  const searched_chapter = await store.prisma.searched_chapter.findFirst({
    where: {
      id: searched_chapter_id,
    },
  });
  if (!searched_chapter) {
    return e(Result.Err("没有匹配的记录"));
  }
  await store.prisma.searched_chapter.update({
    where: {
      id: searched_chapter.id,
    },
    data: {
      chapter_profile_id: chapter_profile.id,
    },
  });
  res.status(200).json({
    code: 0,
    msg: "设置成功",
    data: null,
  });
}
