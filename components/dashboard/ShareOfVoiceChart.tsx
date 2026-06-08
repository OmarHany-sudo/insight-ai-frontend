"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export function ShareOfVoiceChart({ title, data }: { title?: string; data?: { name: string; value: number; color?: string }[] }) {
  const { t } = useTranslation();
  const chartData = data?.filter((item) => item.value > 0) || [];

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-6 h-full">
      <h3 className="text-sm font-medium text-foreground/60 mb-6">{title || t.charts.shareOfVoice}</h3>
      
      <div className="h-[250px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full rounded-lg border border-dashed border-brand-border bg-brand-primary/30 flex items-center justify-center text-sm text-foreground/40 text-center px-6">
            {t.charts.emptyShare}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || ["#00f5d4", "#3b82f6", "#a855f7", "#30363d"][index % 4]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px" }}
                itemStyle={{ color: "#f0f6fc" }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
