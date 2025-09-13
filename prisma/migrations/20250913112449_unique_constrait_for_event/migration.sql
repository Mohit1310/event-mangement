/*
  Warnings:

  - A unique constraint covering the columns `[id,createdById]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_id_createdById_key" ON "public"."Event"("id", "createdById");
