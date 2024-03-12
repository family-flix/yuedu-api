import { video_file_type_regexp, remove_str, chinese_num_to_num, padding_zero, season_to_num } from "./index";
import { get_first_letter } from "./pinyin";

export const VIDEO_KEY_NAME_MAP = {
  name: "中文名称",
  original_name: "译名or外文原名",
  season: "季",
  episode: "集",
  episode_count: "总集数",
  episode_name: "集名称",
  extra1: "额外信息1",
  extra2: "额外信息2",
  extra3: "额外信息3",
};

export type VideoKeys = keyof typeof VIDEO_KEY_NAME_MAP;
export const VIDEO_ALL_KEYS = Object.keys(VIDEO_KEY_NAME_MAP) as VideoKeys[];
export type ParsedVideoInfo = Record<VideoKeys, string>;
/**
 * 从一个文件名中解析出影视剧信息
 * @param filename
 * @param keys
 * @returns
 */
export function parse_name_of_chapter(
  filename: string,
  keys: VideoKeys[] = ["episode", "episode_name"],
  extra_rules: {
    replace: [string, string];
  }[] = []
) {
  function log(...args: unknown[]) {
    if (!filename.includes("沈逸的酬谢")) {
      return;
    }
    console.log(...args);
  }
  // @ts-ignore
  const result: Record<VideoKeys, string> = keys
    .map((k) => {
      return {
        [k]: "",
      };
    })
    .reduce((total, prev) => {
      return { ...total, ...prev };
    }, {});
  const k = has_key_factory(VIDEO_ALL_KEYS);
  // 做一些预处理
  // 移除 [name][] 前面的 [name]，大部分日本动漫前面的 [name] 是发布者信息
  log("filename is", filename);
  let original_filename = filename
    .trim()
    .replace(/^\[[a-zA-Z0-9&-]{1,}\]/, ".")
    .replace(/^\[[^\]]{1,}\](?=\[)/, "")
    .replace(/^【[^】0-9]{1,}】/, "")
    .replace(/\.[1-9]{1}[+-][1-9]{1,}\./, ".")
    // 移除零宽空格
    .replace(/\u200B/g, "")
    // 在 小谢尔顿S01E01 这种 S01E01 紧跟着名字后面的场景，前面加一个符号来分割
    .replace(/(?=[sS][0-9]{2}[eE][0-9]{2})([sS][0-9]{2}[eE][0-9]{2})/, ".$1")
    .replace(/_([0-9]{1,3})_/, ".E$1.");
  const special_season_with_number_regexp = /(^|[^a-zA-Z])([sS][pP])([0-9]{1,})($|[^a-zA-Z])/;
  if (original_filename.match(special_season_with_number_regexp)) {
    // name.SP2 改成 name.SP.E2
    original_filename = original_filename.replace(special_season_with_number_regexp, "$1.SP.E$3.$4");
  }
  original_filename = original_filename
    .replace(/^\./, "")
    .replace(/ - /g, ".")
    .replace(/第 {1,}([0-9]{1,}) {1,}[集話话]/, "第$1集")
    .replace(/[ _丨]/g, ".")
    .replace(/^\[无字\]/, "")
    .replace(/\]\[/, ".")
    .replace(/[【】《》「」\[\]]{1,}/g, ".")
    .replace(/^\./, "")
    .replace(/^\(([0-9]{1,})\)/, "E$1.")
    .replace(/\+{1,}/g, ".")
    // .replace(/(^[\u4e00-\u9fa5]{1,})([0-9]{1,})(\.[a-zA-Z]{1,}[0-9a-zA-Z]{1,}$)/, (matched, p1, p2, p3) => {
    //   return (
    //     p1 +
    //     "." +
    //     (() => {
    //       if (p2.length < 2) {
    //         return "0" + p2;
    //       }
    //       return p2;
    //     })() +
    //     p3
    //   );
    // })
    .replace(/(https{0,1}:){0,1}(\/\/){0,1}[0-9a-zA-Z]{1,}\.(com|cn)\b/, "")
    // 移除 28(1) 后面的 (1)。这种紧着在字符后的。如果是 S01 (1) 中的 1 视为剧集数
    .replace(/([^.(]{1})\([0-9]{1,}\)/, "$1.")
    .replace(/(\.){2,}/g, ".");
  // const special_season_regexp = /(^|[^a-zA-Z])([sS][pP])($|[^a-zA-Z])/;
  log("before custom parse", original_filename);
  for (let i = 0; i < extra_rules.length; i += 1) {
    (() => {
      const rule = extra_rules[i];
      const { replace } = rule;
      try {
        // log("before apply parse", replace[0]);
        const regexp = new RegExp(replace[0]);
        if (!original_filename.match(regexp)) {
          return;
        }
        // log("apply custom parse", regexp, replace[1]);
        if (replace[1] === "ORIGINAL_NAME") {
          if (!keys.includes("original_name")) {
            return;
          }
          const r = original_filename.match(regexp);
          if (r) {
            result["original_name"] = r[0];
            original_filename = original_filename.replace(r[0], "");
            return;
          }
        }
        if (replace[1] === "NAME") {
          if (!keys.includes("name")) {
            return;
          }
          const r = original_filename.match(regexp);
          log("[]NAME rule", r);
          if (r) {
            result["name"] = r[0];
            original_filename = original_filename.replace(r[0], "");
            return;
          }
        }
        if (replace[1] === "EMPTY") {
          original_filename = original_filename.replace(regexp, "");
          return;
        }
        original_filename = original_filename.replace(regexp, replace[1]);
      } catch (err) {
        // replace[0] 可能不是合法的正则
      }
    })();
  }
  log("after  custom parse", original_filename);
  let cur_filename = original_filename;
  log("start name", cur_filename);
  type ExtraRule = {
    /** 用于存值的 key */
    key?: VideoKeys;
    /** 额外的描述信息方便定位代码 */
    desc?: string;
    /** 正则 */
    regexp: RegExp;
    /** 从正则匹配结果中选择的下标，如果存在多个，取多个拼接。默认 [0] */
    pick?: number[];
    /** 优先级，默认为 0，如某个设置了大于该值的，覆盖 */
    priority?: number;
    /** 提取后，用该字符作为替换 */
    placeholder?: string;
    /** 执行该正则前调用 */
    before?: () => void | Partial<{
      /** 是否跳过该正则 */
      skip: boolean;
    }>;
    /** 执行该正则完成后调用 */
    after?: (matched_content: string | null) => void | Partial<{
      /** 是否不保存提取到的值 */
      skip: boolean;
    }>;
    /** 当该方法存在且返回 true，才执行该正则 */
    when?: () => boolean;
  };
  const priorityMap: Partial<Record<VideoKeys, number>> = {};
  // 制作组
  const publishers = ["-Huawei"].map((s) => `${s}`).join("|");
  // 分发
  const publishers2 = ["Tacit0924"].map((s) => `${s}`).join("|");
  const extra: ExtraRule[] = [
    // 一些发布者信息
    {
      regexp: new RegExp(publishers),
    },
    {
      regexp: new RegExp(publishers2),
    },
    /**
     * ------------------------ 提取集数1 episode1 start -----------------------
     */
    {
      key: k("episode"),
      regexp: /第{0,1}[0-9]{1,}[章期局场]/,
      before() {
        // log("------------");
        // log(result.episode);
        const regexp = /第{0,1}[0-9]{1,}[章期局场]/;
        if (result.episode && result.episode.match(/^[0-9]{4,8}/)) {
          if (cur_filename.match(regexp)) {
            cur_filename = cur_filename.replace(regexp, "");
          }
          return {
            skip: true,
          };
        }
        // 前面一个 第9期上：医学生花式宣讲 将前面的 ： 替换成 . 否则就识别成电视剧名称了
        cur_filename = cur_filename.replace(/^[：:]/, ".");
      },
    },
    {
      key: k("episode"),
      regexp: /[123][0-9]{1,3}[-.][01][0-9][-.][0-3][0-9]/,
    },
    {
      key: k("episode"),
      regexp: /[123][0-9]{1,3}[01][0-9][0123][0-9][章局期]{0,1}/,
    },
    {
      key: k("episode"),
      regexp: /^[01][0-9][0123][0-9](-|$)/,
      before() {
        cur_filename = cur_filename.replace(/^\.{2,}/, "").replace(/\.{1,}$/, "");
      },
    },
    {
      key: k("episode"),
      regexp: /^[0-9]{1,3}(-|$)/,
    },
    {
      key: k("episode"),
      regexp: /第[0-9]{1,}[\.$]/,
    },
    {
      key: k("episode"),
      regexp: /第[\u4e00-\u9fa5]{1,}[章集話话期局场]/,
      priority: 1,
    },
    {
      key: k("episode"),
      // 这里之所以可能出现 第.55.集 这种情况是最开始将「空格」替换成了 . 符号
      regexp: /第{0,1}[0-9]{1,}[章集話话期局场]/,
      priority: 1,
    },
    {
      key: k("episode"),
      regexp: /[\u4e00-\u9fa5]{1,}(0[1-9]{1,2})\./,
      pick: [1],
    },
    // 影片名及集名
    ...(() => {
      // 中文 \u4e00-\u9fa5
      // 俄文 \u0400-\u04FF
      // 韩文 \uAC00-\uD7A3 和英文一样中间可以包含空格
      // 日文 \u0800-\u4e00 还要包含中文字符范围
      // 英文 a-zA-Z
      const name_regexp =
        /[0-9a-zA-Z\u4e00-\u9fa5\u0400-\u04FF\uAC00-\uD7A3\u0800-\u4e00]{1,}[ \.\-&!,'（）：！？～×－0-9a-zA-Z\u4e00-\u9fa5\u0400-\u04FF\uAC00-\uD7A3\u0800-\u4e00]{0,}[）0-9a-zA-Z!！？－\u4e00-\u9fa5\u0400-\u04FF\uAC00-\uD7A3\u0800-\u4e00]{0,}/;
      const remove_multiple_dot = () => {
        cur_filename = cur_filename.replace(/[\.]{2,}/g, "`").replace(/^\.{0,1}/, "");
      };
      const name_extra: ExtraRule[] = [
        {
          key: k("episode_name"),
          regexp: name_regexp,
          before: remove_multiple_dot,
        },
      ];
      return name_extra;
    })(),
  ];
  log("\n");
  log("[0]start apply extra", cur_filename);
  for (let i = 0; i < extra.length; i += 1) {
    const { key, desc, regexp, priority, placeholder, pick = [0], when, before, after } = extra[i];
    if (!cur_filename) {
      break;
    }
    if ([".", "`"].includes(cur_filename)) {
      break;
    }
    const unique = (() => {
      if (desc) {
        return desc;
      }
      // if (key) {
      //   return key;
      // }
      return regexp;
    })();
    log("\n");
    log("[1]extra start", unique, "from", cur_filename);
    // log("[1]start extra content for", chalk.greenBright(unique), "and cur filename is", chalk.blueBright(cur_filename));
    /**
     * 如果重复出现同一个信息，比如 S01E22.第22集，这里「集数」重复出现了
     * 会导致 `第22集` 没有被移除，被下一个正则捕获，出现错误信息。打开后性能也提升没多少，还存在错误信息，干脆关了
     */
    // if (key && result[key]) {
    //   continue;
    // }
    if (before) {
      const r = before();
      log("[2]invoke before fn for", unique, "and result is", r);
      if (r?.skip) {
        continue;
      }
    }
    if (when) {
      const need_match = when();
      if (!need_match) {
        continue;
      }
    }
    const m = cur_filename.match(regexp);
    log("[3]extra result", m);
    if (after) {
      const r = after(
        (() => {
          if (m) {
            return m[0];
          }
          return null;
        })()
      );
      // log("[3]invoke after fn for", unique, "and result is", r);
      if (r?.skip) {
        continue;
      }
    }
    if (!m) {
      continue;
    }
    // log("[10]matched content and key", key, m[0]);
    let extracted_content = "";
    for (let i = 0; i < pick.length; i += 1) {
      const index = pick[i];
      const c = m[index];
      let from = cur_filename.indexOf(c);
      if (from === -1 && m.index !== undefined && from >= m.index) {
        from = m.index;
      }
      // log("[4]pick content in", index, "is", c);
      if (m[index] !== undefined) {
        extracted_content += c;
        cur_filename = remove_str(cur_filename, from, c.length, placeholder);
      }
    }
    log("[5]extracted content for", unique, "is", extracted_content, `key: ${key}`, `priority: ${priority}`);
    if (key && VIDEO_ALL_KEYS.includes(key)) {
      // log("[6]replace value with priority", priority, priorityMap);
      if (!priority) {
        if (priorityMap[key]) {
          continue;
        }
      }
      // log("[5.1]compare priority", extracted_content, priority, priorityMap);
      if (priority === -1 && result[key]) {
        // -1 优先级最低，如果之前匹配到了，就忽略这次匹配到的
        continue;
      }
      if (priority !== undefined) {
        const prevKeyPriority = priorityMap[key];
        if (prevKeyPriority && priority <= prevKeyPriority) {
          continue;
        }
        result[key] = extracted_content;
        priorityMap[key] = priority;
      }
      result[key] = extracted_content;
    }
  }
  if (result.episode) {
    result.episode = format_episode_number(result.episode, {
      log,
    });
  }
  if (result.original_name && result.original_name.match(/\.$/)) {
    result.original_name = result.original_name.replace(/\.$/, "");
  }
  return keys
    .map((k) => {
      return {
        [k]: result[k],
      };
    })
    .reduce((t, cur) => {
      return {
        ...t,
        ...cur,
      };
    }) as Record<VideoKeys, string>; // 怎么筛选传入的 keys
}

/**
 * 格式化 season 或 episode 数
 * @param number
 * @param prefix
 * @returns
 */
export function format_season_number(n: string, prefix = "S") {
  const number = n.replace(/\.$/, "");
  // console.log("(format_number) - season", number);
  if (number === "Ⅱ") {
    return "S02";
  }
  if (number === "II") {
    return "S02";
  }
  if (number === "III") {
    return "S03";
  }
  if (number === "IV") {
    return "S04";
  }
  if (number.match(/[sS]eason\.V/)) {
    return "S05";
  }
  if (number === "VI") {
    return "S06";
  }
  if (number === "VII") {
    return "S07";
  }
  if (number === "VIII") {
    return "S08";
  }
  if (number === "IX") {
    return "S09";
  }
  if (number === "X") {
    return "S10";
  }
  if (!number.match(/[0-9]/) && !number.match(/[零一二三四五六七八九十]/)) {
    if (number === "本篇") {
      return "S01";
    }
    if (number === "OVA") {
      return "OVA";
    }
    return number;
  }
  if (number.match(/[nN][cC]/)) {
    return number;
  }
  if (number.match(/[cC][mM]/)) {
    return number;
  }
  if (number.match(/[sS][pP]/)) {
    if (!number.match(/[0-9]{1,}/)) {
      // 如果是季，不应该补1？
      return "SP01";
    }
    return number;
  }
  if (number.match(/特别篇/)) {
    if (!number.match(/[0-9]{1,}/)) {
      return "特别篇01";
    }
    return number;
  }
  if (number.match(/[eE][pP][0-9]{1,}/)) {
    return number.replace(/[pP]/, "");
  }
  const nn = number.match(/[sS][eE]([0-9]{1,})/);
  if (nn) {
    return `S${padding_zero(nn[1])}`;
  }
  const matched = number.match(/[0-9]{1,}/);
  if (!matched) {
    const m2 = number.match(/[零一二三四五六七八九十]{1,}/);
    if (!m2) {
      return number;
    }
    const num = chinese_num_to_num(m2[0]);
    return `${prefix}${padding_zero(num)}`;
  }
  const num = matched[0];
  const e = `${prefix}${padding_zero(num)}`;
  return e;
}

function format_episode_number2(n: string) {
  let result = n.replace(/[\.\(\)]/g, "").trim();
  if (result.match(/^第[0-9]{1,}/)) {
    return result;
  }
  if (result.match(/[0-9]{4,8}/)) {
    const r = result.match(/([0-9]{4,8})/);
    if (r) {
      return r[1];
    }
  }
  const r = result.match(/([0-9]{1,})/);
  if (r) {
    const r2 = result.match(/([期集])/);
    if (r2) {
      return `第${Number(r[1])}${r2[1]}`;
    }
    return `第${Number(r[1])}期`;
  }
  return result;
}
/**
 * 格式化 episode 数
 * @param number
 * @param prefix
 * @returns
 */
export function format_episode_number(n: string, options: { log: (...args: unknown[]) => void }): string {
  const { log } = options;
  log("[]format_episode_number", n);
  const prefix = "E";
  const number = n.replace(/\.{1,}$/, "").replace(/^\.{1,}/, "");
  // E01-E02
  if (number.match(/[eE][pP]{0,1}[0-9]{1,}-{0,1}[eE]{0,1}[pP]{0,1}[0-9]{1,}/)) {
    const matched = number.match(/[eE][pP]{0,1}([0-9]{1,})-{0,1}[eE][pP]{0,1}([0-9]{1,})/);
    // if (!matched) {
    if (matched) {
      return `E${matched[1]}-${matched[2]}`;
    }
  }
  // console.log("[UTILS]format_number before 第01-02话");
  // 第01-02话
  if (number.match(/第[0-9]{1,}-[0-9]{1,}[章集話话]/)) {
    const matched = number.match(/第([0-9]{1,})-([0-9]{1,})[章集話话]/);
    if (!matched) {
      return number;
    }
    return `E${matched[1]}-${matched[2]}`;
  }
  const m1 = number.match(/第([\u4e00-\u9fa5]{1,})[章集話话期局场]/);
  if (m1) {
    const n = m1[1];
    const num = chinese_num_to_num(n);
    return `E${num}`;
  }
  // 第01-02话 处理成 E01-E02
  const matched = number.match(/[0-9]{1,}/);
  const extra = number.match(/Extended|Complete/);
  if (!matched) {
    const m2 = number.match(/[零一二三四五六七八九十]{1,}/);
    // log("[](formatSeason)matched m2", m2);
    if (!m2) {
      return number;
    }
    const num = chinese_num_to_num(m2[0]);
    const e = `${prefix}${padding_zero(num)}`;
    if (extra) {
      return `${e}.${extra}`;
    }
    return e;
  }
  const num = matched[0];
  const e = `${prefix}${padding_zero(num)}`;
  if (extra) {
    return `${e}.${extra}`;
  }
  return e;
}

export function maybe_other_season(episode: string) {
  if (episode.match(/BONUS|PR|NCOP|NCED|CM/)) {
    return "其他";
  }
  return "";
}

export function has_key_factory(keys: VideoKeys[]) {
  return (key: VideoKeys) => {
    if (keys.includes(key)) {
      return key;
    }
    return undefined;
  };
}

export function is_japanese(text: string) {
  const chinese_char = text.match(/[\u4e00-\u9fff]/g) || [];
  const japanese_char = text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || [];
  if (japanese_char.length > chinese_char.length) {
    return true;
  }
  return false;
}
export function is_korean(text: string) {
  const chinese_char = text.match(/[\u4e00-\u9fff]/g) || [];
  const korean_char = text.match(/[\uac00-\ud7a3]/g) || [];
  if (korean_char.length > chinese_char.length) {
    return true;
  }
  return false;
}

/**
 * 构建一个带有首字母的电视剧名称
 */
export function build_media_name(values: { name: string | null; original_name: string | null }) {
  const { name, original_name } = values;
  const first_char_pin_yin = get_first_letter(name);
  const nn = name
    ? name
        .replace(/ {2,}/, " ")
        .split(" ")
        .map((t) => t.trim())
        .join(" ")
    : null;
  const n = [first_char_pin_yin, nn].filter(Boolean).join(" ");
  const original_n = (() => {
    if (name && name === original_name) {
      return "";
    }
    if (!original_name) {
      return "";
    }
    return original_name
      .split(" ")
      .map((t) => t.trim())
      .map((t) => {
        return t.replace(/\.{1,}$/, "").replace(/^\.{1,}/, "");
      })
      .join(".");
  })().replace(/ /, "");
  const name_with_pin_yin = [n, original_n].filter(Boolean).join(".").replace(/:/, "：");
  return name_with_pin_yin;
}

/**
 * 各种奇怪的集数信息正常化
 * @param filename
 * @returns
 */
function normalize_episode_text(filename: string) {
  let name = filename;
  // if there only two number, use as episode number.
  if (/(\.|^)[-_]{0,1}([0-9]{2,3})(\.|$)/.test(name)) {
    name = name.replace(/(\.|^)[-_]{0,1}([0-9]{2,3})(\.|$)/, ".E$2.");
  }
  if (name.match(/\b([0-9]{1,})[xX]([0-9]{1,})\b/)) {
    return name.replace(/\b([0-9]{1,})[xX]([0-9]{1,})\b/g, "S$1.E$2");
  }
  return name.replace(/\b([0-9]{1})([0-9]{2})\b/g, "S$1.E$2");
}
