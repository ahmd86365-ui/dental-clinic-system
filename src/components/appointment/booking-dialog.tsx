"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointment/appointment-form";
import { useClinicSettings } from "@/components/clinic-settings-provider";
import { usePublicI18n } from "@/components/public-i18n-provider";

type BookingDialogContextValue = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const BookingDialogContext = createContext<BookingDialogContextValue>({
  open: false,
  openDialog: () => {},
  closeDialog: () => {},
});

export function useBookingDialog() {
  return useContext(BookingDialogContext);
}

export function BookingDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const settings = useClinicSettings();
  const { dict } = usePublicI18n();

  return (
    <BookingDialogContext.Provider
      value={{
        open,
        openDialog: () => setOpen(true),
        closeDialog: () => setOpen(false),
      }}
    >
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto p-0 sm:max-w-2xl">
          <motion.div
            key={open ? "open" : "closed"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="p-6 sm:p-8"
          >
            <DialogHeader className="items-center gap-1.5 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <CalendarCheck className="size-5" />
              </span>
              <DialogTitle className="mt-2 text-xl font-bold text-primary">
                {dict.booking.dialogTitle}
              </DialogTitle>
              <DialogDescription>
                {dict.booking.descriptionBefore}{" "}
                {settings.clinicName}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <AppointmentForm onSuccess={() => setOpen(false)} />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </BookingDialogContext.Provider>
  );
}
