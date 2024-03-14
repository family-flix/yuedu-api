/**
 * 遍历更新中的小说，使用书源获取小说正文
 */
import { Application } from "@/domains/application";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { MingZWSource } from "@/domains/novel_source/sources/mingzw";
import { QidianClient } from "@/domains/novel_profile/qidian";
import { SearchedNovelSectionProfile } from "@/domains/novel_profile/types";

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
  //   const novel_profiles = await store.prisma.novel_profile.findMany({});
  // const r = await BrowserHelper.Launch();
  // if (r.error) {
  //   console.log(r.error.message);
  //   return;
  // }
  // const browser = r.data;
  const novels = await store.prisma.novel_profile.findMany({
    where: {
      in_production: 1,
    },
  });
  const client = new QidianClient();

  for (let j = 0; j < novels.length; j += 1) {
    const novel = novels[j];
    await (async () => {
      const r1 = await client.fetch_profile(novel.id);
      if (r1.error) {
        console.log([novel.name], "fetch profile failed,", r1.error.message);
        return;
      }
      const { chapter_count } = r1.data;
      if (chapter_count === novel.chapter_count) {
        console.log([novel.name], "章节数相同，跳过");
        return;
      }
      const r2 = await client.fetch_chapters(novel.id);
      if (r2.error) {
        console.log([novel.name], "fetch chapters failed,", r2.error.message);
        return;
      }
      const chapters = r2.data;
      for (let i = 0; i < chapters.length; i += 1) {
        const chapter = chapters[i];
        const e = await store.prisma.novel_chapter_profile.findFirst({
          where: {
            id: chapter.unique_id,
          },
        });
        if (!e) {
          const novel_section_profile = await get_novel_section_profile(chapter.section, novel);
          await store.prisma.novel_chapter_profile.create({
            data: {
              id: chapter.unique_id,
              name: chapter.name,
              order: chapter.order,
              text_count: chapter.text_count,
              updated_at: novel.updated.toISOString(),
              novel_section_profile_id: novel_section_profile.id,
              novel_profile_id: novel.id,
            },
          });
        }
      }
    })();
  }
  // await browser.destroy();
  console.log("Success");
}

main();
