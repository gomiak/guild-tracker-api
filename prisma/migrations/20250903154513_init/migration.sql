-- CreateTable
CREATE TABLE "public"."guild_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "vocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3),
    "observation" TEXT,

    CONSTRAINT "guild_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_messages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_members_name_key" ON "public"."guild_members"("name");

-- CreateIndex
CREATE UNIQUE INDEX "member_messages_name_key" ON "public"."member_messages"("name");
