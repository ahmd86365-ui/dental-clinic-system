"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAppointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormValues,
} from "@/lib/validations/appointment";
import {
  getAllDaySlots,
  isClosedDay,
  isPastSlot,
  todayDateString,
} from "@/lib/appointment-slots";
import { createAppointment, getBookedSlots } from "@/app/(public)/[lang]/appointment/actions";
import { usePublicI18n } from "@/components/public-i18n-provider";
import { cn } from "@/lib/utils";

const allSlots = getAllDaySlots();

type AppointmentFormProps = {
  onSuccess?: () => void;
};

export function AppointmentForm({ onSuccess }: AppointmentFormProps = {}) {
  const { locale, dict } = usePublicI18n();
  const [isPending, startTransition] = useTransition();
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const schema = useMemo(() => getAppointmentFormSchema(dict), [dict]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    resetField,
    reset,
    setError,
    formState: { errors },
  } = useForm<AppointmentFormInput, unknown, AppointmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      age: undefined,
      gender: undefined,
      email: "",
      reason: "",
      date: todayDateString(),
      time: "",
      notes: "",
    },
  });

  const selectedDate = watch("date");
  const closedDay = selectedDate ? isClosedDay(selectedDate) : false;

  useEffect(() => {
    if (!selectedDate || isClosedDay(selectedDate)) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);

    getBookedSlots(selectedDate)
      .then((slots) => {
        if (!cancelled) setBookedSlots(slots);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  useEffect(() => {
    resetField("time", { defaultValue: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || closedDay) return [];
    return allSlots.filter(
      (slot) =>
        !bookedSlots.includes(slot) && !isPastSlot(selectedDate, slot)
    );
  }, [selectedDate, closedDay, bookedSlots]);

  const onSubmit = (values: AppointmentFormValues) => {
    startTransition(async () => {
      const result = await createAppointment(values, locale);

      if (result.success) {
        toast.success(dict.booking.result.success);
        reset({
          fullName: "",
          phone: "",
          age: undefined,
          gender: undefined,
          email: "",
          reason: "",
          date: todayDateString(),
          time: "",
          notes: "",
        });
        onSuccess?.();
        return;
      }

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof AppointmentFormInput, {
              message: messages[0],
            });
          }
        }
      }

      toast.error(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{dict.booking.form.fullNameLabel}</Label>
          <Input id="fullName" placeholder={dict.booking.form.fullNamePlaceholder} {...register("fullName")} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">{dict.booking.form.phoneLabel}</Label>
          <Input
            id="phone"
            type="tel"
            dir="ltr"
            placeholder="09xxxxxxxx"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="age">{dict.booking.form.ageLabel}</Label>
          <Input id="age" type="number" min={0} max={120} {...register("age")} />
          {errors.age && (
            <p className="text-xs text-destructive">{errors.age.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{dict.booking.form.genderLabel}</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                className="grid grid-cols-2 gap-3 pt-1"
              >
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm",
                    field.value === "MALE" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="MALE" />
                  {dict.booking.form.genderMale}
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm",
                    field.value === "FEMALE" && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value="FEMALE" />
                  {dict.booking.form.genderFemale}
                </label>
              </RadioGroup>
            )}
          />
          {errors.gender && (
            <p className="text-xs text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="email">{dict.booking.form.emailLabel}</Label>
          <Input id="email" type="email" dir="ltr" placeholder="example@email.com" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reason">{dict.booking.form.reasonLabel}</Label>
          <Input id="reason" placeholder={dict.booking.form.reasonPlaceholder} {...register("reason")} />
          {errors.reason && (
            <p className="text-xs text-destructive">{errors.reason.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">{dict.booking.form.dateLabel}</Label>
          <Input
            id="date"
            type="date"
            min={todayDateString()}
            {...register("date")}
          />
          {closedDay && !errors.date && (
            <p className="text-xs text-destructive">
              {dict.booking.form.closedDayMessage}
            </p>
          )}
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{dict.booking.form.timeLabel}</Label>
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={closedDay || availableSlots.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingSlots
                        ? dict.booking.form.timeLoading
                        : availableSlots.length === 0
                          ? dict.booking.form.timeNoSlots
                          : dict.booking.form.timeChoose
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.time && (
            <p className="text-xs text-destructive">{errors.time.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">{dict.booking.form.notesLabel}</Label>
          <Textarea
            id="notes"
            rows={4}
            placeholder={dict.booking.form.notesPlaceholder}
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full gap-2 sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CalendarCheck className="size-4" />
        )}
        {dict.booking.form.submit}
      </Button>
    </form>
  );
}
