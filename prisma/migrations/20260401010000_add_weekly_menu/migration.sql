-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "nbPersons" INTEGER NOT NULL DEFAULT 2,
    "restrictions" TEXT,
    "budget" TEXT NOT NULL DEFAULT 'moyen',
    "meals" TEXT NOT NULL,
    "shoppingList" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "colocId" TEXT NOT NULL,

    CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeeklyMenu" ADD CONSTRAINT "WeeklyMenu_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "Colocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "WeeklyMenu_colocId_weekStart_idx" ON "WeeklyMenu"("colocId", "weekStart" DESC);
