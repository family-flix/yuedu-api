import { Result } from "@/types";
import { NovelChapter } from "./types";

export function get_chapter_ranges(order: number, options: Partial<{ max: number; step: number }> = {}) {
  const { max, step = 50 } = options;
  const start = Math.max(1, order - step);
  let end = order + step;
  if (max) {
    if (end > max) {
      end = max;
    }
  }
  return [start, end];
}

export function split_count_into_ranges(num: number, count: number): [number, number][] {
  if (count <= 0) {
    return [];
  }
  const ranges: [number, number][] = [];
  let start = 1;
  let end = 1;
  while (start <= count) {
    end = Math.min(start + num - 1, count);
    ranges.push([start, end]);
    start = end + 1;
  }
  if (ranges.length === 0) {
    return [];
  }
  const last_range = ranges[ranges.length - 1];
  const diff = last_range[1] - last_range[0] + 1;
  if (ranges.length > 1 && diff < 5) {
    const last_second_range = ranges[ranges.length - 2];
    return [...ranges.slice(0, ranges.length - 2), [last_second_range[0], last_second_range[1] + diff]];
  }
  return ranges;
}

export function fix_episode_group_by_missing_episodes(values: {
  missing_episodes: number[];
  groups: [number, number][];
}) {
  const { groups, missing_episodes } = values;
  const updated_groups: [number?, number?][] = [];
  if (missing_episodes.length === 0) {
    return groups;
  }
  for (let i = 0; i < groups.length; i += 1) {
    let [start, end] = groups[i];
    const range: number[] = [];
    for (let i = start; i < end + 1; i += 1) {
      if (!missing_episodes.includes(i)) {
        range.push(i);
      }
    }
    if (range.length === 0) {
      updated_groups.push([]);
      continue;
    }
    updated_groups.push([range[0], range[range.length - 1]]);
  }
  return updated_groups;
}

export function find_missing_episodes(values: { count: number; episode_orders: number[] }) {
  const { count, episode_orders } = values;
  const missing_episodes: number[] = [];
  for (let i = 1; i <= count; i++) {
    if (!episode_orders.includes(i)) {
      missing_episodes.push(i);
    }
  }
  return missing_episodes;
}

export function fix_missing_episodes(values: { missing_episodes: number[]; episodes: NovelChapter[] }) {
  const { missing_episodes, episodes } = values;
  const missing = [...missing_episodes];
  const sources = [...episodes];
  const part = sources.reduce((acc, cur) => {
    const missing_episode_order = missing[0];
    if (missing_episode_order && missing_episode_order === cur.order - 1) {
      acc.push({
        id: "",
        name: "",
        order: missing_episode_order,
        files: [],
      });
      missing.shift();
    }
    acc.push(cur);
    return acc;
  }, [] as NovelChapter[]);
  let missing_episode_order = missing.shift();
  while (missing_episode_order) {
    part.push({
      id: "",
      name: "",
      order: missing_episode_order,
      files: [],
    });
    missing_episode_order = missing.shift();
  }
  return part;
}
