-- CreateTable
CREATE TABLE "MetaPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "accessPasswordHash" TEXT,
    "showClient" BOOLEAN NOT NULL DEFAULT true,
    "showWallet" BOOLEAN NOT NULL DEFAULT true,
    "showResults" BOOLEAN NOT NULL DEFAULT true,
    "showPlan" BOOLEAN NOT NULL DEFAULT true,
    "dataEn" TEXT,
    "dataAr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MetaPage_slug_key" ON "MetaPage"("slug");
