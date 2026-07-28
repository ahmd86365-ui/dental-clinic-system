"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
      <Printer className="size-4" />
      طباعة / تصدير PDF
    </Button>
  );
}
