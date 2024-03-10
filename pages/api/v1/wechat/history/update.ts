/**
 * @file 新增或更新影片播放记录
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";

import { Member } from "@/domains/user/member";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { app, store } from "@/store";
import { r_id } from "@/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const {
    novel_id,
    novel_chapter_id,
    file_id,
    progress = 0,
  } = req.body as Partial<{
    novel_id: string;
    novel_chapter_id: string;
    file_id: string;
    progress: number;
    updated: string;
    created: string;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id"));
  }
  if (!novel_chapter_id) {
    return e(Result.Err("缺少 novel_chapter_id"));
  }
  const novel = await store.prisma.novel.findFirst({
    where: {
      id: novel_id,
    },
    include: {
      novel_profile: true,
    },
  });
  if (!novel) {
    return e(Result.Err("没有匹配的记录"));
  }
  const chapter_profile = await store.prisma.novel_chapter_profile.findFirst({
    where: {
      id: novel_chapter_id,
    },
  });
  if (!chapter_profile) {
    return e(Result.Err("没有匹配的记录2"));
  }
  const file = await store.prisma.searched_chapter.findFirst({
    where: {
      id: file_id,
    },
  });
  if (!file) {
    return e(Result.Err("没有匹配的视频源"));
  }
  const existing_history = await store.prisma.read_history.findFirst({
    where: {
      novel_id,
      member_id: member.id,
    },
  });
  if (!existing_history) {
    const created_history_id = r_id();
    await store.prisma.read_history.create({
      data: {
        id: created_history_id,
        text: (() => {
          const { name } = novel.novel_profile;
          const { order } = chapter_profile;
          return `${name}/${order}`;
        })(),
        progress,
        novel_id,
        novel_chapter_id,
        file_id: file.id,
        member_id: member.id,
      },
    });
    return res.status(200).json({
      code: 0,
      msg: "新增记录成功",
      data: null,
    });
  }
  // console.log("[PAGE]history/update - thumbnail", thumbnail_res.data);
  const data: Parameters<typeof store.prisma.read_history.update>[0]["data"] = {
    novel_id,
    novel_chapter_id,
    progress,
    file_id: file.id,
    updated: dayjs().toISOString(),
  };
  await store.prisma.read_history.update({
    where: {
      id: existing_history.id,
    },
    data,
  });
  res.status(200).json({
    code: 0,
    msg: "更新记录成功",
    data: null,
  });
}
