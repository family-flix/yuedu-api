import { expect, test } from "vitest";

import s from "../sources/qidian";
import { BookSource } from "../../src/index";

test("qidian search", async () => {
  const source = new BookSource(s, null);
  const result = await source.search("生活系游戏");
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value[0]).toStrictEqual({
    id: "1012710206",
    title: "生活系游戏",
    author: "吨吨吨吨吨",
    cover: "//bookcover.yuewen.com/qdbimg/349573/1012710206/150",
    intro:
      "【一份卖相不好的宫保鸡丁】从江枫无意中发现自己居然可以看到自家老爹炒出来的菜的备注开始，他的人生就已经发生了翻天覆地的变化……1.本游戏自由度极高，请玩家自行探索.2.本游戏不会干预玩家的任何选择，请玩家努力解锁成就.3.一切解释归游戏所有.普群一群：781556033V群：720368320（全订即可）",
    url: "//m.qidian.com/book/1012710206/0.html",
  });
});

test("qidian fetch chapters", async () => {
  const source = new BookSource(s, null);
  const result = await source.chapters("1012710206");
  source.destroy();

  expect(result.Err()).toBe(null);
  const value = result.Ok();
  expect(value.length).toBe(932);
  expect(value.slice(0, 2)).toStrictEqual([
    {
      id: "421067537",
      title: "第一章 游戏载入中",
      url: "//m.qidian.com/book/1012710206/421067537.html",
    },
    {
      id: "421086103",
      title: "第二章 支线任务",
      url: "//m.qidian.com/book/1012710206/421086103.html",
    },
  ]);
}, 10000);
