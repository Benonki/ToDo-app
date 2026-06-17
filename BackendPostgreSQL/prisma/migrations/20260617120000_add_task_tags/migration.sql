-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToTaskItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_normalizedName_key" ON "Tag"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToTaskItem_AB_unique" ON "_TagToTaskItem"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToTaskItem_B_index" ON "_TagToTaskItem"("B");

-- AddForeignKey
ALTER TABLE "_TagToTaskItem" ADD CONSTRAINT "_TagToTaskItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTaskItem" ADD CONSTRAINT "_TagToTaskItem_B_fkey" FOREIGN KEY ("B") REFERENCES "TaskItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
