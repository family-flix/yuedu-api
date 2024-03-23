/**
 * @file 获取指定小说的章节内容
 */
import fs from "fs";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { app, store } from "@/store/index";
import { Member } from "@/domains/user/member";
import { ScheduleTask } from "@/domains/schedule";
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
    include: {
      searched_novel: {
        include: {
          source: true,
        },
      },
    },
  });
  if (!searched_chapter) {
    return e(Result.Err("没有匹配的记录"));
  }
  if (!searched_chapter.content_filepath) {
    const schedule = new ScheduleTask({
      app,
      store,
    });
    const client = schedule.find_source(searched_chapter.searched_novel.source.unique_id);
    if (client) {
      await schedule.fetch_chapter_content(searched_chapter, client);
      const updated = await store.prisma.searched_chapter.findFirst({
        where: {
          id: searched_chapter.id,
        },
      });
      Object.assign(searched_chapter, updated);
    }
  }
  const { id, name, order, content_filepath } = searched_chapter;
  const data = {
    id,
    name,
    order,
    content: (() => {
      if (!content_filepath) {
        return "数据异常，请反馈后等待处理";
      }
      if (content_filepath.startsWith("/")) {
        return fs.readFileSync(content_filepath, 'utf-8');
      }
      return content_filepath;
    })(),
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
