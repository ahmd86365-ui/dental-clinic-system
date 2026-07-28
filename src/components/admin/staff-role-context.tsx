"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StaffRole } from "@/generated/prisma/client";

const StaffRoleContext = createContext<StaffRole>("RECEPTIONIST");

export function StaffRoleProvider({
  role,
  children,
}: {
  role: StaffRole;
  children: ReactNode;
}) {
  return (
    <StaffRoleContext.Provider value={role}>{children}</StaffRoleContext.Provider>
  );
}

export function useStaffRole(): StaffRole {
  return useContext(StaffRoleContext);
}
