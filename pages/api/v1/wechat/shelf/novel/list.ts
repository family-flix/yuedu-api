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
  const { page = 1, page_size = 20 } = req.body as Partial<{
    page: number;
    page_size: number;
  }>;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const result: {
    id: string;
    novel_profile_id: string;
    novel_profile_name: string;
    novel_profile_cover_path: string;
    latest_chapter_created: string;
    author_id: string;
    author_name: string;
    cur_chapter_name: string | null;
    updated: string | null;
  }[] = await store.prisma.$queryRaw`
SELECT
  n.id AS id,
  novel_profile.id AS novel_profile_id,
  novel_profile.name AS novel_profile_name,
  novel_profile.cover_path AS novel_profile_cover_path,
  novel_profile.author_id AS author_id,
  novel_profile.author_name AS author_name,
  ncp.name AS cur_chapter_name,
  latest_chapter.name AS latest_chapter_name,
  latest_chapter.created AS latest_chapter_created,
  history.updated AS updated
FROM Novel n
LEFT JOIN (
  SELECT
    ph.updated AS updated,
    ph.novel_id AS novel_id,
    ph.novel_chapter_id AS novel_chapter_profile_id
  FROM PlayHistory ph
  ORDER BY ph.updated DESC
) history ON history.novel_id = n.id
LEFT JOIN (
  SELECT
    m2.id AS novel_profile_id,
    m3.chapter_profile_name AS name,
    MAX(m3.chapter_order) AS chapter_order,
    m3.created AS created
  FROM NovelProfile m2
  JOIN (
    SELECT
      mm3.id AS chapter_profile_id,
      mm3.name AS chapter_profile_name,
      mm3.novel_profile_id AS novel_profile_id,
      mm3.\'order\' AS chapter_order,
      f.created AS created
    FROM NovelChapterProfile mm3
    LEFT JOIN SearchedNovelChapter f
    ON mm3.id = f.chapter_profile_id
    GROUP BY mm3.id
    HAVING COUNT(f.id) > 0
  ) m3 ON m2.id = m3.novel_profile_id
  GROUP BY m2.id
) latest_chapter ON n.novel_profile_id = latest_chapter.novel_profile_id
LEFT JOIN NovelChapterProfile ncp ON ncp.id = history.novel_chapter_profile_id
LEFT JOIN (
  SELECT
    np.id AS id,
    np.name AS name,
    np.overview AS overview,
    np.cover_path AS cover_path,
    na.id AS author_id,
    na.name AS author_name
  FROM NovelProfile np
  JOIN NovelAuthor na ON np.author_id = na.id
) novel_profile ON  n.novel_profile_id = novel_profile.id
WHERE n.user_id = '${member.user.id}'
LIMIT ${page_size} OFFSET ${(page - 1) * page_size}
  `;
  const data = {
    page,
    page_size,
    list: result.map((novel) => {
      const { id, novel_profile_cover_path, novel_profile_name, author_id, author_name } = novel;
      return {
        id,
        name: novel_profile_name,
        cover_path: novel_profile_cover_path,
        overview: null,
        author: {
          id: author_id,
          name: author_name,
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
