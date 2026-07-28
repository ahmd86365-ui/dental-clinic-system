"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LabelValue = { label: string; value: number };

export function GenericAreaChart({
  data,
  valueLabel,
  color = "var(--turquoise)",
}: {
  data: LabelValue[];
  valueLabel: string;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية بعد
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="reportsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
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
          />
          <Tooltip
            formatter={(value) => [typeof value === "number" ? value : Number(value ?? 0), valueLabel]}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "0.8rem",
              direction: "rtl",
            }}
            labelStyle={{ color: "var(--popover-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={color}
            strokeWidth={2}
            fill="url(#reportsAreaFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
