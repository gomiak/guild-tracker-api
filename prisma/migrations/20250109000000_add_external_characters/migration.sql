-- CreateTable
CREATE TABLE "external_characters" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL,
    "vocation" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'offline',
    "lastSeen" TIMESTAMP(3),
    "isExited" BOOLEAN NOT NULL DEFAULT false,
    "isExternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_characters_name_key" ON "external_characters"("name");

-- CreateIndex
CREATE INDEX "external_characters_status_idx" ON "external_characters"("status");

-- CreateIndex
CREATE INDEX "external_characters_isExternal_idx" ON "external_characters"("isExternal");
