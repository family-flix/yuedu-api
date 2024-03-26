/**
 * @file 使用游标而非分页的列表接口
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { User } from "@/domains/user/index";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp } from "@/types/index";
import { response_error_factory } from "@/utils/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);

  const { authorization } = req.headers;
  const {
    searched_novel_id,
    name,
    novel_name,
    next_marker = "",
    page_size,
  } = req.body as Partial<{
    searched_novel_id: string;
    name: string;
    novel_name: string;
    next_marker: string;
    page_size: number;
  }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"searched_chapter"> = {};
  if (name) {
    where.name = {
      contains: name,
    };
  }
  if (searched_novel_id) {
    where.searched_novel_id = searched_novel_id;
  }
  if (novel_name) {
    where.searched_novel = {
      name: {
        contains: novel_name,
      },
    };
  }
  const result = await store.list_with_cursor({
    fetch: (args) => {
      return store.prisma.searched_chapter.findMany({
        where,
        include: {
          searched_novel: {
            include: {
              source: true,
            },
          },
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
      });
    },
    page_size,
    next_marker,
  });
  const data = {
    next_marker: result.next_marker,
    list: result.list.map((searched) => {
      const { id, name, url, order, chapter_profile, searched_novel } = searched;
      return {
        id,
        name,
        url,
        order,
        searched_novel: {
          name: searched_novel.name,
          source_name: searched_novel.source.name,
        },
        profile: chapter_profile
          ? {
              name: chapter_profile.name,
              novel_name: chapter_profile.novel_profile.name,
              cover_path: chapter_profile.novel_profile.cover_path,
            }
          : null,
      };
    }),
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
