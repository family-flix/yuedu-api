/**
 * @file 导出当前的小说内容(SearchedNovel、NovelProfile)
 */
import stream from "stream";
import { promisify } from "util";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";

import { app, store } from "@/store";
import { User } from "@/domains/user";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { r_id } from "@/utils";
import { walk_model_with_cursor } from "@/domains/store/utils";
import { writeFile } from "fs/promises";
import path from "path";

const pipeline = promisify(stream.pipeline);

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  //   const { authorization } = req.headers;
  //   const t_res = await User.New(authorization, store);
  //   if (t_res.error) {
  //     return e(t_res);
  //   }
  //   const user = t_res.data;
  const tables = {
    novel_source: [],
    author: [],
    novel_profile: [],
    novel_section_profile: [],
    novel_chapter_profile: [],
    searched_novel: [],
    searched_chapter: [],
  };
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.novel_source.findMany({
        ...extra,
      });
    },
    handler(data) {
      // @ts-ignore
      tables.novel_source.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.author.findMany({
        ...extra,
      });
    },
    handler(data) {
      // @ts-ignore
      tables.author.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.novel_profile.findMany({
        ...extra,
      });
    },
    handler(data, index, finish) {
      // @ts-ignore
      tables.novel_profile.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.novel_section_profile.findMany({
        ...extra,
      });
    },
    handler(data, index, finish) {
      // @ts-ignore
      tables.novel_section_profile.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.novel_chapter_profile.findMany({
        ...extra,
      });
    },
    handler(data, index, finish) {
      // @ts-ignore
      tables.novel_chapter_profile.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.searched_novel.findMany({
        ...extra,
      });
    },
    handler(data, index, finish) {
      // @ts-ignore
      tables.searched_novel.push(data);
    },
  });
  await walk_model_with_cursor({
    fn(extra) {
      return store.prisma.searched_chapter.findMany({
        ...extra,
      });
    },
    handler(data, index, finish) {
      // @ts-ignore
      tables.searched_chapter.push(data);
    },
  });
  const uid = dayjs().valueOf();
  const filename = `${uid}.json`;
  const filepath = path.resolve(app.assets, filename);
  await writeFile(filepath, JSON.stringify(tables));
  res.status(200).json({
    code: 0,
    msg: "",
    data: {
      filepath,
    },
  });
}
