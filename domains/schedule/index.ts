import fs from "fs";
import path from "path";
import dayjs from "dayjs";

import { Application } from "@/domains/application";
import { walk_model_with_cursor } from "@/domains/store/utils";
import {
  DataStore,
  NovelChapterProfileRecord,
  NovelProfileRecord,
  NovelSourceRecord,
  SearchedChapterRecord,
  SearchedNovelRecord,
} from "@/domains/store/types";
import { QidianClient } from "@/domains/novel_profile/qidian";
import { NovelProfileClient } from "@/domains/novel_profile";
import { Article, ArticleLineNode, ArticleSectionNode } from "@/domains/article";
import { Administrator } from "@/domains/user/administrator";
import { NovelSourceClientMap } from "@/domains/novel_source";
import { NovelSourceClient, SearchedNovelChapter } from "@/domains/novel_source/types";
import { User } from "@/domains/user";
import { r_id } from "@/utils/index";
import { get_episode_num, parse_name_of_chapter } from "@/utils/parse_name_of_chapter";
import { match_chapter } from "@/utils/match_chapter";
import { Result } from "@/types/index";
import { ensure } from "@/utils/fs";

export class ScheduleTask {
  profile_client: QidianClient;
  novel_profile: NovelProfileClient;
  store: DataStore;
  app: Application;
  on_print: (node: ArticleLineNode | ArticleSectionNode) => void;

  constructor(props: {
    app: Application;
    store: DataStore;
    on_print?: (node: ArticleLineNode | ArticleSectionNode) => void;
  }) {
    const { app, store, on_print = () => {} } = props;
    this.app = app;
    this.store = store;
    this.on_print = on_print;

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
  async search_novels(options: Partial<{ force: boolean }> = {}) {
    await this.walk_user(async (user) => {
      const novel_sources = await this.store.prisma.novel_source.findMany({
        where: {
          user_id: user.id,
        },
      });
      await walk_model_with_cursor({
        fn: (args) => {
          return this.store.prisma.novel_profile.findMany({
            ...args,
          });
        },
        handler: async (novel) => {
          await this.search_novel_by_novel_sources({ novel, user, novel_sources });
        },
      });
      // await this.match_searched_chapter();
      // await this.walk_with_source({
      //   default_sources: novel_sources,
      //   user,
      //   handler: async ({ id, client }) => {
      //     await walk_model_with_cursor({
      //       fn: (extra) => {
      //         return this.store.prisma.searched_chapter.findMany({
      //           where: {
      //             searched_novel: {
      //               source_id: id,
      //             },
      //           },
      //           ...extra,
      //         });
      //       },
      //       handler: async (chapter) => {
      //         if (!options.force && chapter.content_filepath) {
      //           return;
      //         }
      //         await this.fetch_chapter_content(chapter, client);
      //       },
      //     });
      //   },
      // });
    });
    return Result.Ok(null);
  }
  async search_novel_by_novel_sources(
    values: {
      novel: NovelProfileRecord;
      user: User;
      novel_sources?: NovelSourceRecord[];
    },
    options: Partial<{ include_content: boolean }> = {}
  ) {
    const { novel, novel_sources, user } = values;
    const sources = await (async () => {
      if (novel_sources) {
        return novel_sources;
      }
      return this.store.prisma.novel_source.findMany({
        where: {
          user_id: user.id,
        },
      });
    })();
    for (let i = 0; i < sources.length; i += 1) {
      await (async () => {
        const novel_source = sources[i];
        const Client = NovelSourceClientMap[novel_source.unique_id];
        if (!Client) {
          return;
        }
        const client = new Client({ unique_id: novel_source.unique_id });
        const r1 = await this.search_novel_by_novel_source(
          novel,
          { id: novel_source.id, name: novel_source.name, client },
          options
        );
        if (r1.error) {
          return;
        }
        const searched_novel = r1.data;
        await this.match_chapters_of_searched_novel(searched_novel);
      })();
    }
    const searched_novels = await this.store.prisma.searched_novel.findMany({
      where: {
        profile_id: novel.id,
      },
      include: {
        profile: {
          include: {
            novel_chapter_profiles: true,
          },
        },
        chapters: true,
      },
    });
    return Result.Ok(searched_novels);
  }
  find_source(unique_id: string) {
    const Client = NovelSourceClientMap[unique_id];
    if (!Client) {
      return null;
    }
    return new Client({ unique_id });
  }
  async walk_with_source(options: {
    handler: (values: { id: string; name: string; client: NovelSourceClient }) => void;
    user: User;
    default_sources?: NovelSourceRecord[];
  }) {
    const { handler, user, default_sources } = options;
    const sources = await (async () => {
      if (default_sources) {
        return default_sources;
      }
      return this.store.prisma.novel_source.findMany({
        where: {
          user_id: user.id,
        },
      });
    })();
    for (let i = 0; i < sources.length; i += 1) {
      await (async () => {
        const novel_source = sources[i];
        const Client = NovelSourceClientMap[novel_source.unique_id];
        if (!Client) {
          return;
        }
        const client = new Client({ unique_id: novel_source.unique_id });
        await handler({ id: novel_source.id, name: novel_source.name, client });
      })();
    }
    return Result.Ok(null);
  }
  /** 使用书源搜索指定书籍 */
  async search_novel_by_novel_source(
    novel: { id: string; name: string },
    source: { id: string; name: string; client: NovelSourceClient },
    options: Partial<{ include_content: boolean }> = {}
  ) {
    this.on_print(Article.build_line([" ---- "]));
    this.on_print(Article.build_line(["使用书源", `「${source.name}」`, "搜索", `「${novel.name}」`]));
    const r2 = await source.client.search(novel.name);
    if (r2.error) {
      this.on_print(Article.build_line(["搜索失败，因为", r2.error.message]));
      return Result.Err(r2.error.message);
    }
    const searched_novel = r2.data;
    const searched_novel_record = await (async () => {
      const existing = await this.store.prisma.searched_novel.findFirst({
        where: {
          unique_id: searched_novel.id,
          source_id: source.id,
        },
        include: {
          profile: {
            include: {
              novel_chapter_profiles: true,
            },
          },
          chapters: true,
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
        include: {
          profile: {
            include: {
              novel_chapter_profiles: true,
            },
          },
          chapters: true,
        },
      });
      return created;
    })();
    this.on_print(Article.build_line(["搜索成功，开始获取章节列表"]));
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
      this.on_print(Article.build_line([`没有新增章节`]));
      return Result.Err("没有新增章节");
    }
    if (chapters.length === 0) {
      this.on_print(Article.build_line([`暂无章节`]));
      return Result.Err("暂无章节");
    }
    this.on_print(Article.build_line([`搜索到`, `共 ${chapters.length} 章节`]));
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
          // console.log(`'${searched_novel.name}' - ${chapter.name} 章节 已存在`, { id: chapter.id });
          // 已经存在就忽略，另外有地方主动刷新章节
          return;
        }
        const { episode } = parse_name_of_chapter(chapter.name);
        const num = get_episode_num(episode);
        this.on_print(Article.build_line([`新增章节`, `${chapter.name}`]));
        await this.store.prisma.searched_chapter.create({
          data: {
            id: r_id(),
            unique_id: chapter.id,
            name: chapter.name,
            url: chapter.url,
            order: num || i,
            searched_novel_id: searched_novel_record.id,
          },
        });
      })();
    }
    this.on_print(Article.build_line(["完成", `「${novel.name}」`, "使用书源", `「${source.name}」搜索`]));
    return Result.Ok(searched_novel_record);
  }
  async fetch_chapter_content(chapter: { id: string; url: string }, source: NovelSourceClient) {
    const { id, url } = chapter;
    const r4 = await source.fetch_content(chapter);
    if (r4.error) {
      console.log(r4.error.message);
      await this.store.prisma.searched_chapter.update({
        where: {
          id,
        },
        data: {
          error: JSON.stringify({ text: r4.error.message }),
        },
      });
      return Result.Err(r4.error.message);
    }
    const content = r4.data;
    const contents = content.join("\n");
    const profile = await this.store.prisma.searched_chapter.findFirst({
      where: {
        url,
      },
      include: {
        searched_novel: true,
      },
    });
    console.log("成功获取到章节内容，内容总字数", contents.length, id);
    const storage_filepath = this.app.assets;
    const chapter_filepath = (() => {
      if (profile) {
        return path.join(storage_filepath, profile.searched_novel.name, `${profile.name.replace(/ /, "_")}.txt`);
      }
      return path.join("chapters", `${r_id()}.txt`);
    })();
    await ensure(chapter_filepath);
    fs.writeFileSync(chapter_filepath, contents);
    await this.store.prisma.searched_chapter.update({
      where: {
        id,
      },
      data: {
        content_filepath: chapter_filepath,
      },
    });
    return Result.Ok(contents);
  }
  async match_searched_chapter(options: Partial<{ force: boolean }> = {}) {
    const created_chapters: Record<
      string,
      {
        novel_name: string;
        chapter_name: string;
      }[]
    > = {};
    await walk_model_with_cursor({
      fn: (extra) => {
        return this.store.prisma.searched_novel.findMany({
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
          ...extra,
        });
      },
      batch_handler: async (list, index) => {
        for (let i = 0; i < list.length; i += 1) {
          const r = await this.match_chapters_of_searched_novel(list[i], options);
          Object.assign(created_chapters, r);
        }
      },
    });
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
  async match_chapters_of_searched_novel(
    searched_novel: SearchedNovelRecord & {
      profile: NovelProfileRecord & {
        novel_chapter_profiles: NovelChapterProfileRecord[];
      };
      chapters: SearchedChapterRecord[];
    },
    options: Partial<{ force: boolean }> = {}
  ) {
    const { profile, chapters: searched_chapters } = searched_novel;
    const { novel_chapter_profiles: chapters } = profile;
    const created_chapters: Record<
      string,
      {
        novel_name: string;
        chapter_name: string;
      }[]
    > = {};
    // console.log(`处理搜索到的小说 '${searched_novel.name}' 章节`);
    this.on_print(Article.build_line(["匹配章节详情"]));
    for (let j = 0; j < searched_chapters.length; j += 1) {
      const searched_chapter = searched_chapters[j];
      const { id, name } = searched_chapter;
      // const chapter_name = name.replace(/,/g, "，").replace(/:/g, "：").replace(/;/g, "；");
      // const parsed = format_chapter_name(name);
      await (async () => {
        if (!options.force && searched_chapter.chapter_profile_id) {
          return;
        }
        this.on_print(Article.build_line([`${j + 1}、`, name]));
        const r = match_chapter(searched_chapter, chapters);
        if (r.error) {
          this.on_print(Article.build_line(["没有匹配到章节详情", r.error.message]));
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
    return created_chapters;
  }
}
