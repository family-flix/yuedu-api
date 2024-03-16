import { Result } from "@/types/index";

import { parse_name_of_chapter } from "./parse_name_of_chapter";

export function match_chapter<T extends { id: string; name: string; order: number }>(
  chapter: { id: string; name: string },
  chapters: T[]
): Result<T> {
  const { name } = chapter;
  function log(...args: unknown[]) {
    if (!name.includes("接亲")) {
      return;
    }
    // console.log(...args);
  }
  const chapter_name = name
    .replace(/,/g, "，")
    .replace(/:/g, "：")
    .replace(/;/g, "；")
    .replace(/\(/, "（")
    .replace(/\)/, "）");
  const parsed = format_chapter_name(name);
  const processed_chapters = chapters.map((c) => {
    return {
      ...c,
      name: c.name.replace(/,/g, "，").replace(/:/g, "：").replace(/;/g, "；").replace(/\(/, "（").replace(/\)/, "）"),
    };
  });
  const matched = (() => {
    let a = processed_chapters.find((chapter) => {
      return chapter.name === name;
    });
    log("1", a);
    if (a) {
      return a;
    }
    a = processed_chapters.find((chapter) => {
      return chapter.name === chapter_name;
    });
    log("2", a);
    if (a) {
      return a;
    }
    a = processed_chapters.find((chapter) => {
      return chapter.name.includes(parsed.name);
    });
    log("3", a);
    if (a) {
      return a;
    }
    a = processed_chapters.find((chapter) => {
      return chapter.name.includes(chapter_name);
    });
    log("4", a);
    if (a) {
      return a;
    }
    // 只能靠名字匹配，order 完全是乱的，包括从文件名解析得到的 第n章。
    // 因为小说可以分多个篇，每个篇开始，章节数又从 1 开始
    // a = chapters.find((chapter) => {
    //   return chapter.order === parsed.order;
    // });
    // if (a) {
    //   return a;
    // }
    return null;
  })();
  if (!matched) {
    log("没有匹配到章节详情");
    return Result.Err("没有匹配到章节详情", 2001, {
      chapter_profile_name: parsed.name,
    });
  }
  // const chapter = get_novel_chapter(matched);
  return Result.Ok(matched);
}

function format_chapter_name(name: string) {
  const { episode, episode_name } = parse_name_of_chapter(name, ["episode", "episode_name"]);
  return {
    order: Number(episode.replace(/^E/, "")),
    name: episode_name,
  };
}
