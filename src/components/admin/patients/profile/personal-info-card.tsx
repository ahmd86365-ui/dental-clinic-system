"use client";

import { useState } from "react";
import { MapPin, Pencil, Phone, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import { useStaffRole } from "@/components/admin/staff-role-context";
import { PersonalInfoDialog } from "@/components/admin/patients/profile/personal-info-dialog";
import { calculateAge } from "@/lib/date-utils";
import type { Gender } from "@/generated/prisma/client";

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

type PatientPersonalInfo = {
  id: string;
  fullName: string;
  phone: string;
  gender: Gender | null;
  age: number | null;
  dateOfBirth: Date | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function PersonalInfoCard({ patient }: { patient: PatientPersonalInfo }) {
  const role = useStaffRole();
  const [open, setOpen] = useState(false);
  const canEdit = hasPermission(role, "editPatient");

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">المعلومات الشخصية</h2>
        {canEdit && (
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoRow icon={User} label="الاسم الكامل" value={patient.fullName} />
        <InfoRow icon={Phone} label="رقم الهاتف" value={patient.phone} />
        {patient.gender && (
          <InfoRow icon={User} label="الجنس" value={GENDER_LABELS[patient.gender]} />
        )}
        {age !== null && age !== undefined && (
          <InfoRow icon={User} label="العمر" value={`${age} سنة`} />
        )}
        {patient.address && (
          <InfoRow icon={MapPin} label="العنوان" value={patient.address} />
        )}
        {(patient.emergencyContactName || patient.emergencyContactPhone) && (
          <InfoRow
            icon={ShieldAlert}
            label="جهة الاتصال في الطوارئ"
            value={[patient.emergencyContactName, patient.emergencyContactPhone]
              .filter(Boolean)
              .join(" — ")}
          />
        )}
      </div>

      {canEdit && (
        <PersonalInfoDialog open={open} onOpenChange={setOpen} patient={patient} />
      )}
    </div>
  );
}
