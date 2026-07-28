import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { hasPermission } from "@/lib/auth/permissions";
import { splitByTime } from "@/lib/date-utils";
import { buildTreatmentTimeline } from "@/lib/timeline";
import { PatientProfileHeader } from "@/components/admin/patients/profile/profile-header";
import { PersonalInfoCard } from "@/components/admin/patients/profile/personal-info-card";
import { MedicalHistoryCard } from "@/components/admin/patients/profile/medical-history-card";
import { Odontogram } from "@/components/admin/patients/profile/odontogram";
import { DentalVisitsSection } from "@/components/admin/patients/profile/dental-visits-section";
import { PatientAppointmentsSection } from "@/components/admin/patients/profile/patient-appointments-section";
import { PatientFilesSection } from "@/components/admin/patients/profile/patient-files-section";
import { TreatmentPlansSection } from "@/components/admin/patients/profile/treatment-plans-section";
import { TreatmentTimeline } from "@/components/admin/patients/profile/treatment-timeline";
import { PatientInvoicesSection } from "@/components/admin/patients/profile/patient-invoices-section";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await getCurrentStaff();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      medicalHistory: true,
      toothConditions: true,
      files: { orderBy: { createdAt: "desc" } },
      dentalVisits: {
        orderBy: { visitDate: "desc" },
        include: { doctor: true },
      },
      appointments: {
        orderBy: { startTime: "desc" },
      },
      treatmentPlans: {
        orderBy: { createdAt: "desc" },
        include: { items: { orderBy: { createdAt: "asc" } } },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!patient) notFound();

  const canEditRecord = hasPermission(staff.role, "editMedicalRecord");
  const canManageTreatmentPlans = hasPermission(staff.role, "manageTreatmentPlans");
  const canCreateInvoice = hasPermission(staff.role, "manageInvoices");

  const { upcoming: upcomingAppointments, previous: previousAppointments } = splitByTime(
    patient.appointments
  );

  const allItems = patient.treatmentPlans.flatMap((plan) => plan.items);
  const invoicedTreatmentItemIds = new Set(
    (
      await prisma.invoiceItem.findMany({
        where: { treatmentItemId: { in: allItems.map((item) => item.id) } },
        select: { treatmentItemId: true },
      })
    )
      .map((row) => row.treatmentItemId)
      .filter((v): v is string => !!v)
  );
  const billableItems = allItems.filter((item) => !invoicedTreatmentItemIds.has(item.id));

  const timelineEntries = buildTreatmentTimeline(patient.dentalVisits, patient.treatmentPlans);

  return (
    <div className="space-y-6">
      <PatientProfileHeader patient={patient} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PersonalInfoCard patient={patient} />
          <Odontogram
            patientId={patient.id}
            conditions={patient.toothConditions}
            canEdit={canEditRecord}
          />
          <TreatmentPlansSection
            patientId={patient.id}
            plans={patient.treatmentPlans}
            canEdit={canManageTreatmentPlans}
          />
          <DentalVisitsSection
            patientId={patient.id}
            visits={patient.dentalVisits}
            canEdit={canEditRecord}
          />
          <TreatmentTimeline entries={timelineEntries} />
        </div>

        <div className="space-y-6">
          <MedicalHistoryCard
            patientId={patient.id}
            history={patient.medicalHistory}
            canEdit={canEditRecord}
          />
          <PatientAppointmentsSection
            upcoming={upcomingAppointments}
            previous={previousAppointments}
          />
          <PatientInvoicesSection
            patientId={patient.id}
            invoices={patient.invoices}
            billableItems={billableItems}
            canCreate={canCreateInvoice}
          />
          <PatientFilesSection
            patientId={patient.id}
            files={patient.files}
            canEdit={canEditRecord}
          />
        </div>
      </div>
    </div>
  );
}
