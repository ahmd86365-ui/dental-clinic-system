-- Step 1: add all new white-label columns (workingHours nullable for now)
ALTER TABLE "ClinicSettings"
ADD COLUMN     "city" TEXT,
ADD COLUMN     "clinicDescription" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "doctorName" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "workingHours" JSONB,
ADD COLUMN     "xUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- Step 2: migrate existing single open/close/closedWeekdays into the new
-- per-day workingHours JSON structure, preserving current data.
UPDATE "ClinicSettings"
SET "workingHours" = jsonb_build_array(
  jsonb_build_object('day', 0, 'open', "openTime", 'close', "closeTime", 'closed', (0 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 1, 'open', "openTime", 'close', "closeTime", 'closed', (1 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 2, 'open', "openTime", 'close', "closeTime", 'closed', (2 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 3, 'open', "openTime", 'close', "closeTime", 'closed', (3 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 4, 'open', "openTime", 'close', "closeTime", 'closed', (4 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 5, 'open', "openTime", 'close', "closeTime", 'closed', (5 = ANY("closedWeekdays"))),
  jsonb_build_object('day', 6, 'open', "openTime", 'close', "closeTime", 'closed', (6 = ANY("closedWeekdays")))
)
WHERE "workingHours" IS NULL;

-- Step 3: drop the superseded columns
ALTER TABLE "ClinicSettings"
DROP COLUMN "closeTime",
DROP COLUMN "closedWeekdays",
DROP COLUMN "openTime";
