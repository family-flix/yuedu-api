/**
 * @file 使用游标而非分页的列表接口
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store/index";
import { Member } from "@/domains/user/member";
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
  const r: {
    id: string;
    name: string;
    cover_path: string;
    latest_chapter_name: string;
    created_at: number;
  }[] = await store.prisma.$queryRaw`
SELECT
  Novel.id AS id,
  LatestChapter.chapter_name AS latest_chapter_name,
  LatestChapter.novel_name AS name,
  LatestChapter.created AS created_at
FROM Novel
LEFT JOIN (
  SELECT
    NovelProfile.id AS novel_id,
    NovelProfile.name AS novel_name,
    ChapterWithFiles.chapter_profile_name AS chapter_name,
    MAX(ChapterWithFiles.chapter_order) AS chapter_order,
    ChapterWithFiles.created AS created
  FROM NovelProfile
  JOIN (
    SELECT
      NovelChapterProfile.id AS chapter_profile_id,
      NovelChapterProfile.name AS chapter_profile_name,
      NovelChapterProfile.novel_profile_id AS novel_profile_id,
      NovelChapterProfile.\'order\' AS chapter_order,
      MAX(SearchedNovelChapter.created) AS created
    FROM NovelChapterProfile
    LEFT JOIN SearchedNovelChapter
    ON NovelChapterProfile.id = SearchedNovelChapter.chapter_profile_id
    GROUP BY NovelChapterProfile.id
    HAVING COUNT(SearchedNovelChapter.id) > 0
  ) ChapterWithFiles ON NovelProfile.id = ChapterWithFiles.novel_profile_id
  GROUP BY NovelProfile.id
) LatestChapter ON Novel.novel_profile_id = LatestChapter.novel_id
JOIN PlayHistory ON PlayHistory.novel_id = Novel.id
WHERE PlayHistory.updated < LatestChapter.created AND PlayHistory.member_id = ${member.id}
ORDER BY LatestChapter.created DESC
LIMIT 10
  `;
  res.status(200).json({
    code: 0,
    msg: "",
    data: {
      list: r,
      next_marker: null,
    },
  });
}
