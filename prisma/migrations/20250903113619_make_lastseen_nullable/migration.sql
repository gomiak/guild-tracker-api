-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_guild_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "vocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSeen" DATETIME,
    "observation" TEXT
);
INSERT INTO "new_guild_members" ("id", "lastSeen", "level", "name", "observation", "status", "vocation") SELECT "id", "lastSeen", "level", "name", "observation", "status", "vocation" FROM "guild_members";
DROP TABLE "guild_members";
ALTER TABLE "new_guild_members" RENAME TO "guild_members";
CREATE UNIQUE INDEX "guild_members_name_key" ON "guild_members"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
