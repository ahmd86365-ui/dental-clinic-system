import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHead } from "@/components/admin/sortable-head";
import { formatShortDate } from "@/lib/date-utils";
import { PatientRowActions } from "@/components/admin/patients/patient-row-actions";
import type { Gender, Staff } from "@/generated/prisma/client";

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

type PatientRow = {
  id: string;
  fullName: string;
  phone: string;
  age: number | null;
  gender: Gender | null;
  email: string | null;
  notes: string | null;
  visitCount: number;
  firstVisit: Date | null;
  lastVisit: Date | null;
};

export function PatientsTable({
  patients,
  role,
  sortField,
  sortDir,
}: {
  patients: PatientRow[];
  role: Staff["role"];
  sortField: string;
  sortDir: "asc" | "desc";
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead label="الاسم" field="fullName" sortField={sortField} sortDir={sortDir} />
            <TableHead>الهاتف</TableHead>
            <TableHead>العمر</TableHead>
            <TableHead>الجنس</TableHead>
            <TableHead>عدد الزيارات</TableHead>
            <TableHead>أول زيارة</TableHead>
            <TableHead>آخر زيارة</TableHead>
            <TableHead>ملاحظات</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                لا توجد نتائج مطابقة.
              </TableCell>
            </TableRow>
          )}
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/patients/${patient.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {patient.fullName}
                </Link>
              </TableCell>
              <TableCell dir="ltr" className="text-right">{patient.phone}</TableCell>
              <TableCell>{patient.age ?? "—"}</TableCell>
              <TableCell>{patient.gender ? GENDER_LABELS[patient.gender] : "—"}</TableCell>
              <TableCell>{patient.visitCount}</TableCell>
              <TableCell>
                {patient.firstVisit ? formatShortDate(patient.firstVisit) : "—"}
              </TableCell>
              <TableCell>
                {patient.lastVisit ? formatShortDate(patient.lastVisit) : "—"}
              </TableCell>
              <TableCell className="max-w-40 truncate">{patient.notes || "—"}</TableCell>
              <TableCell className="text-left">
                <PatientRowActions role={role} patient={patient} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
