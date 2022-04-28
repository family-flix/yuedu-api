import { expect, test } from "vitest";

import s from "../sources/b5200";
import { BookSource } from "../../src/index";

test("b5200 search", async () => {
  const source = new BookSource(s, null);
  const result = await source.search("道诡异仙");
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value[0]).toStrictEqual({
    title: "道诡异仙",
    url: "//m.qidian.com/book/1031794030/0.html",
    author: "狐尾的笔",
    cover: "//bookcover.yuewen.com/qdbimg/349573/1031794030/150",
    intro:
      "诡异的天道，异常的仙佛，是真？是假？陷入迷惘的李火旺无法分辨。可让他无法分辨的不仅仅只是这些。还有他自己，他病了，病的很重。",
  });
}, 10000);

// test("qidian fetch chapters", async () => {
//   const source = new BookSource(qidian, null);
//   const result = await source.chapters(
//     "https://m.qidian.com/book/1012710206/0.html"
//   );
//   source.destroy();

//   expect(result.length).toBe(932);
//   expect(result.slice(0, 2)).toStrictEqual([
//     {
//       title: "第一章 游戏载入中",
//       url: "//m.qidian.com/book/1012710206/421067537.html",
//     },
//     {
//       title: "第二章 支线任务",
//       url: "//m.qidian.com/book/1012710206/421086103.html",
//     },
//   ]);
// });
