/*
  Warnings:

  - You are about to drop the column `content` on the `SearchedNovelChapter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SearchedNovelChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content_filepath" TEXT,
    "error" TEXT,
    "searched_novel_id" TEXT NOT NULL,
    "chapter_profile_id" TEXT,
    CONSTRAINT "SearchedNovelChapter_searched_novel_id_fkey" FOREIGN KEY ("searched_novel_id") REFERENCES "SearchedNovel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SearchedNovelChapter_chapter_profile_id_fkey" FOREIGN KEY ("chapter_profile_id") REFERENCES "NovelChapterProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SearchedNovelChapter" ("chapter_profile_id", "created", "error", "id", "name", "order", "searched_novel_id", "unique_id", "updated", "url") SELECT "chapter_profile_id", "created", "error", "id", "name", "order", "searched_novel_id", "unique_id", "updated", "url" FROM "SearchedNovelChapter";
DROP TABLE "SearchedNovelChapter";
ALTER TABLE "new_SearchedNovelChapter" RENAME TO "SearchedNovelChapter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
