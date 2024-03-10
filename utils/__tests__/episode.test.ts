/**
 * @file 特殊的集数
 */
import { describe, expect, test } from "vitest";

import { parse_name_of_chapter } from "../parse_name_of_chapter";

describe("特殊的集数", () => {
  test("第001章 神", () => {
    const name = "第001章 神";
    const result = parse_name_of_chapter(name);
    expect(result).toStrictEqual({
      episode: "E01",
      episode_name: "神",
    });
  });
  test("第57章 河神", () => {
    const name = "第57章 河神";
    const result = parse_name_of_chapter(name);
    expect(result).toStrictEqual({
      episode: "E57",
      episode_name: "河神",
    });
  });
  test("第177章 赤鬃白玉兔", () => {
    const name = "第177章 赤鬃白玉兔";
    const result = parse_name_of_chapter(name);
    expect(result).toStrictEqual({
      episode: "E177",
      episode_name: "赤鬃白玉兔",
    });
  });
});
