/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profilePicture" TEXT,
ALTER COLUMN "lastName" SET NOT NULL;

-- CreateTable
CREATE TABLE "TrainLine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TrainLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainStop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addressNumber" INTEGER NOT NULL,
    "addressStreet" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "trainId" INTEGER NOT NULL,

    CONSTRAINT "TrainStop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainStop" ADD CONSTRAINT "TrainStop_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "TrainLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
