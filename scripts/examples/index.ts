// import { BookSourceCore } from "@/domains/yuedu";
import axios from "axios";

import { store } from "@/store/index";

import { QidianClient } from "@/domains/novel_profile/qidian";
import { Bg3Source } from "../../domains/novel_source/sources/bg3";
import { r_id } from "@/utils";
import { BrowserHelper } from "@/domains/browser";

// async function main() {
//   const novel_source = await store.prisma.novel_source.findFirst({
//     where: {
//       unique_id: "bg3",
//     },
//   });
//   if (!novel_source) {
//     return;
//   }
//   const r = await BrowserHelper.Launch();
//   if (r.error) {
//     return;
//   }
//   const browser = r.data;
//   const source = new Bg3Source({ unique_id: "bg3", browser });
//   const r2 = await source.search("从斩妖除魔开始长生不死");
//   // await source.destroy();
//   if (r2.error) {
//     console.log(r2.error.message);
//     await source.finish();
//     return;
//   }
//   const novel = r2.data;

//   const searched_novel = await (async () => {
//     const existing = await store.prisma.searched_novel.findFirst({
//       where: {
//         unique_id: novel.id,
//       },
//     });
//     if (existing) {
//       return existing;
//     }
//     const created = await store.prisma.searched_novel.create({
//       data: {
//         id: r_id(),
//         unique_id: novel.id,
//         name: novel.name,
//         url: novel.url,
//         profile_id: "",
//         source_id: novel_source.id,
//       },
//     });
//     return created;
//   })();
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
//       // await store.prisma.searched_chapter
//       const searched_chapter = await (async () => {
//         const existing = await store.prisma.searched_chapter.findFirst({
//           where: {
//             unique_id: chapter.id,
//           },
//         });
//         if (existing) {
//           // 已经存在就忽略，另外有地方主动刷新章节
//           return;
//         }
//         // if (existing) {
//         //   await store.prisma.searched_chapter.update({
//         //     where: {
//         //       id: existing.id,
//         //     },
//         //     data: {
//         //       content: content.join("\n"),
//         //     },
//         //   });
//         //   return existing;
//         // }
//         await store.prisma.searched_chapter.create({
//           data: {
//             id: r_id(),
//             unique_id: chapter.id,
//             name: chapter.name,
//             url: chapter.url,
//             order: i,
//             content: content.join("\n"),
//             searched_novel_id: searched_novel.id,
//           },
//         });
//       })();
//       // console.log(content.join("\n"));
//     })();
//   }
//   await source.finish();
// }

// main();

async function main2() {
  const url = "https://cn.bg3.co/novel/pagea/xiangzilidedaming-sanshierbian_778.html";
  const proxy = "https://proxy.f1x.fun/api/proxy/?u=";
  const r = await axios.get([proxy, url].join(""));
}
