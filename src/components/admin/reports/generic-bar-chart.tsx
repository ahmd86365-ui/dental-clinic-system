"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/date-utils";

type LabelValue = { label: string; value: number };

export function GenericBarChart({
  data,
  valueLabel,
  color = "var(--chart-1)",
  layout = "vertical",
  valueFormat = "number",
}: {
  data: LabelValue[];
  valueLabel: string;
  color?: string;
  layout?: "vertical" | "horizontal";
  /** "currency" runs values through the app's shared ar-SY currency formatter; passed as a
   *  string (not a function) since this component is a Client Component and functions can't
   *  cross the server/client boundary as props. */
  valueFormat?: "number" | "currency";
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات كافية بعد
      </div>
    );
  }

  const isHorizontalBars = layout === "horizontal";
  const format = (value: number) => (valueFormat === "currency" ? formatCurrency(value) : String(value));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isHorizontalBars ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 8, left: isHorizontalBars ? 12 : -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={!isHorizontalBars}
            vertical={isHorizontalBars}
            stroke="var(--border)"
          />
          {isHorizontalBars ? (
            <>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="var(--muted-foreground)"
                tickFormatter={format}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={110}
                stroke="var(--muted-foreground)"
              />
            </>
          ) : (
            <>
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
                tickFormatter={format}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value ?? 0);
              return [format(num), valueLabel];
            }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "0.8rem",
              direction: "rtl",
            }}
            labelStyle={{ color: "var(--popover-foreground)" }}
          />
          <Bar
            dataKey="value"
            name={valueLabel}
            fill={color}
            radius={isHorizontalBars ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
