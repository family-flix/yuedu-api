/**
 * 遍历更新中的小说，使用书源获取小说正文
 */
import dayjs from "dayjs";

import { Application } from "@/domains/application";
import { r_id } from "@/utils";
import { parse_name_of_chapter } from "@/utils/parse_name_of_chapter";

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
  //   async function get_novel_chapter(
  //     chapter_profile: { id: string; name: string; order: number; text_count: number; updated_at: string },
  //     novel: { id: string }
  //   ) {
  //     const { id, name, order, text_count, updated_at } = chapter_profile;
  //     const chapter_record = await store.prisma.novel_chapter.findFirst({
  //       where: {
  //         profile: {
  //           id,
  //         },
  //       },
  //     });
  //     if (chapter_record) {
  //       return chapter_record;
  //     }
  //     const created = await store.prisma.novel_chapter.create({
  //       data: {
  //         id: r_id(),
  //         name,
  //         order,
  //         text_count,
  //         updated_at,
  //         novel_id: novel.id,
  //         profile_id: id,
  //       },
  //     });
  //     return created;
  //   }
  const searched_novels = await store.prisma.searched_novel.findMany({
    include: {
      profile: {
        include: {
          novel_chapter_profiles: true,
        },
      },
      chapters: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
  for (let i = 0; i < searched_novels.length; i += 1) {
    const searched_novel = searched_novels[i];
    const { profile, chapters: searched_chapters } = searched_novel;
    const { novel_chapter_profiles: chapters } = profile;
    console.log(`处理搜索到的小说 '${searched_novel.name}' 章节`);

    for (let j = 0; j < searched_chapters.length; j += 1) {
      const searched_chapter = searched_chapters[j];
      const { id, name } = searched_chapter;
      console.log(`${j + 1}、`, name);
      const chapter_name = name.replace(/,/g, "，").replace(/:/g, "：").replace(/;/g, "；");
      const parsed = format_chapter_name(name);
      await (async () => {
        if (searched_chapter.chapter_profile_id) {
          return;
        }
        const matched = (() => {
          let a = chapters.find((chapter) => {
            return chapter.name === name;
          });
          if (a) {
            return a;
          }
          a = chapters.find((chapter) => {
            return chapter.name === chapter_name;
          });
          if (a) {
            return a;
          }
          a = chapters.find((chapter) => {
            return chapter.name.includes(parsed.name);
          });
          if (a) {
            return a;
          }
          a = chapters.find((chapter) => {
            return chapter.order === parsed.order;
          });
          return null;
        })();
        if (!matched) {
          console.log("没有匹配到章节详情");
          await store.prisma.searched_chapter.update({
            where: { id },
            data: {
              error: JSON.stringify({
                text: "没有匹配到章节详情",
                chapter_profile_name: parsed.name,
              }),
            },
          });
          return;
        }
        // const chapter = get_novel_chapter(matched);
        console.log("成功匹配到章节详情", matched.name, matched.id);
        await store.prisma.searched_chapter.update({
          where: { id },
          data: {
            //     chapter_id: chapter.id,
            chapter_profile_id: matched.id,
            error: null,
          },
        });
      })();
    }
  }
  console.log("Success");
}

function format_chapter_name(name: string) {
  const { episode, episode_name } = parse_name_of_chapter(name, ["episode", "episode_name"]);
  return {
    order: Number(episode.replace(/^E/, "")),
    name: episode_name,
  };
}

main();
