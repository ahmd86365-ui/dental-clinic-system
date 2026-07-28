/**
 * One-time setup: creates the Supabase Storage buckets used by the app.
 * - patient-files: private (x-rays, clinical photos, PDFs)
 * - clinic-assets: public (logo, favicon, hero image — shown on the public site)
 * Usage: npx tsx scripts/setup-storage.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const BUCKETS: { name: string; public: boolean }[] = [
  { name: "patient-files", public: false },
  { name: "clinic-assets", public: true },
];

async function main() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  for (const bucket of BUCKETS) {
    if (buckets?.some((b) => b.name === bucket.name)) {
      console.log(`Bucket "${bucket.name}" already exists.`);
      continue;
    }

    const { error } = await admin.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: "10MB",
    });

    if (error) {
      console.error(`Failed to create bucket "${bucket.name}":`, error.message);
      process.exit(1);
    }

    console.log(`Bucket "${bucket.name}" created (${bucket.public ? "public" : "private"}).`);
  }
}

main();
