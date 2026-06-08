"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export function VisibilityTrendChart({ title, data }: { title?: string; data?: { date: string; score: number }[] }) {
  const { t } = useTranslation();
  const chartData = data?.length ? data : [];

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-medium text-foreground/60">{title || t.charts.visibilityIndex}</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-accent/20 border border-brand-accent" />
          <span className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest">{t.charts.thirtyDayTrend}</span>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full rounded-lg border border-dashed border-brand-border bg-brand-primary/30 flex items-center justify-center text-sm text-foreground/40 text-center px-6">
            {t.charts.emptyTrend}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#484f58", fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#484f58", fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "8px" }}
                itemStyle={{ color: "#00f5d4" }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#00f5d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
