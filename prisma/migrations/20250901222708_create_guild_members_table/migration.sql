-- CreateTable
CREATE TABLE "guild_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "vocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "observation" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_members_name_key" ON "guild_members"("name");
