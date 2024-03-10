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
  const { novel_id, novel_chapter_id } = req.body as Partial<{
    novel_id: string;
    novel_chapter_id: string;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  if (!novel_chapter_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  const novel = await store.prisma.novel.findFirst({
    where: {
      id: novel_id,
      user_id: member.user.id,
    },
  });
  if (!novel) {
    return e(Result.Err("没有匹配的记录"));
  }
  const chapter_profile = await store.prisma.novel_chapter_profile.findFirst({
    where: {
      id: novel_chapter_id,
    },
    include: {
      files: true,
    },
  });
  if (!chapter_profile) {
    return e(Result.Err("没有匹配的记录"));
  }
  const { id, name, order, files } = chapter_profile;
  const data = {
    id,
    name,
    order,
    files: files.map((file) => {
      const { name, content } = file;
      return {
        name,
        content,
      };
    }),
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
