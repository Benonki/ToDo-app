-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#4A90E2',

    CONSTRAINT "TaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskItem_userId_date_idx" ON "TaskItem"("userId", "date");

-- CreateIndex
CREATE INDEX "TaskItem_userId_startTime_idx" ON "TaskItem"("userId", "startTime");

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
