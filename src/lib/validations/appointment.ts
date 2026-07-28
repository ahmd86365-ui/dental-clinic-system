import { z } from "zod";
import {
  combineDateAndTime,
  getAllDaySlots,
  isClosedDay,
  todayDateString,
} from "@/lib/appointment-slots";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";

const phoneRegex = /^[0-9+\-\s]{7,20}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export function getAppointmentFormSchema(dict: Dictionary) {
  const messages = dict.booking.validation;

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(3, messages.fullNameMin)
        .max(100, messages.fullNameMax),
      phone: z.string().trim().regex(phoneRegex, messages.phoneInvalid),
      age: z.coerce
        .number({ message: messages.ageRequired })
        .int(messages.ageInt)
        .min(0, messages.ageInvalid)
        .max(120, messages.ageInvalid),
      gender: z.enum(["MALE", "FEMALE"], {
        message: messages.genderRequired,
      }),
      email: z
        .union([z.literal(""), z.string().trim().email(messages.emailInvalid)])
        .optional(),
      reason: z
        .string()
        .trim()
        .min(3, messages.reasonMin)
        .max(300, messages.reasonMax),
      date: z
        .string()
        .min(1, messages.dateRequired)
        .refine((value) => value >= todayDateString(), {
          message: messages.datePast,
        })
        .refine((value) => !isClosedDay(value), {
          message: messages.dateClosed,
        }),
      time: z
        .string()
        .regex(timeRegex, messages.timeInvalid)
        .refine((value) => getAllDaySlots().includes(value), {
          message: messages.timeUnavailable,
        }),
      notes: z.string().trim().max(500, messages.notesMax).optional(),
    })
    .refine(
      (data) => combineDateAndTime(data.date, data.time).getTime() > Date.now(),
      {
        message: messages.timeInThePast,
        path: ["time"],
      }
    );
}

export type AppointmentFormSchema = ReturnType<typeof getAppointmentFormSchema>;
export type AppointmentFormValues = z.infer<AppointmentFormSchema>;
export type AppointmentFormInput = z.input<AppointmentFormSchema>;
