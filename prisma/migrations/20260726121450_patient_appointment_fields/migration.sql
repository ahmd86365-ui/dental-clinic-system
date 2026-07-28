/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - Made the column `reason` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fullName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "reason" SET NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "dateOfBirth",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "fullName" TEXT NOT NULL;
