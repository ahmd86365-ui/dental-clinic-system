"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AppointmentStatus } from "@/generated/prisma/client";
import {
  APPOINTMENT_STATUS_CHART_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointment-status";

type StatusCount = {
  status: AppointmentStatus;
  count: number;
};

export function StatusDonutChart({ data }: { data: StatusCount[] }) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: APPOINTMENT_STATUS_LABELS[item.status],
      value: item.count,
      color: APPOINTMENT_STATUS_CHART_COLORS[item.status],
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية بعد
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="var(--card)" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "0.8rem",
              direction: "rtl",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", direction: "rtl" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
