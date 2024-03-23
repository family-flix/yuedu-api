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
  test("第二百六十七章 接亲(下)", () => {
    const name = "第二百六十七章 接亲(下)";
    const r = match_chapter({ id: "310", name }, [
      {
        id: "310",
        name: "第二百六十六章 接亲（上）",
        order: 310,
      },
    ]);
    expect(r.data).toStrictEqual({
      chapter_profile_name: "接亲（下）",
    });
  });
  test("第48章 Alpha0.3版本上线新玩法解锁", () => {
    const name = "第48章 Alpha0.3版本上线新玩法解锁";
    const r = match_chapter({ id: "310", name }, [
      {
        id: "48",
        name: "第48章 Alpha0.3版本上线！新玩法解锁！",
        order: 48,
      },
    ]);
    expect(r.data).toStrictEqual({
      id: "48",
      name: "第48章 Alpha0.3版本上线！新玩法解锁！",
      order: 48,
    });
  });
  test("第65章 第65章 alpha0.4版本更新夜间系统上线", () => {
    const name = "第65章 ";
    const r = match_chapter({ id: "310", name }, [
      {
        id: "65",
        name: "第65章 alpha0.4版本更新！夜间系统上线！（3/4）",
        order: 65,
      },
    ]);
    expect(r.data).toStrictEqual({
      chapter_profile_name: "第48章 Alpha0.3版本上线！新玩法解锁！",
    });
  });
});
