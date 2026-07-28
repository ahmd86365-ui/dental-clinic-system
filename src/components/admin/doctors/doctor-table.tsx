import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DoctorRowActions } from "@/components/admin/doctors/doctor-row-actions";
import type { Doctor } from "@/generated/prisma/client";

export function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الاختصاص</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/doctors/${doctor.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {doctor.firstName} {doctor.lastName}
                </Link>
              </TableCell>
              <TableCell>{doctor.specialty ?? "—"}</TableCell>
              <TableCell dir="ltr" className="text-right">{doctor.phone ?? "—"}</TableCell>
              <TableCell dir="ltr" className="text-right">{doctor.email ?? "—"}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    doctor.isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {doctor.isActive ? "فعّال" : "معطّل"}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <DoctorRowActions doctor={doctor} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
