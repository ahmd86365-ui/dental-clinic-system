import Link from "next/link";
import { ArrowRight, Cake, Phone, User } from "lucide-react";
import { calculateAge } from "@/lib/date-utils";
import type { Gender } from "@/generated/prisma/client";

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

type PatientHeaderData = {
  id: string;
  fullName: string;
  phone: string;
  age: number | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
};

export function PatientProfileHeader({ patient }: { patient: PatientHeaderData }) {
  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age;

  return (
    <div>
      <Link
        href="/admin/patients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowRight className="size-4" />
        العودة إلى قائمة المرضى
      </Link>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{patient.fullName}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              رقم الملف: <span dir="ltr">{patient.id}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-4 text-primary" />
            <span dir="ltr">{patient.phone}</span>
          </span>
          {age !== null && age !== undefined && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Cake className="size-4 text-primary" />
              {age} سنة
            </span>
          )}
          {patient.gender && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {GENDER_LABELS[patient.gender]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
