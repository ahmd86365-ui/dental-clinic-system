"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { assertPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/activity-log";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  dentalVisitSchema,
  medicalHistorySchema,
  personalInfoSchema,
  toothConditionSchema,
  type DentalVisitInput,
  type MedicalHistoryInput,
  type PersonalInfoValues,
  type ToothConditionValues,
} from "@/lib/validations/medical-record";

type ActionResult = { success: true } | { success: false; error: string };

const STORAGE_BUCKET = "patient-files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function revalidateProfile(patientId: string) {
  revalidatePath(`/admin/patients/${patientId}`);
  revalidatePath("/admin/patients");
}

// ---------------------------------------------------------------------------
// Personal information
// ---------------------------------------------------------------------------

export async function updatePersonalInfo(
  patientId: string,
  input: PersonalInfoValues
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editPatient");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل بيانات المرضى" };
  }

  const parsed = personalInfoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  await prisma.patient.update({
    where: { id: patientId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      address: data.address || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_PATIENT",
    entityType: "Patient",
    entityId: patientId,
    description: `تم تعديل البيانات الشخصية للمريض: ${data.fullName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Medical history
// ---------------------------------------------------------------------------

export async function upsertMedicalHistory(
  patientId: string,
  input: MedicalHistoryInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل السجل الطبي" };
  }

  const parsed = medicalHistorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  await prisma.medicalHistory.upsert({
    where: { patientId },
    create: {
      patientId,
      allergies: data.allergies,
      chronicDiseases: data.chronicDiseases,
      currentMedications: data.currentMedications,
      previousSurgeries: data.previousSurgeries,
      smokingStatus: data.smokingStatus,
      isPregnant: data.isPregnant,
      bloodType: data.bloodType,
      medicalNotes: data.medicalNotes || undefined,
      updatedByStaffId: staff.id,
    },
    update: {
      allergies: data.allergies,
      chronicDiseases: data.chronicDiseases,
      currentMedications: data.currentMedications,
      previousSurgeries: data.previousSurgeries,
      smokingStatus: data.smokingStatus ?? null,
      isPregnant: data.isPregnant ?? null,
      bloodType: data.bloodType ?? null,
      medicalNotes: data.medicalNotes || null,
      updatedByStaffId: staff.id,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_MEDICAL_HISTORY",
    entityType: "MedicalHistory",
    entityId: patientId,
    description: `تم تحديث السجل الطبي للمريض: ${patient.fullName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Dental visits
// ---------------------------------------------------------------------------

export async function createDentalVisit(
  patientId: string,
  input: DentalVisitInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية إضافة سجل زيارة" };
  }

  const parsed = dentalVisitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const doctor =
    (await prisma.doctor.findFirst()) ??
    (await prisma.doctor.create({
      data: { firstName: "خليل", lastName: "الجمعة", specialty: "طب وتجميل الأسنان" },
    }));

  const visit = await prisma.dentalVisit.create({
    data: {
      patientId,
      doctorId: doctor.id,
      visitDate: new Date(data.visitDate),
      chiefComplaint: data.chiefComplaint || undefined,
      diagnosis: data.diagnosis || undefined,
      treatmentPlan: data.treatmentPlan || undefined,
      proceduresPerformed: data.proceduresPerformed,
      prescriptions: data.prescriptions || undefined,
      clinicalNotes: data.clinicalNotes || undefined,
      followUpNotes: data.followUpNotes || undefined,
      cost: data.cost,
      createdByStaffId: staff.id,
    },
  });

  await logActivity(staff, {
    action: "CREATE_DENTAL_VISIT",
    entityType: "DentalVisit",
    entityId: visit.id,
    description: `تم تسجيل زيارة سريرية جديدة للمريض: ${patient.fullName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function updateDentalVisit(
  visitId: string,
  patientId: string,
  input: DentalVisitInput
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل سجل الزيارة" };
  }

  const parsed = dentalVisitSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "الرجاء التحقق من البيانات" };
  const data = parsed.data;

  const visit = await prisma.dentalVisit.findUnique({ where: { id: visitId } });
  if (!visit) return { success: false, error: "الزيارة غير موجودة" };

  await prisma.dentalVisit.update({
    where: { id: visitId },
    data: {
      visitDate: new Date(data.visitDate),
      chiefComplaint: data.chiefComplaint || null,
      diagnosis: data.diagnosis || null,
      treatmentPlan: data.treatmentPlan || null,
      proceduresPerformed: data.proceduresPerformed,
      prescriptions: data.prescriptions || null,
      clinicalNotes: data.clinicalNotes || null,
      followUpNotes: data.followUpNotes || null,
      cost: data.cost ?? null,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_DENTAL_VISIT",
    entityType: "DentalVisit",
    entityId: visitId,
    description: "تم تعديل سجل زيارة سريرية",
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function deleteDentalVisit(
  visitId: string,
  patientId: string
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف سجل الزيارة" };
  }

  const visit = await prisma.dentalVisit.findUnique({ where: { id: visitId } });
  if (!visit) return { success: false, error: "الزيارة غير موجودة" };

  await prisma.dentalVisit.delete({ where: { id: visitId } });

  await logActivity(staff, {
    action: "DELETE_DENTAL_VISIT",
    entityType: "DentalVisit",
    entityId: visitId,
    description: "تم حذف سجل زيارة سريرية",
  });

  revalidateProfile(patientId);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Odontogram
// ---------------------------------------------------------------------------

export async function updateToothCondition(
  patientId: string,
  input: ToothConditionValues
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية تعديل مخطط الأسنان" };
  }

  const parsed = toothConditionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "بيانات غير صحيحة" };
  const data = parsed.data;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  await prisma.toothCondition.upsert({
    where: { patientId_toothNumber: { patientId, toothNumber: data.toothNumber } },
    create: {
      patientId,
      toothNumber: data.toothNumber,
      condition: data.condition,
      notes: data.notes || undefined,
      updatedByStaffId: staff.id,
    },
    update: {
      condition: data.condition,
      notes: data.notes || null,
      updatedByStaffId: staff.id,
    },
  });

  await logActivity(staff, {
    action: "UPDATE_TOOTH_CONDITION",
    entityType: "ToothCondition",
    entityId: patientId,
    description: `تم تحديث حالة السن رقم ${data.toothNumber} للمريض: ${patient.fullName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Files (Supabase Storage)
// ---------------------------------------------------------------------------

export async function uploadPatientFile(formData: FormData): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية رفع الملفات" };
  }

  const patientId = String(formData.get("patientId") || "");
  const fileType = String(formData.get("fileType") || "OTHER") as
    | "XRAY"
    | "CLINICAL_PHOTO"
    | "PDF"
    | "OTHER";
  const file = formData.get("file");

  if (!patientId || !(file instanceof File)) {
    return { success: false, error: "بيانات الملف غير صحيحة" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "حجم الملف يتجاوز 10 ميغابايت" };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { success: false, error: "نوع الملف غير مدعوم (الصور وPDF فقط)" };
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "bin";
  const storagePath = `patients/${patientId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: "تعذّر رفع الملف، الرجاء المحاولة مرة أخرى" };
  }

  await prisma.patientFile.create({
    data: {
      patientId,
      fileName: file.name,
      fileType,
      storagePath,
      fileSize: file.size,
      uploadedByStaffId: staff.id,
    },
  });

  await logActivity(staff, {
    action: "UPLOAD_PATIENT_FILE",
    entityType: "PatientFile",
    entityId: patientId,
    description: `تم رفع ملف (${file.name}) للمريض: ${patient.fullName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function deletePatientFile(
  fileId: string,
  patientId: string
): Promise<ActionResult> {
  const staff = await getCurrentStaff();

  try {
    assertPermission(staff.role, "editMedicalRecord");
  } catch {
    return { success: false, error: "لا تملك صلاحية حذف الملفات" };
  }

  const file = await prisma.patientFile.findUnique({ where: { id: fileId } });
  if (!file) return { success: false, error: "الملف غير موجود" };

  const admin = createAdminClient();
  await admin.storage.from(STORAGE_BUCKET).remove([file.storagePath]);
  await prisma.patientFile.delete({ where: { id: fileId } });

  await logActivity(staff, {
    action: "DELETE_PATIENT_FILE",
    entityType: "PatientFile",
    entityId: patientId,
    description: `تم حذف ملف: ${file.fileName}`,
  });

  revalidateProfile(patientId);
  return { success: true };
}

export async function getPatientFileUrl(storagePath: string): Promise<string | null> {
  await getCurrentStaff();
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data) return null;
  return data.signedUrl;
}
