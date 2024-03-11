export type NovelChapter = {
  id: string;
  name: string;
  order: number;
  files: {
    id: string;
    name: string;
  }[];
};

export type NovelProfile = {
  id: string;
  name: string;
  overview: string;
  cover_path: string;
  novel_profile_id: string;
};
