"use client";

import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ExportTable = { title: string; rows: { label: string; value: string }[] };

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildCsvContent(tables: ExportTable[]): string {
  const lines: string[] = [];
  for (const table of tables) {
    lines.push(`"${table.title}"`);
    lines.push('"البند","القيمة"');
    for (const row of table.rows) {
      lines.push(`"${row.label.replace(/"/g, '""')}","${String(row.value).replace(/"/g, '""')}"`);
    }
    lines.push("");
  }
  // Leading BOM so Arabic text renders correctly when opened in Excel.
  return "﻿" + lines.join("\r\n");
}

export function ExportButtons({
  tables,
  fileNamePrefix,
}: {
  tables: ExportTable[];
  fileNamePrefix: string;
}) {
  const handleExportCsv = () => {
    const csv = buildCsvContent(tables);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${fileNamePrefix}.csv`);
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    for (const table of tables) {
      const sheetData = [["البند", "القيمة"], ...table.rows.map((r) => [r.label, r.value])];
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, table.title.slice(0, 31));
    }
    XLSX.writeFile(workbook, `${fileNamePrefix}.xlsx`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCsv}>
        <FileText className="size-3.5" />
        CSV
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportExcel}>
        <FileSpreadsheet className="size-3.5" />
        Excel
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
        <Printer className="size-3.5" />
        PDF
      </Button>
    </div>
  );
}
