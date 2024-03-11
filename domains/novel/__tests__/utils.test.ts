import { describe, expect, test } from "vitest";

import { get_chapter_ranges } from "../utils";

describe("获取剧集范围", () => {
  test("2", () => {
    const range = get_chapter_ranges(2);
    expect(range).toStrictEqual([1, 52]);
  });
  test("13", () => {
    const range = get_chapter_ranges(13);
    expect(range).toStrictEqual([1, 63]);
  });
  test("39", () => {
    const range = get_chapter_ranges(39);
    expect(range).toStrictEqual([1, 89]);
  });
  test("40", () => {
    const range = get_chapter_ranges(40);
    expect(range).toStrictEqual([1, 90]);
  });
  test("41", () => {
    const range = get_chapter_ranges(41);
    expect(range).toStrictEqual([1, 91]);
  });
  test("60", () => {
    const range = get_chapter_ranges(60);
    expect(range).toStrictEqual([10, 110]);
  });
  test("101", () => {
    const range = get_chapter_ranges(101);
    expect(range).toStrictEqual([51, 151]);
  });
  test("1093", () => {
    const range = get_chapter_ranges(1093);
    expect(range).toStrictEqual([1043, 1143]);
  });
  test("2", () => {
    const range = get_chapter_ranges(2, { max: 10 });
    expect(range).toStrictEqual([1, 10]);
  });
  test("13", () => {
    const range = get_chapter_ranges(13, { max: 10 });
    expect(range).toStrictEqual([1, 10]);
  });
  test("39", () => {
    const range = get_chapter_ranges(39, { max: 80 });
    expect(range).toStrictEqual([1, 80]);
  });
  test("40", () => {
    const range = get_chapter_ranges(40, { max: 100 });
    expect(range).toStrictEqual([1, 90]);
  });
  test("41", () => {
    const range = get_chapter_ranges(41, { max: 100 });
    expect(range).toStrictEqual([1, 91]);
  });
  test("60", () => {
    const range = get_chapter_ranges(60, { max: 100 });
    expect(range).toStrictEqual([10, 100]);
  });
  test("101", () => {
    const range = get_chapter_ranges(101, { max: 100 });
    expect(range).toStrictEqual([51, 100]);
  });
  test("1093", () => {
    const range = get_chapter_ranges(1093, { max: 1200 });
    expect(range).toStrictEqual([1043, 1143]);
  });
});
