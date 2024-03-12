/**
 * @file 特殊的集数
 */
import { describe, expect, test } from "vitest";

import { parse_name_of_chapter } from "../parse_name_of_chapter";
import { match_chapter } from "../match_chapter";

describe("特殊的集数", () => {
  test("第三百一十章 巨大提升,实力飞", () => {
    const name = "第三百一十章 巨大提升,实力飞跃";
    const r = match_chapter({ id: "310", name }, [
      {
        id: "310",
        name: "第三百一十章 巨大提升，实力飞跃（状态极差，两更调整）",
        order: 310,
      },
    ]);
    expect(r.error).toBe(null);
    if (r.error) {
      return;
    }
    expect(r.data).toStrictEqual({
      id: "310",
      name: "第三百一十章 巨大提升，实力飞跃（状态极差，两更调整）",
      order: 310,
    });
  });
});
