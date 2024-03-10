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
  const searched_novels = await store.prisma.searched_novel.findMany({
    include: {
      profile: {
        include: {
          novel_chapter_profiles: true,
        },
      },
      chapters: true,
    },
  });
  for (let i = 0; i < searched_novels.length; i += 1) {
    const searched_novel = searched_novels[i];
    const { profile, chapters: searched_chapters } = searched_novel;
    const { novel_chapter_profiles: chapters } = profile;
    console.log(`处理搜索到的小说 '${searched_novel.name}' 章节`);

    for (let j = 0; j < searched_chapters.length; j += 1) {
      const searched_chapter = searched_chapters[j];
      const { id, unique_id, name } = searched_chapter;
      console.log(`${j + 1}、`, name);
      await (async () => {
        if (unique_id.includes("/")) {
          return;
        }
        const expected_unique_id = [searched_novel.unique_id, unique_id].join("/");
        // const chapter = get_novel_chapter(matched);
        await store.prisma.searched_chapter.update({
          where: { id },
          data: {
            unique_id: expected_unique_id,
          },
        });
      })();
    }
  }
  console.log("Success");
}

main();
