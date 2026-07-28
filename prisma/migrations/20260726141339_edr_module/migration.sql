-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('NON_SMOKER', 'SMOKER', 'FORMER_SMOKER');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "ToothConditionType" AS ENUM ('HEALTHY', 'MISSING', 'CARIES', 'ROOT_CANAL', 'FILLING', 'CROWN', 'BRIDGE', 'IMPLANT', 'EXTRACTION', 'FRACTURE', 'NEEDS_TREATMENT', 'COMPLETED_TREATMENT');

-- CreateEnum
CREATE TYPE "PatientFileType" AS ENUM ('XRAY', 'CLINICAL_PHOTO', 'PDF', 'OTHER');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT;

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronicDiseases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentMedications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "previousSurgeries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smokingStatus" "SmokingStatus",
    "isPregnant" BOOLEAN,
    "bloodType" "BloodType",
    "medicalNotes" TEXT,
    "updatedByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DentalVisit" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaint" TEXT,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "proceduresPerformed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prescriptions" TEXT,
    "clinicalNotes" TEXT,
    "followUpNotes" TEXT,
    "cost" DOUBLE PRECISION,
    "createdByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DentalVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToothCondition" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "condition" "ToothConditionType" NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "updatedByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToothCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFile" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "PatientFileType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedByStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalHistory_patientId_key" ON "MedicalHistory"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DentalVisit_appointmentId_key" ON "DentalVisit"("appointmentId");

-- CreateIndex
CREATE INDEX "DentalVisit_patientId_idx" ON "DentalVisit"("patientId");

-- CreateIndex
CREATE INDEX "DentalVisit_doctorId_idx" ON "DentalVisit"("doctorId");

-- CreateIndex
CREATE INDEX "DentalVisit_visitDate_idx" ON "DentalVisit"("visitDate");

-- CreateIndex
CREATE INDEX "ToothCondition_patientId_idx" ON "ToothCondition"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "ToothCondition_patientId_toothNumber_key" ON "ToothCondition"("patientId", "toothNumber");

-- CreateIndex
CREATE INDEX "PatientFile_patientId_idx" ON "PatientFile"("patientId");

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DentalVisit" ADD CONSTRAINT "DentalVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DentalVisit" ADD CONSTRAINT "DentalVisit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DentalVisit" ADD CONSTRAINT "DentalVisit_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothCondition" ADD CONSTRAINT "ToothCondition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFile" ADD CONSTRAINT "PatientFile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
