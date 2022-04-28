import { expect, test } from "vitest";

import s from "../sources/qidian";
import { BookSource } from "../../src/index";

test("qidian search", async () => {
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
  expect(value[1]).toStrictEqual({
    title: "诡异道主",
    url: "//m.qidian.com/book/1033557974/0.html",
    author: "林野牧童",
    cover: "//bookcover.yuewen.com/qdbimg/349573/1033557974/150",
    intro:
      "一觉醒来，周恒发现自己穿越了。这里混乱，动荡，诡异妖邪并存，民不聊生。而周恒只是一个小捕快。穿越第一天就遇妖邪，饮恨西北。这应该是穿越者活的最短的一人了。给前辈们拖后退了。到了阴曹地府后，摆渡人看着周恒，面无表情说道。“来自异界的灵魂呀，生死簿上没有你的名字，哪来回哪去吧。”只见一股阴风袭来，周恒睁开眼睛，发现自己又复活了！",
  });
});

test("qidian fetch chapters", async () => {
  const source = new BookSource(s, null);
  const result = await source.chapters(
    "https://m.qidian.com/book/1012710206/0.html"
  );
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value.length).toBe(932);
  expect(value.slice(0, 2)).toStrictEqual([
    {
      title: "第一章 游戏载入中",
      url: "//m.qidian.com/book/1012710206/421067537.html",
    },
    {
      title: "第二章 支线任务",
      url: "//m.qidian.com/book/1012710206/421086103.html",
    },
  ]);
}, 10000);
