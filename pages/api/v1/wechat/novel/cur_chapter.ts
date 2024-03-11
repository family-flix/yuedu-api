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
import { NovelCore } from "@/domains/novel";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const { novel_id } = req.body as Partial<{
    novel_id: string;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const r = await NovelCore.Get({ id: novel_id, member, store });
  if (r.error) {
    return e(Result.Err(r.error.message));
  }
  const novel = r.data;
  const r2 = await novel.fetch_cur_chapter();
  if (r2.error) {
    return e(Result.Err(r2.error.message));
  }
  const data = r2.data;
  // const args = store.build_extra_args({ next_marker, page_size });
  // const novel = await store.prisma.novel.findFirst({
  //   where: {
  //     id: novel_id,
  //     user_id: member.user.id,
  //   },
  //   include: {
  //     novel_profile: {
  //       include: {
  //         author: true,
  //         novel_chapter_profiles: {
  //           orderBy: {
  //             order: "asc",
  //           },
  //           include: {
  //             files: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 order: true,
  //               },
  //             },
  //           },
  //           ...args,
  //         },
  //       },
  //     },
  //   },
  // });
  // if (!novel) {
  //   return e(Result.Err("没有匹配的记录"));
  // }
  // const history = await store.prisma.read_history.findFirst({
  //   where: {
  //     novel_id,
  //     member_id: member.id,
  //   },
  //   include: {
  //     novel_chapter: {
  //       include: {
  //         files: {
  //           select: {
  //             id: true,
  //             name: true,
  //             order: true,
  //           },
  //         },
  //       },
  //     },
  //     file: true,
  //   },
  // });
  // const { id, novel_profile } = novel;
  // const { name, cover_path, overview, novel_chapter_profiles } = novel_profile;
  // const chapters = novel_chapter_profiles.slice(0, page_size).map((chapter) => {
  //   const { id, name, order, updated_at, files } = chapter;
  //   return {
  //     id,
  //     order,
  //     name,
  //     updated_at,
  //     files: files.map((file) => {
  //       const { id, name } = file;
  //       return {
  //         id,
  //         name,
  //       };
  //     }),
  //   };
  // });
  // const cur_chapter = await (async () => {
  //   if (!history) {
  //     return chapters[0];
  //   }
  //   const r = history.novel_chapter;
  //   return r;
  // })();
  // const data = {
  //   id,
  //   name,
  //   cover_path,
  //   overview,
  //   chapters,
  //   next_marker: store.get_next_marker(novel_chapter_profiles, { page_size }),
  //   cur_chapter: {
  //     id: cur_chapter.id,
  //     name: cur_chapter.name,
  //     order: cur_chapter.order,
  //     files: cur_chapter.files.map((f) => {
  //       const { id, name } = f;
  //       return {
  //         id,
  //         name,
  //       };
  //     }),
  //   },
  // };
  res.status(200).json({
    code: 0,
    msg: "",
    data,
  });
}
