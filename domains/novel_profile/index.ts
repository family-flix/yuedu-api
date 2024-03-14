/**
 * @file 获取小说详情信息
 */

import { DataStore } from "@/domains/store/types";

import { SearchedNovelSectionProfile } from "./types";

interface NovelProfileClientProps {
  store: DataStore;
}
export class NovelProfileClient {
  store: DataStore;

  constructor(props: NovelProfileClientProps) {
    const { store } = props;

    this.store = store;
  }

  /** 获取小说 篇 详情记录 */
  async get_novel_section_profile(values: SearchedNovelSectionProfile, novel_profile: { id: string }) {
    const { unique_id, name, order } = values;
    const section = await this.store.prisma.novel_section_profile.findFirst({
      where: {
        id: unique_id,
      },
    });
    if (section) {
      return section;
    }
    const created = await this.store.prisma.novel_section_profile.create({
      data: {
        id: unique_id,
        name,
        order,
        novel_profile_id: novel_profile.id,
      },
    });
    return created;
  }
}
