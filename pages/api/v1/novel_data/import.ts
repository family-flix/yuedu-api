/**
 * @file 导出当前的小说内容(SearchedNovel、NovelProfile)
 */
import stream from "stream";
import { promisify } from "util";
import path from "path";
import fs from "fs";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { File, IncomingForm } from "formidable";
import dayjs from "dayjs";

import { app, store } from "@/store";
import { User } from "@/domains/user";
import { walk_model_with_cursor } from "@/domains/store/utils";
import { BaseApiResp, Result } from "@/types";
import { response_error_factory } from "@/utils/server";
import { parseJSONStr, r_id } from "@/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<BaseApiResp<unknown>>) {
  const e = response_error_factory(res);
  const { authorization } = req.headers;
  const t_res = await User.New(authorization, store);
  if (t_res.error) {
    return e(t_res);
  }
  const user = t_res.data;
  const files = (await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      // @ts-ignore
      resolve(files.file);
    });
  })) as File[];
  const file = files[0];
  if (!file) {
    return e(Result.Err("缺少 json 文件"));
  }
  const { filepath, originalFilename: filename, newFilename: tmp_filename } = file;
  // const file_buffer = fs.readFileSync(filepath);
  const content = fs.readFileSync(filepath, "utf-8");
  const r = parseJSONStr<Record<string, any[]>>(content);
  if (r.error) {
    return e(Result.Err(r.error.message));
  }
  const payload = r.data;
  fs.unlinkSync(filepath);
  const tables = {
    novel_source: [],
    author: [],
    novel_profile: [],
    novel_section_profile: [],
    novel_chapter_profile: [],
    searched_novel: [],
    searched_chapter: [],
  };
  const keys = Object.keys(payload);
  for (let i = 0; i < keys.length; i += 1) {
    const table_name = keys[i];
    const records = payload[table_name];
    for (let j = 0; j < records.length; j += 1) {
      const record = records[j];
      const { user_id, ...rest } = record;
      await (async () => {
        if (table_name === "novel_source") {
          const e = await store.prisma.novel_source.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.novel_source.create({
            data: {
              ...rest,
              user_id: user.id,
            },
          });
          return;
        }
        if (table_name === "author") {
          const e = await store.prisma.author.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.author.create({
            data: record,
          });
          return;
        }
        if (table_name === "novel_profile") {
          const e = await store.prisma.novel_profile.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.novel_profile.create({
            data: {
              ...record,
            },
          });
          return;
        }
        if (table_name === "novel_section_profile") {
          const e = await store.prisma.novel_section_profile.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.novel_section_profile.create({
            data: {
              ...record,
            },
          });
          return;
        }
        if (table_name === "novel_chapter_profile") {
          const e = await store.prisma.novel_chapter_profile.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.novel_chapter_profile.create({
            data: {
              ...record,
            },
          });
          return;
        }
        if (table_name === "searched_novel") {
          const e = await store.prisma.searched_novel.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.searched_novel.create({
            data: {
              ...rest,
              user_id: user.id,
            },
          });
          return;
        }
        if (table_name === "searched_chapter") {
          const e = await store.prisma.searched_chapter.findFirst({
            where: {
              id: record.id,
            },
          });
          if (e) {
            return;
          }
          await store.prisma.searched_chapter.create({
            data: {
              ...rest,
              user_id: user.id,
            },
          });
          return;
        }
      })();
    }
  }
  res.status(200).json({
    code: 0,
    msg: "",
    data: {
      filepath,
    },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
