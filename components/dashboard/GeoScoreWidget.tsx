"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

interface GeoScoreProps {
  score: number;
  label: string;
}

export function GeoScoreWidget({ score, label }: GeoScoreProps) {
  const { t } = useTranslation();
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const COLORS = ["#00f5d4", "#30363d"];

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-6 relative">
      <h3 className="text-sm font-medium text-foreground/60 mb-4">{label}</h3>
      
      <div className="h-[200px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              startAngle={180}
              endAngle={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-4xl font-bold">{score}</span>
          <span className="text-xs text-foreground/40 uppercase tracking-widest">{t.charts.score}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-accent" />
          <span>{t.charts.visibility}</span>
        </div>
        <span className="text-brand-accent font-medium">{t.charts.storedData}</span>
      </div>
    </div>
  );
}
