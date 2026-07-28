import type { AppointmentStatus, Gender } from "@/generated/prisma/client";

export type CalendarAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  doctorId: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    age: number | null;
    gender: Gender | null;
  };
};

export type DoctorOption = { id: string; firstName: string; lastName: string };
