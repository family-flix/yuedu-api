// import { BookSourceCore } from "@/domains/yuedu";
import axios from "axios";

import { store } from "@/store/index";

import { MingZWSource } from "@/domains/novel_source/sources/mingzw";

async function main() {
  const source = new MingZWSource({ unique_id: "mingzw" });
  const r2 = await source.search("从斩妖除魔开始长生不死");
  // await source.destroy();
  if (r2.error) {
    console.log(r2.error.message);
    await source.finish();
    return;
  }
  const novel = r2.data;
  const r3 = await source.fetch_chapters(novel);
  if (r3.error) {
    console.log(r3.error.message);
    await source.finish();
    return;
  }
  const chapters = r3.data.chapters;
  if (chapters.length === 0) {
    console.log("该小说暂无章节");
    await source.finish();
    return;
  }
  console.log(`共 ${chapters.length} 章节`);
  console.log(chapters[0]);

  // const r4 = await source.fetch_content(chapters[0]);
  // if (r4.error) {
  //   console.log(r4.error.message);
  //   return;
  // }
  // const content = r4.data;
  // console.log(content);
  for (let i = 0; i < chapters.length; i += 1) {
    await (async () => {
      const chapter = chapters[i];
      const r4 = await source.fetch_content(chapter);
      if (r4.error) {
        console.log(r4.error.message);
        return;
      }
      const content = r4.data;
      console.log(chapter.name, "成功获取到章节内容，内容总字数", content.length);
      console.log(content);
    })();
  }
  await source.finish();
}

main();
