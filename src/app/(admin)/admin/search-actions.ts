"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { getVisibleNotificationTypes } from "@/lib/notifications";
import { STAFF_ROLE_LABELS } from "@/lib/staff-roles";
import { PAYMENT_METHOD_LABELS } from "@/lib/billing-labels";
import { formatCurrency } from "@/lib/date-utils";
import { toDateKey } from "@/lib/calendar-utils";

export type SearchCategory =
  | "patient"
  | "appointment"
  | "treatmentPlan"
  | "visit"
  | "invoice"
  | "payment"
  | "staff"
  | "notification";

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  /** Pre-formatted, already localized — the client never re-formats dates. */
  date: string | null;
  href: string;
};

export type SearchResultGroup = {
  category: SearchCategory;
  items: SearchResultItem[];
};

const RESULTS_PER_CATEGORY = 5;
const MIN_QUERY_LENGTH = 2;

// Every category except "notification" (which uses getVisibleNotificationTypes,
// mirroring the notifications center's own per-type permission logic instead
// of a single blanket permission).
const CATEGORY_PERMISSION: Record<Exclude<SearchCategory, "notification">, Permission> = {
  patient: "viewPatients",
  appointment: "viewAppointments",
  treatmentPlan: "viewMedicalRecord",
  visit: "viewMedicalRecord",
  invoice: "viewBilling",
  payment: "viewBilling",
  staff: "manageStaff",
};

export async function globalSearch(query: string): Promise<SearchResultGroup[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const staff = await getCurrentStaff();
  const can = (category: Exclude<SearchCategory, "notification">) =>
    hasPermission(staff.role, CATEGORY_PERMISSION[category]);
  const visibleNotificationTypes = getVisibleNotificationTypes(staff.role);

  const [
    patients,
    appointments,
    treatmentPlans,
    visits,
    invoices,
    payments,
    staffMembers,
    notifications,
  ] = await Promise.all([
    can("patient")
      ? prisma.patient.findMany({
          where: {
            OR: [
              { fullName: { contains: trimmed, mode: "insensitive" } },
              { phone: { contains: trimmed } },
              { email: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          select: { id: true, fullName: true, phone: true },
          take: RESULTS_PER_CATEGORY,
          orderBy: { fullName: "asc" },
        })
      : Promise.resolve([]),
    can("appointment")
      ? prisma.appointment.findMany({
          where: {
            OR: [
              { reason: { contains: trimmed, mode: "insensitive" } },
              { notes: { contains: trimmed, mode: "insensitive" } },
              { patient: { fullName: { contains: trimmed, mode: "insensitive" } } },
            ],
          },
          include: { patient: true },
          take: RESULTS_PER_CATEGORY,
          orderBy: { startTime: "desc" },
        })
      : Promise.resolve([]),
    can("treatmentPlan")
      ? prisma.treatmentPlan.findMany({
          where: {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { diagnosis: { contains: trimmed, mode: "insensitive" } },
              { patient: { fullName: { contains: trimmed, mode: "insensitive" } } },
            ],
          },
          include: { patient: true },
          take: RESULTS_PER_CATEGORY,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    can("visit")
      ? prisma.dentalVisit.findMany({
          where: {
            OR: [
              { diagnosis: { contains: trimmed, mode: "insensitive" } },
              { chiefComplaint: { contains: trimmed, mode: "insensitive" } },
              { patient: { fullName: { contains: trimmed, mode: "insensitive" } } },
            ],
          },
          include: { patient: true },
          take: RESULTS_PER_CATEGORY,
          orderBy: { visitDate: "desc" },
        })
      : Promise.resolve([]),
    can("invoice")
      ? prisma.invoice.findMany({
          where: {
            OR: [
              { invoiceNumber: { contains: trimmed, mode: "insensitive" } },
              { patient: { fullName: { contains: trimmed, mode: "insensitive" } } },
            ],
          },
          include: { patient: true },
          take: RESULTS_PER_CATEGORY,
          orderBy: { issueDate: "desc" },
        })
      : Promise.resolve([]),
    can("payment")
      ? prisma.payment.findMany({
          where: {
            OR: [
              { notes: { contains: trimmed, mode: "insensitive" } },
              { invoice: { invoiceNumber: { contains: trimmed, mode: "insensitive" } } },
              { invoice: { patient: { fullName: { contains: trimmed, mode: "insensitive" } } } },
            ],
          },
          include: { invoice: { include: { patient: true } } },
          take: RESULTS_PER_CATEGORY,
          orderBy: { paidAt: "desc" },
        })
      : Promise.resolve([]),
    can("staff")
      ? prisma.staff.findMany({
          where: {
            OR: [
              { fullName: { contains: trimmed, mode: "insensitive" } },
              { email: { contains: trimmed, mode: "insensitive" } },
              { phone: { contains: trimmed, mode: "insensitive" } },
              { jobTitle: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          take: RESULTS_PER_CATEGORY,
          orderBy: { fullName: "asc" },
        })
      : Promise.resolve([]),
    visibleNotificationTypes.length > 0
      ? prisma.notification.findMany({
          where: {
            type: { in: visibleNotificationTypes },
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { message: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          take: RESULTS_PER_CATEGORY,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const groups: SearchResultGroup[] = [
    {
      category: "patient",
      items: patients.map((p) => ({
        id: p.id,
        title: p.fullName,
        subtitle: p.phone,
        date: null,
        href: `/admin/patients/${p.id}`,
      })),
    },
    {
      category: "appointment",
      items: appointments.map((a) => ({
        id: a.id,
        title: a.patient.fullName,
        subtitle: a.reason,
        date: formatDate(a.startTime),
        href: `/admin/appointments?view=day&date=${toDateKey(a.startTime)}`,
      })),
    },
    {
      category: "treatmentPlan",
      items: treatmentPlans.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.patient.fullName,
        date: formatDate(t.createdAt),
        href: `/admin/patients/${t.patientId}#treatment-plans`,
      })),
    },
    {
      category: "visit",
      items: visits.map((v) => ({
        id: v.id,
        title: v.diagnosis || v.chiefComplaint || "زيارة سريرية",
        subtitle: v.patient.fullName,
        date: formatDate(v.visitDate),
        href: `/admin/patients/${v.patientId}#dental-visits`,
      })),
    },
    {
      category: "invoice",
      items: invoices.map((i) => ({
        id: i.id,
        title: i.invoiceNumber,
        subtitle: `${i.patient.fullName} — ${formatCurrency(i.total)}`,
        date: formatDate(i.issueDate),
        href: `/admin/billing/${i.id}`,
      })),
    },
    {
      category: "payment",
      items: payments.map((p) => ({
        id: p.id,
        title: `${formatCurrency(p.amount)} — ${PAYMENT_METHOD_LABELS[p.method]}`,
        subtitle: `${p.invoice.patient.fullName} — ${p.invoice.invoiceNumber}`,
        date: formatDate(p.paidAt),
        href: `/admin/billing/${p.invoiceId}`,
      })),
    },
    {
      category: "staff",
      items: staffMembers.map((s) => ({
        id: s.id,
        title: s.fullName,
        subtitle: s.jobTitle || STAFF_ROLE_LABELS[s.role],
        date: null,
        href: `/admin/staff/${s.id}`,
      })),
    },
    {
      category: "notification",
      items: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: n.message,
        date: formatDate(n.createdAt),
        href: n.link || "/admin/notifications",
      })),
    },
  ];

  return groups.filter((g) => g.items.length > 0);
}

const shortDateFormatter = new Intl.DateTimeFormat("ar-SY", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(date: Date): string {
  return shortDateFormatter.format(date);
}
