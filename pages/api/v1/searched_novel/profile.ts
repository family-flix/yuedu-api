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
  const { searched_novel_id, page_size = 100 } = req.body as Partial<{
    searched_novel_id: string;
    page_size: number;
  }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"searched_novel"> = {
    id: searched_novel_id,
  };
  const args = await store.build_extra_args({ page_size });
  const r = await store.prisma.searched_novel.findFirst({
    where,
    include: {
      profile: {
        include: {
          author: true,
        },
      },
      chapters: {
        include: {
          chapter_profile: {
            include: {
              novel_profile: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
        ...args,
      },
      source: true,
    },
  });
  if (!r) {
    return e(Result.Err("没有匹配的记录"));
  }
  const { id, name, profile, source, chapters } = r;
  const data = {
    id,
    name,
    profile: {
      name: profile.name,
      cover_path: profile.cover_path,
      overview: profile.name,
    },
    source: {
      name: source.name,
    },
    chapter: {
      next_marker: store.get_next_marker(chapters, { page_size }),
      list: chapters.slice(0, page_size).map((chapter) => {
        const { id, name, url, order, chapter_profile } = chapter;
        return {
          id,
          name,
          url,
          order,
          searched_novel: {
            name,
            source_name: source.name,
          },
          profile: chapter_profile
            ? {
                name: chapter_profile.name,
                novel_name: chapter_profile.novel_profile.name,
              }
            : null,
        };
      }),
    },
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
