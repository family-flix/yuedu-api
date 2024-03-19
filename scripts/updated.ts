import { Application } from "@/domains/application";
import { ScheduleTask } from "@/domains/schedule";
/**
 * 获取小说列表，包含了该小说搜索到的最新章节
 * 其实是获取最新的 chapter_profile，过滤出包含了 searched_chapter 的记录，就变成了「搜索到的最新章节」
 * SELECT m2.id AS novel_profile_id, m2.name AS name, m3.name AS chapter_name, MAX(m3.created) AS chapter_created
FROM NovelProfile m2
JOIN (
  SELECT mm3.*
  FROM NovelChapterProfile mm3
  LEFT JOIN SearchedNovelChapter f
  ON mm3.id = f.chapter_profile_id
  GROUP BY mm3.id
  HAVING COUNT(f.id) > 0
) m3 ON m2.id = m3.novel_profile_id
GROUP BY m2.id;
 * 
 * 
 * 
 * 
 * 
 * 

 */

(async () => {
  const OUTPUT_PATH = process.env.OUTPUT_PATH;
  if (!OUTPUT_PATH) {
    console.error("缺少数据库文件路径");
    return;
  }
  const app = new Application({
    root_path: OUTPUT_PATH,
  });
  const store = app.store;
  const page_size = 20;
  const next_marker = "";
  const r = await store.prisma.$queryRaw`
SELECT DISTINCT novel.*, m1.updated AS updated, nc.name AS cur_chapter_name
FROM PlayHistory m1
JOIN (
  SELECT
    n.id AS novel_id,
    novel_with_latest_chapter.*
  FROM Novel n
  JOIN (
    SELECT
      m2.id AS novel_profile_id,
      m2.name AS novel_profile_name,
      m2.cover_path AS novel_profile_cover_path,
      m3.chapter_profile_id AS chapter_profile_id,
      m3.chapter_profile_name AS chapter_profile_name,
      na.id AS author_id,
      na.name AS author_name,
      MAX(m3.chapter_order) AS chapter_order,
      m3.created AS chapter_created
    FROM NovelProfile m2
    JOIN NovelAuthor na ON m2.author_id = na.id
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
  ) novel_with_latest_chapter ON n.novel_profile_id = novel_with_latest_chapter.novel_profile_id
) novel ON m1.novel_id = novel.novel_id
JOIN NovelChapterProfile nc ON m1.novel_chapter_id = nc.id
ORDER BY m1.updated DESC
LIMIT ${page_size} OFFSET ${next_marker}
`;
  // 后面 WHERE m1.updated < novel.chapter_created 筛选出最近有更新的
  // ORDER BY novel.chapter_created DESC

  const r2 = await store.prisma.$queryRaw`
SELECT novel.*, m1.updated AS updated, nc.name AS cur_chapter_name
FROM PlayHistory m1
JOIN (
  SELECT
    n.id AS novel_id,
    novel_with_latest_chapter.*
  FROM Novel n
  JOIN (
    SELECT
      m2.id AS novel_profile_id,
      m2.name AS novel_profile_name,
      m2.cover_path AS novel_profile_cover_path,
      m3.chapter_profile_id AS chapter_profile_id,
      m3.chapter_profile_name AS chapter_profile_name,
      na.id AS author_id,
      na.name AS author_name,
      MAX(m3.chapter_order) AS chapter_order,
      m3.created AS chapter_created
    FROM NovelProfile m2
    JOIN NovelAuthor na ON m2.author_id = na.id
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
  ) novel_with_latest_chapter ON n.novel_profile_id = novel_with_latest_chapter.novel_profile_id
) novel ON m1.novel_id = novel.novel_id
JOIN NovelChapterProfile nc ON m1.novel_chapter_id = nc.id
ORDER BY m1.updated DESC
LIMIT ${page_size} OFFSET ${next_marker}
`;

  const r3 = await store.prisma.$queryRaw`
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
`;
  console.log("Completed");
})();
