/**
 * @file 删除成员
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { User } from "@/domains/user/index";
import { response_error_factory } from "@/utils/server";
import { BaseApiResp } from "@/types/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { id } = req.query as Partial<{ id: string }>;

  if (!id) {
    return e("缺少成员 id");
  }

  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const { id: user_id } = t_res.data;

  const member = await store.prisma.member.findFirst({
    where: {
      id,
      user_id,
    },
  });
  if (!member) {
    return e("没有匹配的成员");
  }

  const r = await store.prisma.member.update({
    where: {
      id,
    },
    data: {
      delete: 1,
    },
  });
  res.status(200).json({ code: 0, msg: "删除成员成功", data: null });
}
