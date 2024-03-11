import { DataStore } from "@/domains/store/types";
import { Member } from "@/domains/user/member";
import { Result } from "@/types";

import { get_chapter_ranges } from "./utils";
import { NovelProfile } from "./types";

export class NovelCore {
  static async Get(values: { id?: string; member: Member; store: DataStore }) {
    const { id, member, store } = values;
    if (!id) {
      return Result.Err("缺少 id 参数");
    }
    const novel = await store.prisma.novel.findFirst({
      where: {
        id,
        user_id: member.user.id,
      },
      include: {
        novel_profile: true,
      },
    });
    if (novel === null) {
      return Result.Err("没有匹配的记录");
    }
    const { novel_profile } = novel;
    const profile = {
      id,
      name: novel_profile.name,
      overview: novel_profile.overview,
      cover_path: novel_profile.cover_path,
      novel_profile_id: novel_profile.id,
    };
    return Result.Ok(
      new NovelCore({
        id,
        profile,
        member,
        store,
      })
    );
  }

  id: string;
  profile: NovelProfile;

  member: Member;
  store: DataStore;

  constructor(props: { id: string; profile: NovelProfile; member: Member; store: DataStore }) {
    const { id, profile, member, store } = props;

    this.id = id;
    this.profile = profile;
    this.member = member;
    this.store = store;
  }
  async fetch_cur_chapter() {
    const history = await this.store.prisma.read_history.findFirst({
      where: {
        novel_id: this.id,
        member_id: this.member.id,
      },
      include: {
        novel: true,
        novel_chapter: {
          include: {
            files: {
              include: {
                searched_novel: {
                  include: {
                    source: true,
                  },
                },
              },
            },
          },
        },
        file: true,
      },
    });
    const {
      chapters: novel_chapters,
      cur_chapter,
      prev_marker,
      next_marker,
    } = await (async () => {
      if (!history) {
        const page_size = 100;
        const chapters = await this.store.prisma.novel_chapter_profile.findMany({
          where: {
            novel_profile_id: this.profile.novel_profile_id,
          },
          include: {
            novel_profile: true,
            files: {
              include: {
                searched_novel: {
                  include: {
                    source: true,
                  },
                },
              },
            },
          },
          take: page_size + 1,
          orderBy: {
            order: "asc",
          },
        });
        const first = chapters[0];
        const next_marker = chapters[chapters.length - 1].id;
        return {
          chapters: chapters.slice(0, page_size),
          cur_chapter: first
            ? {
                id: first.id,
                name: first.name,
                order: first.order,
                files: first.files.map((f) => {
                  const { id, name, order, searched_novel } = f;
                  return {
                    id,
                    name,
                    order,
                    from_source: {
                      id: searched_novel.source.id,
                      name: searched_novel.source.name,
                    },
                  };
                }),
              }
            : null,
          prev_marker: null,
          next_marker,
        };
      }
      const { novel_chapter } = history;
      const chapter_count = await this.store.prisma.novel_chapter_profile.count();
      const range = get_chapter_ranges(novel_chapter.order, { step: 102, max: chapter_count });
      const chapters = await this.store.prisma.novel_chapter_profile.findMany({
        where: {
          files: {
            some: {},
          },
          order: {
            gte: range[0],
            lte: range[1],
          },
          novel_profile_id: history.novel.novel_profile_id,
        },
        include: {
          novel_profile: true,
          files: {
            include: {
              searched_novel: {
                include: {
                  source: true,
                },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });
      const first = chapters[0];
      const last = chapters[chapters.length - 1];
      // 如果当前看的是第一章，就不能获取之前的章节（一般都是当前章就是第一章）
      const prev_marker = first.id === novel_chapter.id ? null : first.id;
      // 同理，如果当前看的是最后一章，就不能获取之后的章节（一般都是当前章就是最后章）
      const next_marker = last.id === novel_chapter.id ? null : last.id;
      return {
        chapters: chapters.slice(1, chapters.length - 1),
        cur_chapter: {
          id: novel_chapter.id,
          name: novel_chapter.name,
          order: novel_chapter.order,
          files: novel_chapter.files.map((f) => {
            const { id, name, order, searched_novel } = f;
            return {
              id,
              name,
              order,
              from_source: {
                id: searched_novel.source.id,
                name: searched_novel.source.name,
              },
            };
          }),
        },
        prev_marker,
        next_marker,
      };
    })();
    const { name, overview } = this.profile;
    const data = {
      id: this.id,
      name,
      overview,
      cur_chapter,
      chapters: novel_chapters.map((chapter) => {
        const { id, name, order, files } = chapter;
        return {
          id,
          name,
          order,
          files: files.map((f) => {
            const { id, name, order, searched_novel } = f;
            return {
              id,
              name,
              order,
              from_source: {
                id: searched_novel.source.id,
                name: searched_novel.source.name,
              },
            };
          }),
        };
      }),
      prev_marker,
      next_marker,
    };
    return Result.Ok(data);
  }
}
