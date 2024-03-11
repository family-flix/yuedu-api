/**
 * @file 获取成员的权限
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { User } from "@/domains/user/index";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";
import { parseJSONStr } from "@/utils/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { member_id } = req.body as Partial<{ member_id: string }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  if (!member_id) {
    return e(Result.Err("缺少成员 id"));
  }
  const member = await store.prisma.member.findFirst({
    where: {
      id: member_id,
      user_id: user.id,
    },
  });
  if (!member) {
    return e(Result.Err("没有匹配的记录"));
  }
  const { permission } = member;
  const r = parseJSONStr(permission);
  if (r.error) {
    return e(r);
  }
  res.status(200).json({ code: 0, msg: "", data: r.data });
}
