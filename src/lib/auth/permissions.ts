import type { StaffRole } from "@/generated/prisma/client";

export type Permission =
  | "manageStaff"
  | "viewAppointments"
  | "createAppointment"
  | "editAppointment"
  | "confirmAppointment"
  | "cancelAppointment"
  | "deleteAppointment"
  | "viewPatients"
  | "createPatient"
  | "editPatient"
  | "deletePatient"
  | "manageServices"
  | "manageSettings"
  | "viewActivityLog"
  | "viewStatistics"
  | "viewMedicalRecord"
  | "editMedicalRecord"
  | "viewBilling"
  | "manageTreatmentPlans"
  | "manageInvoices"
  | "managePayments"
  | "viewReports"
  | "viewClinicSettings";

const DOCTOR_PERMISSIONS: Permission[] = [
  "manageStaff",
  "viewAppointments",
  "createAppointment",
  "editAppointment",
  "confirmAppointment",
  "cancelAppointment",
  "deleteAppointment",
  "viewPatients",
  "createPatient",
  "editPatient",
  "deletePatient",
  "manageServices",
  "manageSettings",
  "viewActivityLog",
  "viewStatistics",
  "viewMedicalRecord",
  "editMedicalRecord",
  "viewBilling",
  "manageTreatmentPlans",
  "manageInvoices",
  "managePayments",
  "viewReports",
  "viewClinicSettings",
];

const RECEPTIONIST_PERMISSIONS: Permission[] = [
  "viewAppointments",
  "createAppointment",
  "editAppointment",
  "confirmAppointment",
  "cancelAppointment",
  "viewPatients",
  "createPatient",
  "editPatient",
  "viewStatistics",
  "viewMedicalRecord",
  "viewBilling",
  "manageInvoices",
  "managePayments",
  "viewReports",
  "viewClinicSettings",
];

// Admin's scope is intentionally limited to staff management per spec — expand
// here if the role should also cover appointments/patients/billing/etc.
const ADMIN_PERMISSIONS: Permission[] = ["manageStaff"];

// Clinical view-only access: can see appointments/patients/medical records to
// assist the doctor, but cannot edit anything or touch billing/staff/settings.
const ASSISTANT_PERMISSIONS: Permission[] = [
  "viewAppointments",
  "viewPatients",
  "viewMedicalRecord",
];
const HYGIENIST_PERMISSIONS: Permission[] = [
  "viewAppointments",
  "viewPatients",
  "viewMedicalRecord",
];

// Billing and reporting only — no access to patients/appointments/medical
// records, matching the accountant's job scope.
const ACCOUNTANT_PERMISSIONS: Permission[] = [
  "viewBilling",
  "manageInvoices",
  "managePayments",
  "viewReports",
  "viewStatistics",
];

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  DOCTOR: DOCTOR_PERMISSIONS,
  RECEPTIONIST: RECEPTIONIST_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  ASSISTANT: ASSISTANT_PERMISSIONS,
  HYGIENIST: HYGIENIST_PERMISSIONS,
  ACCOUNTANT: ACCOUNTANT_PERMISSIONS,
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function assertPermission(role: StaffRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error("لا تملك الصلاحية الكافية لتنفيذ هذا الإجراء");
  }
}
