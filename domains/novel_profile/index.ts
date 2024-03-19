/**
 * @file 获取小说详情信息
 */

import { NovelProfile } from "@/domains/novel/types";
import { DataStore, NovelProfileRecord } from "@/domains/store/types";
import { Result } from "@/types/index";

import { SearchedNovelChapterProfile, SearchedNovelSectionProfile } from "./types";
import { QidianClient } from "./qidian";

interface NovelProfileClientProps {
  store: DataStore;
}
export class NovelProfileClient {
  store: DataStore;
  client = new QidianClient();

  constructor(props: NovelProfileClientProps) {
    const { store } = props;

    this.store = store;
  }

  async get_author(unique_id: string, name: string) {
    const author = await this.store.prisma.author.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (author) {
      return author;
    }
    const created = await this.store.prisma.author.create({
      data: {
        id: unique_id,
        name,
      },
    });
    return created;
  }
  async get_novel_profile(values: { unique_id: string }) {
    const { unique_id } = values;
    const novel_profile = await this.store.prisma.novel_profile.findFirst({
      where: {
        id: unique_id,
      },
      include: {
        novel_chapter_profiles: {
          take: 1,
        },
      },
    });
    // console.log("novel_profile", novel_profile);
    if (novel_profile) {
      if (novel_profile.novel_chapter_profiles.length === 0) {
        this.fetch_chapters(novel_profile);
      }
      return Result.Ok(novel_profile);
    }
    const r = await this.client.fetch_profile(unique_id);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { name, overview, cover_path, in_production, chapter_count, author } = r.data;
    const author_record = await this.get_author(author.id, author.name);
    // console.log("before novel_profile.create", author_record);
    const created = await this.store.prisma.novel_profile.create({
      data: {
        id: unique_id,
        name,
        overview,
        cover_path,
        in_production,
        chapter_count,
        author_id: author_record.id,
      },
    });
    this.fetch_chapters(created);
    return Result.Ok(created);
  }
  /** 获取小说 篇 详情记录 */
  async get_novel_section_profile(values: SearchedNovelSectionProfile, novel_profile: { id: string }) {
    const { unique_id, name, order } = values;
    const section = await this.store.prisma.novel_section_profile.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (section) {
      return section;
    }
    const created = await this.store.prisma.novel_section_profile.create({
      data: {
        id: unique_id,
        name,
        order,
        novel_profile_id: novel_profile.id,
      },
    });
    return created;
  }
  async fetch_chapters(novel_profile: NovelProfileRecord) {
    const { id } = novel_profile;
    const r2 = await this.client.fetch_chapters(id);
    if (r2.error) {
      return Result.Err(r2.error.message);
    }
    for (let i = 0; i < r2.data.length; i += 1) {
      const chapter = r2.data[i];
      await this.get_chapter_profile_record(chapter, novel_profile);
    }
    return Result.Ok(null);
  }
  /** 获取章节详情 */
  async get_chapter_profile_record(chapter: SearchedNovelChapterProfile, novel_profile: { id: string }) {
    const { unique_id, name, order, text_count, updated_at, section } = chapter;
    const chapter_profile = await this.store.prisma.novel_chapter_profile.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (chapter_profile) {
      return chapter_profile;
    }
    const novel_section_profile = await this.get_novel_section_profile(section, novel_profile);
    const created = await this.store.prisma.novel_chapter_profile.create({
      data: {
        id: unique_id,
        name,
        order,
        text_count,
        updated_at,
        novel_profile_id: novel_profile.id,
        novel_section_profile_id: novel_section_profile.id,
      },
    });
    return created;
  }
}
