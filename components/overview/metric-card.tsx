"use client";

import React from "react";
import { Flame, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { MetricCardData } from "@/lib/types";

interface MetricCardProps {
  data: MetricCardData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Flame":
        return <Flame className="h-4 w-4 text-rose-500" />;
      case "AlertTriangle":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "ShieldAlert":
        return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      case "Clock":
        return <Clock className="h-4 w-4 text-emerald-500" />;
      default:
        return <Flame className="h-4 w-4 text-indigo-500" />;
    }
  };

  // Generate lightweight SVG sparkline in indigo
  const renderSparkline = (trend: number[]) => {
    if (!trend || trend.length < 2) return null;
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = trend
      .map((val, idx) => {
        const x = (idx / (trend.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return (
      <svg
        width={width}
        height={height}
        className="overflow-visible stroke-indigo-600 fill-none"
        aria-hidden="true"
      >
        <polyline
          points={points}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs hover:border-indigo-300 hover:bg-white/95 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {data.title}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
          {getIcon(data.iconName)}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {data.value}
        </div>
        <div>{renderSparkline(data.trend)}</div>
      </div>

      <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        <span>{data.change}</span>
      </div>
    </div>
  );
};

export default MetricCard;

