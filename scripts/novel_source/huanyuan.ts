import { HuanyuanSource } from "@/domains/novel_source/sources/huanyuan";

async function main() {
  const source = new HuanyuanSource({ unique_id: "huanyuan" });
  const r2 = await source.search("我的属性修行人生");
  if (r2.error) {
    console.log(r2.error.message);
    await source.finish();
    return;
  }
  const novel = r2.data;
  console.log(novel);
  //   const r3 = await source.fetch_chapters(novel);
  //   if (r3.error) {
  //     console.log(r3.error.message);
  //     await source.finish();
  //     return;
  //   }
  //   const chapters = r3.data.chapters.reverse();
  //   if (chapters.length === 0) {
  //     console.log("该小说暂无章节");
  //     await source.finish();
  //     return;
  //   }
  //   console.log(`共 ${chapters.length} 章节`);
  // console.log(chapters[0]);
  // const r4 = await source.fetch_content(chapters[0]);
  // if (r4.error) {
  //   console.log(r4.error.message);
  //   return;
  // }
  // const content = r4.data;
  // console.log(content);
  //   for (let i = 0; i < chapters.length; i += 1) {
  //     await (async () => {
  //       const chapter = chapters[i];
  //       const r4 = await source.fetch_content(chapter);
  //       if (r4.error) {
  //         console.log(r4.error.message);
  //         return;
  //       }
  //       const content = r4.data;
  //       console.log(chapter.name, "成功获取到章节内容，内容总字数", content.length);
  //     })();
  //   }
  //   await source.finish();
}

main();
