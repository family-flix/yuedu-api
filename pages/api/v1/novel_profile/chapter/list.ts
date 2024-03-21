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
    novel_id,
    name,
    invalid = 0,
    next_marker = "",
    page_size,
  } = req.body as Partial<{
    novel_id: string;
    name: string;
    invalid: number;
    next_marker: string;
    page_size: number;
  }>;

  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"novel_chapter_profile"> = {
    novel_profile_id: novel_id,
  };
  if (name) {
    where.name = {
      contains: name,
    };
  }
  if (invalid) {
    where.files = {
      none: {},
    };
  }
  const result = await store.list_with_cursor({
    fetch: (args) => {
      return store.prisma.novel_chapter_profile.findMany({
        where,
        include: {
          novel_profile: true,
          _count: true,
        },
        orderBy: {
          novel_profile: {
            created: "desc",
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
      const { id, name, novel_profile, _count } = chapter;
      return {
        id,
        name,
        novel: {
          name: novel_profile.name,
          cover_path: novel_profile.cover_path,
        },
        file_count: _count.files,
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
