/**
 * @file 特殊的集数
 */
import { describe, expect, test } from "vitest";

import { groupIntoSubArr } from "../index";

describe("特殊的集数", () => {
  test("4", () => {
    const result = groupIntoSubArr([1, 2, 3, 4], 4);
    expect(result).toStrictEqual([[1], [2], [3], [4]]);
  });
  test("5", () => {
    const result = groupIntoSubArr([1, 2, 3, 4, 5], 4);
    expect(result).toStrictEqual([[1, 5], [2], [3], [4]]);
  });
  test("3", () => {
    const result = groupIntoSubArr([1, 2, 3, 4, 5, 6, 7, 8], 4);
    expect(result).toStrictEqual([
      [1, 5],
      [2, 6],
      [3, 7],
      [4, 8],
    ]);
  });
  test("3", () => {
    const result = groupIntoSubArr([1, 2, 3, 4, 5, 6, 7], 4);
    expect(result).toStrictEqual([
      [1, 5],
      [2, 6],
      [3, 7],
      [4],
    ]);
  });
  test("3", () => {
    const result = groupIntoSubArr([1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
    expect(result).toStrictEqual([
      [1, 5, 9],
      [2, 6],
      [3, 7],
      [4, 8],
    ]);
  });
});
