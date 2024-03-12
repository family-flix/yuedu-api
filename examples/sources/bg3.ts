// import { BookSourceCore } from "@/domains/yuedu";
import axios from "axios";

import { store } from "@/store/index";

import { Bg3Source } from "@/domains/novel_source/sources/bg3";
import { BrowserHelper } from "@/domains/browser";
import { r_id } from "@/utils";

async function main() {
  const novel_source = await store.prisma.novel_source.findFirst({
    where: {
      unique_id: "bg3",
    },
  });
  if (!novel_source) {
    return;
  }
  //   const r = await BrowserHelper.Launch();
  //   if (r.error) {
  //     return;
  //   }
  //   const browser = r.data;
  const source = new Bg3Source({ unique_id: "bg3" });
  const r = await source.fetch_content({
    id: "1",
    name: "",
    url: "https://cn.bg3.co/novel/pagea/congzhanyaochumokaishizhangshengbusi-luyueshijiu_1.html",
  });
  //   const r2 = await source.search("从斩妖除魔开始长生不死");
  //   // await source.destroy();
  //   if (r2.error) {
  //     console.log(r2.error.message);
  //     await source.finish();
  //     return;
  //   }
  //   const novel = r2.data;
  //   const r3 = await source.fetch_chapters(novel);
  //   if (r3.error) {
  //     console.log(r3.error.message);
  //     await source.finish();
  //     return;
  //   }
  //   const chapters = r3.data.chapters;
  //   if (chapters.length === 0) {
  //     console.log("该小说暂无章节");
  //     await source.finish();
  //     return;
  //   }
  //   console.log(`共 ${chapters.length} 章节`);
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
