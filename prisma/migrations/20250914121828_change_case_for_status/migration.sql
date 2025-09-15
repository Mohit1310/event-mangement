/*
  Warnings:

  - The values [upcoming,ongoing,completed,cancelled] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,confirmed,used,cancelled,expired] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [general,vip] on the enum `TicketType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EventStatus_new" AS ENUM ('ACTIVE', 'CANCELLED', 'DELETED');
ALTER TABLE "public"."Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Event" ALTER COLUMN "status" TYPE "public"."EventStatus_new" USING ("status"::text::"public"."EventStatus_new");
ALTER TYPE "public"."EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "public"."EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "public"."EventStatus_old";
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TicketStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'USED', 'CANCELLED', 'EXPIRED');
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" TYPE "public"."TicketStatus_new" USING ("status"::text::"public"."TicketStatus_new");
ALTER TYPE "public"."TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "public"."TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TicketType_new" AS ENUM ('GENERAL', 'VIP', 'early_bird');
ALTER TABLE "public"."Ticket" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Ticket" ALTER COLUMN "type" TYPE "public"."TicketType_new" USING ("type"::text::"public"."TicketType_new");
ALTER TYPE "public"."TicketType" RENAME TO "TicketType_old";
ALTER TYPE "public"."TicketType_new" RENAME TO "TicketType";
DROP TYPE "public"."TicketType_old";
ALTER TABLE "public"."Ticket" ALTER COLUMN "type" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Ticket" ALTER COLUMN "type" SET DEFAULT 'GENERAL',
ALTER COLUMN "status" SET DEFAULT 'PENDING';
