/**
 * @file 新增成员
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { User } from "@/domains/user/index";
import { BaseApiResp, Result } from "@/types/index";
import { response_error_factory } from "@/utils/server";
import { r_id } from "@/utils/index";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { remark, name, email } = req.body as Partial<{
    name: string;
    email: string;
    remark: string;
  }>;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  if (!remark) {
    return e(Result.Err("缺少成员备注"));
  }
  const existing_member = await store.prisma.member.findUnique({
    where: {
      user_id_inviter_id_remark: {
        remark,
        inviter_id: "",
        user_id: user.id,
      },
    },
  });
  if (existing_member) {
    return e(Result.Err("已存在相同备注的成员了"));
  }
  const r = await store.prisma.member.create({
    data: {
      id: r_id(),
      remark,
      name: name || null,
      email: email || null,
      disabled: 0,
      user_id: user.id,
    },
  });
  const token_res = await User.Token({ id: r.id });
  if (token_res.error) {
    return e(token_res);
  }
  const token = token_res.data;
  const r2 = await store.prisma.member_token.create({
    data: {
      id: r_id(),
      token,
      used: 0,
      member_id: r.id,
    },
  });
  const member = {
    id: r.id,
    remark: r.remark,
    tokens: [
      {
        id: r2.id,
        token: r2.token,
        used: r2.used,
      },
    ],
  };
  res.status(200).json({ code: 0, msg: "添加成员成功", data: member });
}
