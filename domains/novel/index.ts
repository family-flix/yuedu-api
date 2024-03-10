import { DataStore } from "@/domains/store/types";
import { r_id } from "@/utils";

export class NovelCore {
  store: DataStore;

  constructor(props: { store: DataStore }) {
    const { store } = props;
    this.store = store;
  }

  async get_novel_chapter(
    chapter_profile: { id: string; name: string; order: number; text_count: number; updated_at: string },
    novel: { id: string }
  ) {
//     const store = this.store;
//     const { id, name, order, text_count, updated_at } = chapter_profile;
//     const chapter_record = await store.prisma.novel_chapter.findFirst({
//       where: {
//         profile: {
//           id,
//         },
//       },
//     });
//     if (chapter_record) {
//       return chapter_record;
//     }
//     const created = await store.prisma.novel_chapter.create({
//       data: {
//         id: r_id(),
//         name,
//         order,
//         text_count,
//         updated_at,
//         novel_id: novel.id,
//         profile_id: id,
//       },
//     });
//     return created;
  }
}
