/*
  Warnings:

  - Added the required column `updatedAt` to the `BoardItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_colocId_createdAt_idx";

-- DropIndex
DROP INDEX "WeeklyMenu_colocId_weekStart_idx";

-- AlterTable
ALTER TABLE "BoardItem" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "size" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ShopItem" ADD COLUMN     "colorHex" TEXT,
ADD COLUMN     "depthCm" INTEGER,
ADD COLUMN     "furnitureCategory" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layer" TEXT,
ADD COLUMN     "modelKey" TEXT,
ADD COLUMN     "roomConstraint" TEXT,
ADD COLUMN     "spriteName" TEXT,
ADD COLUMN     "widthCm" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hideOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideStats" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rankPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seasonNumber" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UserColoc" ADD COLUMN     "awayConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "awayStartDate" TIMESTAMP(3),
ADD COLUMN     "isAway" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lazyBadge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lazyTasksDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyUntil" TIMESTAMP(3),
ADD COLUMN     "penaltyXpMult" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "AvatarConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinTone" TEXT NOT NULL DEFAULT 'medium',
    "body" TEXT NOT NULL DEFAULT 'default',
    "hair" TEXT,
    "eyes" TEXT NOT NULL DEFAULT 'default',
    "top" TEXT,
    "bottom" TEXT,
    "shoes" TEXT,
    "accessory" TEXT,
    "savedOutfit" JSONB,

    CONSTRAINT "AvatarConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonRecord" (
    "id" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "finalRank" TEXT NOT NULL,
    "finalPoints" INTEGER NOT NULL,
    "rewardType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SeasonRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacedFurniture" (
    "id" TEXT NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posZ" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roomId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,
    "placedById" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacedFurniture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotifyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "profileUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicStory" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "albumArt" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "caption" TEXT,
    "reactions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,

    CONSTRAINT "MusicStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT '✅',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "block" TEXT NOT NULL DEFAULT 'anytime',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenaltyLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,

    CONSTRAINT "PenaltyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Briefing" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rawHtml" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "sources" JSONB,
    "evalText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Briefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwayVote" (
    "id" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "voterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AwayVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvatarConfig_userId_key" ON "AvatarConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonRecord_userId_seasonNumber_key" ON "SeasonRecord"("userId", "seasonNumber");

-- CreateIndex
CREATE INDEX "PlacedFurniture_colocId_idx" ON "PlacedFurniture"("colocId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_userId_key" ON "SpotifyAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_spotifyUserId_key" ON "SpotifyAccount"("spotifyUserId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_userId_date_key" ON "HabitLog"("habitId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Briefing_date_key" ON "Briefing"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AwayVote_voterId_targetId_colocId_key" ON "AwayVote"("voterId", "targetId", "colocId");

-- AddForeignKey
ALTER TABLE "AvatarConfig" ADD CONSTRAINT "AvatarConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonRecord" ADD CONSTRAINT "SeasonRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacedFurniture" ADD CONSTRAINT "PlacedFurniture_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "Colocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacedFurniture" ADD CONSTRAINT "PlacedFurniture_placedById_fkey" FOREIGN KEY ("placedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacedFurniture" ADD CONSTRAINT "PlacedFurniture_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotifyAccount" ADD CONSTRAINT "SpotifyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicStory" ADD CONSTRAINT "MusicStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicStory" ADD CONSTRAINT "MusicStory_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "Colocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "Colocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyLog" ADD CONSTRAINT "PenaltyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyLog" ADD CONSTRAINT "PenaltyLog_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "Colocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
