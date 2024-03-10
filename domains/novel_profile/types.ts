/** 搜索到的小说信息 */
export type SearchedPartialNovelProfile = {
  unique_id: string;
  name: string;
  overview: string;
  cover_path: string | null;
  author: {
    name: string;
  };
  in_production: number;
  latest_chapter: {
    name: string;
    updated_at: string;
  };
};
export type SearchedNovelSectionProfile = {
  unique_id: string;
  /** 顺序 */
  order: number;
  name: string;
  /** 章节总数 */
  chapter_count: number;
};
export type SearchedNovelChapterProfile = {
  unique_id: string;
  /** 篇/部/卷，但不影响章节 order 的顺序，多个篇内的章节顺序是连贯的 */
  section: SearchedNovelSectionProfile;
  /** 章节名称 */
  name: string;
  /** 下标 */
  order: number;
  /** 总字数 */
  text_count: number;
  updated_at: string;
};
