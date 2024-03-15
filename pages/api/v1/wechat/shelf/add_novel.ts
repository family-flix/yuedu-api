/**
 * @file 将小说添加到书架
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store";
import { Member } from "@/domains/user/member";
import { SearchedPartialNovelProfile } from "@/domains/novel_profile/types";
import { NovelProfileClient } from "@/domains/novel_profile";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { r_id } from "@/utils/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const { unique_id, name, overview, cover_path, in_production } = req.body as Partial<SearchedPartialNovelProfile>;
  if (!unique_id) {
    return e(Result.Err("缺少 unique_id 参数"));
  }
  if (!name) {
    return e(Result.Err("缺少 name 参数"));
  }
  if (!overview) {
    return e(Result.Err("缺少 overview 参数"));
  }
  if (!cover_path) {
    return e(Result.Err("缺少 cover_path 参数"));
  }
  const profile_client = new NovelProfileClient({
    store,
  });
  console.log("before get_novel_profile", unique_id);
  const r1 = await profile_client.get_novel_profile({ unique_id });
  if (r1.error) {
    return e(Result.Err(r1.error.message));
  }
  const novel_profile = r1.data;
  const existing = await store.prisma.novel.findFirst({
    where: {
      novel_profile_id: novel_profile.id,
      user_id: member.user.id,
    },
  });
  if (existing) {
    return e(Result.Err("添加成功"));
  }
  await store.prisma.novel.create({
    data: {
      id: r_id(),
      name: novel_profile.name,
      novel_profile_id: novel_profile.id,
      user_id: member.user.id,
    },
  });
  res.status(200).json({ code: 0, msg: "", data: null });
}
