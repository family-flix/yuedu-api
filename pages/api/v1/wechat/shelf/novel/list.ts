/**
 * @file 使用游标而非分页的列表接口
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { Member } from "@/domains/user/member";
import { ModelQuery } from "@/domains/store/types";
import { BaseApiResp } from "@/types/index";
import { response_error_factory } from "@/utils/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { next_marker = "", page_size = 20 } = req.body as Partial<{
    next_marker: string;
    page_size: number;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const where: ModelQuery<"novel"> = {
    user_id: member.user.id,
  };
  const result = await store.list_with_cursor({
    fetch: (args) => {
      return store.prisma.novel.findMany({
        where,
        include: {
          novel_profile: {
            include: {
              author: true,
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
    list: result.list.map((novel) => {
      const { id, novel_profile } = novel;
      const { name, cover_path, overview, author } = novel_profile;
      return {
        id,
        name,
        cover_path,
        overview,
        author: {
          id: author.id,
          name: author.name,
        },
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
