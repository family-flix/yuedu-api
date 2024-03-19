import {
  async_task,
  drive,
  drive_token,
  file,
  PrismaClient,
  settings,
  user,
  media_genre,
  media_country,
  tmp_file,
  novel_profile,
  novel_source,
  novel_chapter_profile,
  searched_chapter,
  searched_novel,
} from "@prisma/client";

export type NovelProfileRecord = novel_profile;
export type NovelChapterProfileRecord = novel_chapter_profile;
export type NovelSourceRecord = novel_source;
export type DriveRecord = drive;
export type DriveTokenRecord = drive_token;
export type FileRecord = file;
export type TmpFileRecord = tmp_file;
export type MediaGenreRecord = media_genre;
export type MediaCountryRecord = media_country;
export type SearchedNovelRecord = searched_novel;
export type SearchedChapterRecord = searched_chapter;

export type AsyncTaskRecord = async_task;
export type RecordCommonPart = {
  id: string;
};
export type UserRecord = user;
export type SettingsRecord = settings;

export type Statistics = {
  drive_count: number;
  drive_total_size_count: number;
  drive_used_size_count: number;
  movie_count: number;
  season_count: number;
  episode_count: number;
  sync_task_count: number;
  /** 今日新增文件 */
  new_file_count_today: number;
  /** 总提交问题数 */
  report_count: number;
  /** 想看 数 */
  media_request_count: number;
  invalid_season_count: number;
  invalid_movie_count: number;
  invalid_sync_task_count: number;
  unknown_media_count: number;
  file_size_count_today: number;
  updated_at: string | null;
};

export type ModelKeys = keyof Omit<
  PrismaClient,
  | "$on"
  | "$connect"
  | "$disconnect"
  | "$use"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$queryRaw"
  | "$queryRawUnsafe"
  | "$transaction"
>;

export type ModelParam<F extends (...args: any[]) => any> = NonNullable<Parameters<F>[number]>;
// @ts-ignore
export type ModelQuery<T extends ModelKeys> = NonNullable<Parameters<PrismaClient[T]["findMany"]>[0]>["where"];
// @ts-ignore
export type ModelUpdateInput<T extends ModelKeys> = NonNullable<Parameters<PrismaClient[T]["update"]>[0]>["data"];
export type DriveWhereInput = NonNullable<ModelQuery<"drive">>;
export type DriveUpdateInput = NonNullable<ModelUpdateInput<"drive">>;
export type MemberWhereInput = NonNullable<ModelQuery<"member">>;

export interface DataStore {
  prisma: PrismaClient;
  // prisma: {
  //   user: {
  //     findFirst: PrismaClient["user"]["findFirst"];
  //   };
  //   settings: {
  //     update: PrismaClient["settings"]["update"];
  //   };
  //   file: {
  //     deleteMany: PrismaClient["file"]["deleteMany"];
  //   };
  //   tmp_file: {
  //     create: PrismaClient["tmp_file"]["create"];
  //     findFirst: PrismaClient["tmp_file"]["findFirst"];
  //     deleteMany: PrismaClient["tmp_file"]["deleteMany"];
  //   };
  //   resource_sync_task: {
  //     update: PrismaClient["resource_sync_task"]["update"];
  //   };
  // };
}
