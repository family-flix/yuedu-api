import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";

import { FileType } from "@/constants";
import { List } from "@/domains/list";
import { Result, resultify, Unpacked } from "@/types";
import { sleep } from "@/utils";

import { ModelKeys, ModelParam, ModelQuery } from "./types";
import { DatabaseStore } from ".";

const defaultRandomAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** 返回一条随机作为记录 id 的 15 位字符串 */
export function r_id() {
  return random_string(15);
}
/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export function random_string(length: number) {
  return random_string_with_alphabet(length, defaultRandomAlphabet);
}
function random_string_with_alphabet(length: number, alphabet: string) {
  let b = new Array(length);
  let max = alphabet.length;
  for (let i = 0; i < b.length; i++) {
    let n = Math.floor(Math.random() * max);
    b[i] = alphabet[n];
  }
  return b.join("");
}

export async function walk_model_with_cursor<F extends (extra: { take: number }) => any>(options: {
  fn: F;
  page_size?: number;
  handler?: (data: Unpacked<ReturnType<F>>[number], index: number, finish: () => void) => any;
  batch_handler?: (list: Unpacked<ReturnType<F>>[number][], index: number) => any;
}) {
  const { fn, page_size = 20, handler, batch_handler } = options;
  let next_marker = "";
  let no_more = false;
  let index = 0;
  let need_break = false;
  // const count = await store.prisma.file.count({ where });
  do {
    const extra_args = {
      take: page_size + 1,
      ...(() => {
        const cursor: { id?: string } = {};
        if (next_marker) {
          cursor.id = next_marker;
          return {
            cursor,
          };
        }
        return {};
      })(),
    };
    const list = await fn(extra_args);
    no_more = list.length < page_size + 1;
    next_marker = "";
    if (list.length === page_size + 1) {
      const last_record = list[list.length - 1];
      next_marker = last_record.id;
    }
    const correct_list = list.slice(0, page_size);
    if (batch_handler) {
      await batch_handler(correct_list, index);
    }
    for (let i = 0; i < correct_list.length; i += 1) {
      const data = correct_list[i];
      if (handler) {
        await handler(data, index, () => {
          need_break = true;
          no_more = true;
        });
        if (need_break) {
          return;
        }
      }
      index += 1;
    }
  } while (no_more === false);
}
