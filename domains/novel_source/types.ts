/**
 * @file 书源请求库
 */
import { FileType, MediaResolutionTypes } from "@/constants";
import { DataStore } from "@/domains/store/types";
import { Result } from "@/types";

export type SearchedNovel = {
  id: string;
  name: string;
  url: string;
};
export type SearchedNovelChapter = {
  id: string;
  name: string;
  url: string;
};

export abstract class NovelSourceClient {
  constructor(protected unique_id: string, protected token: string) {}

  /** 测试 token 是否有效 */
  //   ping(): Promise<Result<unknown>>;
  /** 搜索小说 */
  abstract search(keyword: string): Promise<Result<SearchedNovel>>;
  /** 获取章节列表 */
  abstract fetch_chapters(novel: { id: string }): Promise<Result<{ chapters: SearchedNovelChapter[] }>>;
  /** 获取章节正文 */
  abstract fetch_content(chapter: { url: string }): Promise<Result<string[]>>;
}

/**
 * 所有云盘的文件结构，统一转换成该结构
 */
export type GenreDriveFile = {
  file_id: string;
  name: string;
  parent_file_id: string;
  type: string;
  md5: string | null;
  size: number;
  content_hash: string | null;
  mime_type: string | null;
  thumbnail: string | null;
  // items?: PartialAliyunDriveFile[];
};
