/**
 * 遍历更新中的小说，使用书源获取小说正文
 * @deprecated
 */
import dayjs from "dayjs";

import { CollectionTypes, MediaTypes } from "@/constants";
import { Application } from "@/domains/application";
import { walk_model_with_cursor } from "@/domains/store/utils";
import { bytes_to_size, parseJSONStr, r_id } from "@/utils";
import { Bg3Source } from "@/domains/novel_source/sources/bg3";
import { BrowserHelper } from "@/domains/browser";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { MingZWSource } from "@/domains/novel_source/sources/mingzw";
import { parse_name_of_chapter } from "@/utils/parse_name_of_chapter";
import { DXMWXSource } from "@/domains/novel_source/sources/dxmwx";

async function main() {
  const OUTPUT_PATH = process.env.OUTPUT_PATH;
  //   const DATABASE_PATH = "file://$OUTPUT_PATH/data/family-flix.db?connection_limit=1";
  if (!OUTPUT_PATH) {
    console.error("缺少数据库文件路径");
    return;
  }
  const app = new Application({
    root_path: OUTPUT_PATH,
  });
  const store = app.store;
  console.log("Start");
  const novel_clients: Record<string, new (props: { unique_id: string }) => NovelSourceClient> = {
    // bg3: Bg3Source,
    mingzw: MingZWSource,
    dxmwx: DXMWXSource,
  };
  const novel_sources = await store.prisma.novel_source.findMany({});
  const novels = await store.prisma.novel_profile.findMany({});
  for (let i = 0; i < novels.length; i += 1) {
    const novel_profile = novels[i];
    const { name } = novel_profile;
    await (async () => {
      // if (name !== "从斩妖除魔开始长生不死") {
      //   return;
      // }
      for (let j = 0; j < novel_sources.length; j += 1) {
        const novel_source = novel_sources[j];
        await (async () => {
          const Client = novel_clients[novel_source.unique_id];
          if (!Client) {
            return;
          }
          const source = new Client({ unique_id: novel_source.unique_id });
          const r2 = await source.search(name);
          if (r2.error) {
            console.log(r2.error.message);
            return;
          }
          const searched_novel = r2.data;
          const searched_novel_record = await (async () => {
            const existing = await store.prisma.searched_novel.findFirst({
              where: {
                unique_id: searched_novel.id,
                source_id: novel_source.id,
              },
            });
            if (existing) {
              return existing;
            }
            const created = await store.prisma.searched_novel.create({
              data: {
                id: r_id(),
                unique_id: searched_novel.id,
                name: searched_novel.name,
                url: searched_novel.url,
                profile_id: novel_profile.id,
                source_id: novel_source.id,
              },
            });
            return created;
          })();
          // @todo 记录章节总数，下次 run 时比较总数，如果相同，直接忽略，避免了遍历几千条数据对比
          const r3 = await source.fetch_chapters(searched_novel);
          if (r3.error) {
            console.log(r3.error.message);
            return;
          }
          const chapters = r3.data.chapters;
          const chapter_count = await store.prisma.searched_chapter.count({
            where: { searched_novel_id: searched_novel.id },
          });
          if (chapter_count === chapters.length) {
            console.log(`'${name}' 没有新增章节`);
            return;
          }
          if (chapters.length === 0) {
            console.log(`'${name}' 暂无章节`);
            return;
          }
          console.log(`'${name}' 共 ${chapters.length} 章节`);
          await store.prisma.searched_novel.update({
            where: {
              id: searched_novel_record.id,
            },
            data: {
              chapter_count: chapters.length,
            },
          });
          for (let i = 0; i < chapters.length; i += 1) {
            const chapter = chapters[i];
            await (async () => {
              const existing = await store.prisma.searched_chapter.findFirst({
                where: {
                  unique_id: chapter.id,
                },
              });
              if (existing) {
                console.log(`'${name}' - ${chapter.name} 章节 已存在`, { id: chapter.id });
                // 已经存在就忽略，另外有地方主动刷新章节
                return;
              }
              const r4 = await source.fetch_content(chapter);
              if (r4.error) {
                console.log(r4.error.message);
                return;
              }
              const content = r4.data;
              const contents = content.join("\n");
              console.log(chapter.name, "成功获取到章节内容，内容总字数", contents.length);
              const { episode } = parse_name_of_chapter(chapter.name);
              const num = Number(episode.replace(/^E/, ""));
              await store.prisma.searched_chapter.create({
                data: {
                  id: r_id(),
                  unique_id: chapter.id,
                  name: chapter.name,
                  url: chapter.url,
                  order: episode ? num : i,
                  content_filepath: contents,
                  searched_novel_id: searched_novel_record.id,
                },
              });
            })();
          }
        })();
      }
    })();
  }
  // await browser.destroy();
  console.log("Success");
}

main();
