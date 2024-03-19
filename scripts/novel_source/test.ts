/**
 * 遍历更新中的小说，使用书源获取小说正文
 */
import dayjs from "dayjs";

import { CollectionTypes, MediaTypes } from "@/constants";
import { Application } from "@/domains/application";
import { walk_model_with_cursor } from "@/domains/store/utils";
import { bytes_to_size, parseJSONStr, r_id } from "@/utils";
import { Bg3Source } from "@/domains/novel_source/sources/bg3";
import { BrowserHelper } from "@/domains/browser";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { MingZWSource } from "@/domains/novel_source/sources/mingzw";
import { parse_name_of_chapter } from "@/utils/parse_name_of_chapter";
import { DXMWXSource } from "@/domains/novel_source/sources/dxmwx";
import { Biqu520Source } from "@/domains/novel_source/sources/biqu520";

async function main() {
  const OUTPUT_PATH = process.env.OUTPUT_PATH;
  //   const DATABASE_PATH = "file://$OUTPUT_PATH/data/family-flix.db?connection_limit=1";
  if (!OUTPUT_PATH) {
    console.error("缺少数据库文件路径");
    return;
  }
  const app = new Application({
    root_path: OUTPUT_PATH,
  });
  const store = app.store;
  console.log("Start");
  const novel_clients: Record<string, new (props: { unique_id: string }) => NovelSourceClient> = {
    // bg3: Bg3Source,
    mingzw: MingZWSource,
    dxmwx: DXMWXSource,
    biqu520: Biqu520Source,
  };
  //   const client = new DXMWXSource({ unique_id: "dxmwx" });
  const client = new MingZWSource({ unique_id: "mingzw" });

  /** 搜索 */
  //   const r = await client.search("玄鉴仙族");
  //   if (r.error) {
  //     console.log(r.error.message);
  //     return;
  //   }
  //   console.log(r.data);

  /** 获取章节列表 */
  const r2 = await client.fetch_chapters({ id: "39607" });
  if (r2.error) {
    console.log(r2.error.message);
    return;
  }
  console.log(r2.data.chapters[r2.data.chapters.length - 1]);

  /** 获取章节正文 */
  //   const r3 = await client.fetch_content({ url: "http://m.biqu520.net/wapbook-194173-192176573/" });
  //   if (r3.error) {
  //     console.log(r3.error.message);
  //     return;
  //   }
  //   console.log(r3.data);
  console.log("Success");
}

main();
