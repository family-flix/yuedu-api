import dayjs from "dayjs";

import { Application } from "@/domains/application";
import { walk_model_with_cursor } from "@/domains/store/utils";
import { DataStore } from "@/domains/store/types";
import { QidianClient } from "@/domains/novel_profile/qidian";
import { NovelProfileClient } from "@/domains/novel_profile";
import { Administrator } from "@/domains/user/administrator";
import { NovelSourceClientMap } from "@/domains/novel_source";
import { NovelSourceClient } from "@/domains/novel_source/types";
import { r_id } from "@/utils/index";
import { get_episode_num, parse_name_of_chapter } from "@/utils/parse_name_of_chapter";
import { match_chapter } from "@/utils/match_chapter";
import { Result } from "@/types/index";

export class ScheduleTask {
  profile_client: QidianClient;
  novel_profile: NovelProfileClient;
  store: DataStore;
  app: Application;

  constructor(props: { app: Application; store: DataStore }) {
    const { app, store } = props;
    this.app = app;
    this.store = store;

    const profile_client = new QidianClient();
    this.profile_client = profile_client;
    const novel_profile = new NovelProfileClient({
      store,
    });
    this.novel_profile = novel_profile;
  }

  /** 遍历用户 */
  async walk_user(handler: (user: Administrator) => Promise<unknown>) {
    await walk_model_with_cursor({
      fn: (extra) => {
        return this.store.prisma.user.findMany({
          where: {},
          ...extra,
        });
      },
      handler: async (d, index) => {
        const t_res = await Administrator.Get({ id: d.id, store: this.store });
        if (t_res.error) {
          return;
        }
        const user = t_res.data;
        await handler(user);
      },
    });
  }
  /** 获取起点小说最新信息，刷新存储的小说详情、章节信息 */
  async refresh_novel_profiles() {
    const novels = await this.store.prisma.novel_profile.findMany({
      where: {
        in_production: 1,
      },
    });
    for (let j = 0; j < novels.length; j += 1) {
      const novel = novels[j];
      await (async () => {
        const r1 = await this.profile_client.fetch_profile(novel.id);
        if (r1.error) {
          console.log([novel.name], "fetch profile failed,", r1.error.message);
          return;
        }
        const { chapter_count } = r1.data;
        if (chapter_count === novel.chapter_count) {
          console.log([novel.name], "章节数相同，跳过");
          return;
        }
        const r2 = await this.profile_client.fetch_chapters(novel.id);
        if (r2.error) {
          console.log([novel.name], "fetch chapters failed,", r2.error.message);
          return;
        }
        const chapters = r2.data;
        for (let i = 0; i < chapters.length; i += 1) {
          const chapter = chapters[i];
          const e = await this.store.prisma.novel_chapter_profile.findFirst({
            where: {
              id: chapter.unique_id,
            },
          });
          if (!e) {
            const novel_section_profile = await this.novel_profile.get_novel_section_profile(chapter.section, novel);
            await this.store.prisma.novel_chapter_profile.create({
              data: {
                id: chapter.unique_id,
                name: chapter.name,
                order: chapter.order,
                text_count: chapter.text_count,
                updated_at: novel.updated.toISOString(),
                novel_section_profile_id: novel_section_profile.id,
                novel_profile_id: novel.id,
              },
            });
          }
        }
      })();
    }
  }
  async search_novels() {
    await this.walk_user(async (user) => {
      const novel_sources = await this.store.prisma.novel_source.findMany({
        where: {
          user_id: user.id,
        },
      });
      const novels = await this.store.prisma.novel_profile.findMany({});
      for (let i = 0; i < novel_sources.length; i += 1) {
        await (async () => {
          const novel_source = novel_sources[i];
          const Client = NovelSourceClientMap[novel_source.unique_id];
          if (!Client) {
            return;
          }
          const client = new Client({ unique_id: novel_source.unique_id });
          for (let j = 0; j < novels.length; j += 1) {
            await this.search_novel_by_novel_source(novels[j], { id: novel_source.id, client });
          }
        })();
      }
    });
  }
  /** 使用书源搜索指定书记 */
  async search_novel_by_novel_source(
    novel: { id: string; name: string },
    source: { id: string; client: NovelSourceClient }
  ) {
    const r2 = await source.client.search(novel.name);
    if (r2.error) {
      return Result.Err(r2.error.message);
    }
    const searched_novel = r2.data;
    const searched_novel_record = await (async () => {
      const existing = await this.store.prisma.searched_novel.findFirst({
        where: {
          unique_id: searched_novel.id,
          source_id: source.id,
        },
      });
      if (existing) {
        return existing;
      }
      const created = await this.store.prisma.searched_novel.create({
        data: {
          id: r_id(),
          unique_id: searched_novel.id,
          name: searched_novel.name,
          url: searched_novel.url,
          profile_id: novel.id,
          source_id: source.id,
        },
      });
      return created;
    })();
    // @todo 记录章节总数，下次 run 时比较总数，如果相同，直接忽略，避免了遍历几千条数据对比
    const r3 = await source.client.fetch_chapters(searched_novel);
    if (r3.error) {
      return Result.Err(r3.error.message);
    }
    const chapters = r3.data.chapters;
    const chapter_count = await this.store.prisma.searched_chapter.count({
      where: { searched_novel_id: searched_novel.id },
    });
    if (chapter_count === chapters.length) {
      return Result.Err("没有新增章节");
    }
    if (chapters.length === 0) {
      return Result.Err("暂无章节");
    }
    console.log(`'${searched_novel.name}' 共 ${chapters.length} 章节`);
    await this.store.prisma.searched_novel.update({
      where: {
        id: searched_novel_record.id,
      },
      data: {
        chapter_count: chapters.length,
      },
    });
    for (let i = 0; i < chapters.length; i += 1) {
      const chapter = chapters[i];
      await (async () => {
        const existing = await this.store.prisma.searched_chapter.findFirst({
          where: {
            unique_id: chapter.id,
          },
        });
        if (existing) {
          console.log(`'${searched_novel.name}' - ${chapter.name} 章节 已存在`, { id: chapter.id });
          // 已经存在就忽略，另外有地方主动刷新章节
          return;
        }
        const r4 = await source.client.fetch_content(chapter);
        if (r4.error) {
          console.log(r4.error.message);
          return;
        }
        const content = r4.data;
        const contents = content.join("\n");
        console.log(chapter.name, "成功获取到章节内容，内容总字数", contents.length);
        const { episode } = parse_name_of_chapter(chapter.name);
        const num = get_episode_num(episode);
        await this.store.prisma.searched_chapter.create({
          data: {
            id: r_id(),
            unique_id: chapter.id,
            name: chapter.name,
            url: chapter.url,
            order: num || i,
            content: contents,
            searched_novel_id: searched_novel_record.id,
          },
        });
      })();
    }
    return Result.Ok(null);
  }
  async match_searched_chapter() {
    const created_chapters: Record<
      string,
      {
        novel_name: string;
        chapter_name: string;
      }[]
    > = {};
    const searched_novels = await this.store.prisma.searched_novel.findMany({
      include: {
        profile: {
          include: {
            novel_chapter_profiles: true,
          },
        },
        chapters: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
    for (let i = 0; i < searched_novels.length; i += 1) {
      const searched_novel = searched_novels[i];
      const { profile, chapters: searched_chapters } = searched_novel;
      const { novel_chapter_profiles: chapters } = profile;
      console.log(`处理搜索到的小说 '${searched_novel.name}' 章节`);
      for (let j = 0; j < searched_chapters.length; j += 1) {
        const searched_chapter = searched_chapters[j];
        const { id, name } = searched_chapter;
        // const chapter_name = name.replace(/,/g, "，").replace(/:/g, "：").replace(/;/g, "；");
        // const parsed = format_chapter_name(name);
        await (async () => {
          if (searched_chapter.chapter_profile_id) {
            return;
          }
          console.log(`${j + 1}、`, name);
          const r = match_chapter(searched_chapter, chapters);
          if (r.error) {
            console.log(r.error.message);
            await this.store.prisma.searched_chapter.update({
              where: { id },
              data: {
                error: JSON.stringify({
                  text: "没有匹配到章节详情",
                }),
              },
            });
            return;
          }
          const matched = r.data;
          // const chapter = get_novel_chapter(matched);
          console.log("成功匹配到章节详情", matched.name);
          await this.store.prisma.searched_chapter.update({
            where: { id },
            data: {
              chapter_profile_id: matched.id,
              error: null,
            },
          });
          created_chapters[profile.name] = created_chapters[profile.name] || [];
          created_chapters[profile.name].push({
            novel_name: profile.name,
            chapter_name: matched.name,
          });
        })();
      }
    }
    const novels_has_chapters = Object.keys(created_chapters);
    if (novels_has_chapters.length === 0) {
      return Result.Ok(null);
    }
    const tips: string[] = [];
    for (let i = 0; i < novels_has_chapters.length; i += 1) {
      const name = novels_has_chapters[i];
      const chapters = created_chapters[name];
      const tip = `# ${name}\n${chapters.join("\n")}`;
      tips.push(tip);
    }
    return Result.Ok(tips.join("\n\n"));
  }
}
