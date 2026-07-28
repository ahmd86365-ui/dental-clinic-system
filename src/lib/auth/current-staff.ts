import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Staff } from "@/generated/prisma/client";

export async function getCurrentStaff(): Promise<Staff> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staff = await prisma.staff.findUnique({ where: { id: user.id } });

  if (!staff || !staff.isActive) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return staff;
}
