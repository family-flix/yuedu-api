-- CreateTable
CREATE TABLE "Drive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "type" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "remark" TEXT,
    "avatar" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "total_size" REAL DEFAULT 0,
    "used_size" REAL DEFAULT 0,
    "invalid" INTEGER DEFAULT 0,
    "hidden" INTEGER DEFAULT 0,
    "sort" INTEGER DEFAULT 0,
    "latest_analysis" DATETIME,
    "root_folder_name" TEXT,
    "root_folder_id" TEXT,
    "drive_token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Drive_drive_token_id_fkey" FOREIGN KEY ("drive_token_id") REFERENCES "DriveToken" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Drive_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriveToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,
    "expired_at" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "NovelSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rule" TEXT NOT NULL DEFAULT '{}',
    "user_id" TEXT NOT NULL,
    CONSTRAINT "NovelSource_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchedNovel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "chapter_count" INTEGER NOT NULL DEFAULT 0,
    "profile_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    CONSTRAINT "SearchedNovel_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "NovelProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SearchedNovel_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "NovelSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchedNovelChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "error" TEXT,
    "searched_novel_id" TEXT NOT NULL,
    "chapter_profile_id" TEXT,
    CONSTRAINT "SearchedNovelChapter_searched_novel_id_fkey" FOREIGN KEY ("searched_novel_id") REFERENCES "SearchedNovel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SearchedNovelChapter_chapter_profile_id_fkey" FOREIGN KEY ("chapter_profile_id") REFERENCES "NovelChapterProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NovelProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "cover_path" TEXT NOT NULL,
    "chapter_count" INTEGER NOT NULL,
    "in_production" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    CONSTRAINT "NovelProfile_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "NovelAuthor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NovelSectionProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "novel_profile_id" TEXT NOT NULL,
    CONSTRAINT "NovelSectionProfile_novel_profile_id_fkey" FOREIGN KEY ("novel_profile_id") REFERENCES "NovelProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NovelChapterProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text_count" INTEGER NOT NULL,
    "updated_at" TEXT NOT NULL,
    "novel_profile_id" TEXT NOT NULL,
    "novel_section_profile_id" TEXT NOT NULL,
    CONSTRAINT "NovelChapterProfile_novel_profile_id_fkey" FOREIGN KEY ("novel_profile_id") REFERENCES "NovelProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NovelChapterProfile_novel_section_profile_id_fkey" FOREIGN KEY ("novel_section_profile_id") REFERENCES "NovelSectionProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NovelAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "avatar_path" TEXT
);

-- CreateTable
CREATE TABLE "Novel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "novel_profile_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Novel_novel_profile_id_fkey" FOREIGN KEY ("novel_profile_id") REFERENCES "NovelProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Novel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MediaCountry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AsyncTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 1,
    "desc" TEXT,
    "percent" REAL NOT NULL DEFAULT 0,
    "percent_text" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "need_stop" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "output_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "AsyncTask_output_id_fkey" FOREIGN KEY ("output_id") REFERENCES "Output" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AsyncTask_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Output" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filepath" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Output_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "duration" REAL NOT NULL DEFAULT 0,
    "progress" REAL NOT NULL DEFAULT 0,
    "novel_id" TEXT NOT NULL,
    "novel_chapter_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "PlayHistory_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayHistory_novel_chapter_id_fkey" FOREIGN KEY ("novel_chapter_id") REFERENCES "NovelChapterProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayHistory_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "SearchedNovelChapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayHistory_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SharedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "pwd" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "SharedFile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriveCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_at" DATETIME,
    "drive_id" TEXT NOT NULL,
    CONSTRAINT "DriveCheckIn_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "Drive" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TmpFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" REAL NOT NULL DEFAULT 2,
    "name" TEXT NOT NULL,
    "file_id" TEXT,
    "parent_paths" TEXT NOT NULL,
    "drive_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "TmpFile_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "Drive" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TmpFile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_file_id" TEXT NOT NULL,
    "parent_paths" TEXT NOT NULL,
    "type" INTEGER NOT NULL DEFAULT 3,
    "size" REAL NOT NULL DEFAULT 0,
    "md5" TEXT,
    "drive_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "File_drive_id_fkey" FOREIGN KEY ("drive_id") REFERENCES "Drive" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "remark" TEXT NOT NULL,
    "permission" TEXT,
    "disabled" INTEGER NOT NULL DEFAULT 0,
    "delete" INTEGER NOT NULL DEFAULT 0,
    "inviter_id" TEXT,
    "from_invite_id" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Member_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_from_invite_id_fkey" FOREIGN KEY ("from_invite_id") REFERENCES "MemberInvite" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    "expired_at" TEXT NOT NULL,
    "count_limit" INTEGER,
    "disabled" INTEGER NOT NULL DEFAULT 0,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "MemberInvite_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberAuthentication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_arg1" TEXT,
    "provider_arg2" TEXT,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "MemberAuthentication_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "used" REAL DEFAULT 0,
    "expired_at" TEXT,
    "invalid" INTEGER NOT NULL DEFAULT 0,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "MemberToken_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "MemberSetting_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desc" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemberNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "content" TEXT,
    "type" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "is_delete" INTEGER NOT NULL DEFAULT 0,
    "member_id" TEXT NOT NULL,
    CONSTRAINT "MemberNotification_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unique_id" TEXT NOT NULL,
    "content" TEXT,
    "type" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "is_delete" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL DEFAULT '{}',
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Credential_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT,
    "avatar" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detail" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Drive_user_id_unique_id_key" ON "Drive"("user_id", "unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "MediaGenre_id_key" ON "MediaGenre"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MediaCountry_id_key" ON "MediaCountry"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AsyncTask_output_id_key" ON "AsyncTask"("output_id");

-- CreateIndex
CREATE UNIQUE INDEX "Member_user_id_inviter_id_remark_key" ON "Member"("user_id", "inviter_id", "remark");

-- CreateIndex
CREATE UNIQUE INDEX "MemberSetting_member_id_key" ON "MemberSetting"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "Statistics_user_id_key" ON "Statistics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_provider_account_id_key" ON "Account"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_email_key" ON "Credential"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_user_id_key" ON "Credential"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_user_id_key" ON "Settings"("user_id");
