import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { StaffRowActions } from "@/components/admin/staff/staff-row-actions";
import { STAFF_ROLE_LABELS } from "@/lib/staff-roles";
import type { Staff } from "@/generated/prisma/client";

export function StaffTable({
  staff,
  currentStaffId,
}: {
  staff: Staff[];
  currentStaffId: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/staff/${member.id}`}
                  className="flex items-center gap-2.5 hover:text-primary hover:underline"
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.avatarUrl ?? undefined} alt={member.fullName} />
                    <AvatarFallback>{member.fullName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  {member.fullName}
                </Link>
                {member.id === currentStaffId && (
                  <span className="mr-2 text-xs text-muted-foreground">(أنت)</span>
                )}
              </TableCell>
              <TableCell dir="ltr" className="text-right">{member.email}</TableCell>
              <TableCell dir="ltr" className="text-right">{member.phone ?? "—"}</TableCell>
              <TableCell>{STAFF_ROLE_LABELS[member.role]}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    member.isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {member.isActive ? "فعّال" : "معطّل"}
                </span>
              </TableCell>
              <TableCell className="text-left">
                <StaffRowActions staff={member} isSelf={member.id === currentStaffId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
