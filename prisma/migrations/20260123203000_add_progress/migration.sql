-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "accessPasswordHash" TEXT,
    "showClient" BOOLEAN NOT NULL DEFAULT true,
    "showPlan" BOOLEAN NOT NULL DEFAULT true,
    "showCalendar" BOOLEAN NOT NULL DEFAULT true,
    "showAssets" BOOLEAN NOT NULL DEFAULT false,
    "showPayments" BOOLEAN NOT NULL DEFAULT true,
    "showMetaAds" BOOLEAN NOT NULL DEFAULT true,
    "dataEn" TEXT,
    "dataAr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Progress_slug_key" ON "Progress"("slug");
