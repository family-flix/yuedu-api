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

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const {
    novel_id,
    prev_marker = "",
    next_marker = "",
    page_size = 100,
  } = req.body as Partial<{
    novel_id: string;
    prev_marker: string;
    next_marker: string;
    page_size: number;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  const novel = await store.prisma.novel.findFirst({
    where: {
      id: novel_id,
      user_id: member.user.id,
    },
    include: {
      novel_profile: {
        include: {
          author: true,
        },
      },
    },
  });
  if (!novel) {
    return e(Result.Err("没有匹配的记录"));
  }
  const where: ModelQuery<"novel_chapter_profile"> = {
    novel_profile_id: novel.novel_profile_id,
  };
  const result = await store.list_with_cursor({
    fetch: (args) => {
      return store.prisma.novel_chapter_profile.findMany({
        where,
        include: {
          _count: true,
          files: {
            include: {
              searched_novel: {
                include: {
                  source: true,
                },
              },
            },
          },
        },
        ...args,
      });
    },
    page_size,
    next_marker,
  });
  const data = {
    list: result.list.map((chapter) => {
      const { id, name, order, files, _count } = chapter;
      return {
        id,
        name,
        order,
        file_count: _count.files,
        files: files.map((file) => {
          const { id, name, searched_novel } = file;
          return {
            id,
            name,
            from_source: {
              id: searched_novel.source.id,
              name: searched_novel.source.name,
            },
          };
        }),
      };
    }),
    next_marker: result.next_marker,
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
