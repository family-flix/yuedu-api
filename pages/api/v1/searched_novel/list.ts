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
    name,
    next_marker = "",
    page_size,
  } = req.body as Partial<{
    name: string;
    next_marker: string;
    page_size: number;
  }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const where: ModelQuery<"searched_novel"> = {};
  if (name) {
    where.name = {
      contains: name,
    };
  }
  const result = await store.list_with_cursor({
    fetch: (args) => {
      return store.prisma.searched_novel.findMany({
        where,
        include: {
          profile: true,
          source: true,
        },
        ...args,
      });
    },
    page_size,
    next_marker,
  });
  const data = {
    next_marker: result.next_marker,
    list: result.list.map((novel) => {
      const { id, name, url, profile, source } = novel;
      return {
        id,
        name,
        url,
        profile: {
          name: profile.name,
          cover_path: profile.cover_path,
        },
        source: {
          name: source.name,
          hostname: source.url,
        },
      };
    }),
  };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
