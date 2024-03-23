/**
 * @file 获取小说详情，包含部分章节
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { Administrator } from "@/domains/user/administrator";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { novel_id, invalid_chapter = 0 } = req.body as Partial<{
    novel_id: string;
    invalid_chapter: number;
  }>;
  if (!novel_id) {
    return e(Result.Err("缺少 novel_id 参数"));
  }
  const t_res = await Administrator.New(authorization, store);
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
  const page_size = 100;
  const where2: ModelQuery<"novel_chapter_profile"> = {
    novel_profile_id: novel_id,
  };
  if (invalid_chapter) {
    where2.files = {
      none: {},
    };
  }
  const chapters = await store.prisma.novel_chapter_profile.findMany({
    where: where2,
    include: {
      files: {
        include: {
          searched_novel: {
            include: {
              source: true,
            },
          },
        },
        orderBy: {
          searched_novel: {
            source_id: "desc",
          },
        },
      },
    },
    take: page_size + 1,
    orderBy: {
      order: "asc",
    },
  });
  const next_marker = (() => {
    if (chapters.length <= page_size) {
      return null;
    }
    return chapters[chapters.length - 1].id;
  })();
  const { id, name, overview, cover_path, author } = r;
  const data = {
    id,
    name,
    overview,
    cover_path,
    author: {
      name: author.name,
    },
    chapter: {
      list: chapters.slice(0, page_size).map((chapter) => {
        const { id, name, files } = chapter;
        return {
          id,
          name,
          files: files.map((f) => {
            const { id, name, searched_novel } = f;
            return {
              id,
              name,
              novel_name: searched_novel.name,
              source_name: searched_novel.source.name,
            };
          }),
        };
      }),
      next_marker,
    },
    tips: [],
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
