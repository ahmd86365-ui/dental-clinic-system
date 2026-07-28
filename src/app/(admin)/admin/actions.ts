"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUnseenAppointmentsCount(): Promise<number> {
  return prisma.appointment.count({ where: { seenAt: null } });
}

export async function markAppointmentsSeen(): Promise<void> {
  await prisma.appointment.updateMany({
    where: { seenAt: null },
    data: { seenAt: new Date() },
  });
}
