/**
 * @file 将小说添加到书架
 */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { store } from "@/store";
import { Member } from "@/domains/user/member";
import { QidianClient } from "@/domains/novel_profile/qidian";
import {
  SearchedNovelChapterProfile,
  SearchedPartialNovelProfile,
  SearchedNovelSectionProfile,
} from "@/domains/novel_profile/types";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { r_id } from "@/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const t_res = await Member.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const member = t_res.data;
  const { unique_id, name, overview, cover_path, in_production } = req.body as Partial<SearchedPartialNovelProfile>;
  if (!unique_id) {
    return e(Result.Err("缺少 unique_id 参数"));
  }
  if (!name) {
    return e(Result.Err("缺少 name 参数"));
  }
  if (!overview) {
    return e(Result.Err("缺少 overview 参数"));
  }
  if (!cover_path) {
    return e(Result.Err("缺少 overview 参数"));
  }
  async function get_author(unique_id: string, name: string) {
    const author = await store.prisma.author.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (author) {
      return author;
    }
    const created = await store.prisma.author.create({
      data: {
        id: unique_id,
        name,
      },
    });
    return created;
  }
  async function get_novel_section_profile(values: SearchedNovelSectionProfile, novel_profile: { id: string }) {
    const { unique_id, name, order } = values;
    const section = await store.prisma.novel_section_profile.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (section) {
      return section;
    }
    const created = await store.prisma.novel_section_profile.create({
      data: {
        id: unique_id,
        name,
        order,
        novel_profile_id: novel_profile.id,
      },
    });
    return created;
  }
  async function get_chapter_profile(chapter: SearchedNovelChapterProfile, novel_profile: { id: string }) {
    const { unique_id, name, order, text_count, updated_at, section } = chapter;
    const chapter_profile = await store.prisma.novel_chapter_profile.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (chapter_profile) {
      return chapter_profile;
    }
    const novel_section_profile = await get_novel_section_profile(section, novel_profile);
    const created = await store.prisma.novel_chapter_profile.create({
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
  async function get_novel_profile(values: { unique_id: string }) {
    const { unique_id } = values;
    const client = new QidianClient();
    const novel_profile = await store.prisma.novel_profile.findFirst({
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
        const r2 = await client.fetch_chapters(unique_id);
        if (r2.error) {
          return Result.Err(r2.error.message);
        }
        for (let i = 0; i < r2.data.length; i += 1) {
          const chapter = r2.data[i];
          await get_chapter_profile(chapter, novel_profile);
        }
      }
      return Result.Ok(novel_profile);
    }
    const r = await client.fetch_profile(unique_id);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { name, overview, cover_path, in_production, chapter_count, author } = r.data;
    const author_record = await get_author(author.id, author.name);
    console.log("before novel_profile.create", author_record);
    const created = await store.prisma.novel_profile.create({
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
    const r2 = await client.fetch_chapters(unique_id);
    if (r2.error) {
      return Result.Err(r2.error.message);
    }
    for (let i = 0; i < r2.data.length; i += 1) {
      const chapter = r2.data[i];
      await get_chapter_profile(chapter, created);
    }
    return Result.Ok(created);
  }
  console.log("before get_novel_profile", unique_id);
  const r1 = await get_novel_profile({ unique_id });
  if (r1.error) {
    return e(Result.Err(r1.error.message));
  }
  const profile = r1.data;
  async function get_novel(novel_profile: { id: string; name: string }) {
    const existing = await store.prisma.novel.findFirst({
      where: {
        novel_profile_id: novel_profile.id,
        user_id: member.user.id,
      },
    });
    if (existing) {
      return existing;
    }
    const created = await store.prisma.novel.create({
      data: {
        id: r_id(),
        name: novel_profile.name,
        novel_profile_id: novel_profile.id,
        user_id: member.user.id,
      },
    });
    return created;
  }
  const novel = await get_novel(profile);
  res.status(200).json({ code: 0, msg: "", data: null });
}
