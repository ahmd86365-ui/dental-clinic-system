/**
 * One-time bootstrap: creates the first DOCTOR account (Supabase Auth user + Staff row).
 * Usage: npx tsx scripts/create-doctor.ts <email> <password> <fullName>
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../src/lib/prisma";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function main() {
  const [email, password, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(" ") || "خليل الجمعة";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-doctor.ts <email> <password> <fullName>");
    process.exit(1);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    console.error("Failed to create auth user:", error?.message);
    process.exit(1);
  }

  await prisma.staff.upsert({
    where: { email },
    create: { id: data.user.id, fullName, email, role: "DOCTOR" },
    update: { fullName, role: "DOCTOR", isActive: true },
  });

  console.log(`Doctor account created: ${email}`);
  await prisma.$disconnect();
}

main();
