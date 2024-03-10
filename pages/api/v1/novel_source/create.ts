/**
 * @file 将小说添加到书架
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store";
import { User } from "@/domains/user";
import { Member } from "@/domains/user/member";
import { QidianClient } from "@/domains/novel_profile/qidian";
import {
  SearchedNovelChapterProfile,
  SearchedPartialNovelProfile,
  SearchedNovelSectionProfile,
} from "@/domains/novel_profile/types";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { r_id } from "@/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const { unique_id, name, url } = req.body as Partial<{ unique_id: string; name: string; url: string }>;
  if (!unique_id) {
    return e(Result.Err("缺少 unique_id 参数"));
  }
  if (!name) {
    return e(Result.Err("缺少 name 参数"));
  }
  if (!url) {
    return e(Result.Err("缺少 url 参数"));
  }
  const existing = await store.prisma.novel_source.findFirst({
    where: {
      unique_id,
    },
  });
  if (existing) {
    return e(Result.Err("该书源已存在"));
  }
  await store.prisma.novel_source.create({
    data: {
      id: r_id(),
      unique_id,
      name,
      url,
      rule: "{}",
      user_id: member.user.id,
    },
  });
  res.status(200).json({ code: 0, msg: "", data: null });
}
