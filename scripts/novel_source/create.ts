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
  const novel_sources = [
    {
      unique_id: "bg3",
      name: "天天看小说",
      url: "https://cn.ttkan.co",
    },
    {
      unique_id: "mingzw",
      name: "明治屋",
      url: "https://www.mingzw.net",
    },
    {
      unique_id: "dxmwx",
      name: "大熊猫文学网",
      url: "https://www.dxmwx.org/",
    },
  ];
  const users = await store.prisma.user.findMany({});
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    for (let j = 0; j < novel_sources.length; j += 1) {
      const novel_source = novel_sources[j];
      await (async () => {
        const existing = await store.prisma.novel_source.findFirst({
          where: {
            unique_id: novel_source.unique_id,
          },
        });
        if (existing) {
          return;
        }
        await store.prisma.novel_source.create({
          data: {
            id: r_id(),
            unique_id: novel_source.unique_id,
            name: novel_source.name,
            url: novel_source.url,
            user_id: user.id,
          },
        });
      })();
    }
  }
  console.log("Success");
}

main();
