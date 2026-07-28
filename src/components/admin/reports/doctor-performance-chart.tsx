"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildDoctorColorMap } from "@/lib/doctor-colors";
import { formatCurrency } from "@/lib/date-utils";

type DoctorPerformance = {
  doctorId: string;
  name: string;
  revenue: number;
  appointmentsCompleted: number;
};

export function DoctorPerformanceChart({ data }: { data: DoctorPerformance[] }) {
  const colorMap = useMemo(() => buildDoctorColorMap(data.map((d) => d.doctorId)), [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية بعد
      </div>
    );
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value) => [
                formatCurrency(typeof value === "number" ? value : Number(value ?? 0)),
                "الإيراد",
              ]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                fontSize: "0.8rem",
                direction: "rtl",
              }}
              labelStyle={{ color: "var(--popover-foreground)" }}
            />
            <Bar dataKey="revenue" name="الإيراد" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.doctorId} fill={colorMap.get(entry.doctorId)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-sm">
        {data.map((doctor) => (
          <div key={doctor.doctorId} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colorMap.get(doctor.doctorId) }}
              />
              <span className="truncate">{doctor.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
              <span>{doctor.appointmentsCompleted} موعد مكتمل</span>
              <span className="font-semibold text-foreground">{formatCurrency(doctor.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
