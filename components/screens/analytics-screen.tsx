"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
} from "lucide-react";
import { Incident, ResponseUnit } from "@/lib/types";
import { AmbientVideoBackground } from "@/components/ambient-video-background";

interface AnalyticsScreenProps {
  incidents: Incident[];
  units: ResponseUnit[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ incidents, units }) => {
  const [timeRange, setTimeRange] = useState("Last 24 Hours");

  const incidentCounts = incidents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalIncidents = incidents.length || 1;
  const incidentTypesData = Object.entries(incidentCounts)
    .map(([type, count], idx) => {
      const colors = ["bg-[#ff6b4a]", "bg-[#f5b544]", "bg-[#4f9cff]", "bg-[#7c6bea]", "bg-[#aab0c5]"];
      return {
        type,
        count,
        pct: Math.round((count / totalIncidents) * 100),
        color: colors[idx % colors.length],
      };
    })
    .sort((a, b) => b.count - a.count);

  const getHour = (timeString: string) => {
    const match = timeString.match(/(\d+):(\d+)\s(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h;
    }
    return 0;
  };

  const currentHour = new Date().getHours();
  const hourlyTrends = Array.from({ length: 8 }, (_, i) => {
    const hour = (currentHour - 14 + i * 2 + 24) % 24;
    const hourStr = `${hour.toString().padStart(2, "0")}:00`;
    const count = incidents.filter((inc) => {
      const incH = getHour(inc.timeReceived);
      return incH === hour || incH === (hour + 1) % 24;
    }).length;
    return { hour: hourStr, incidents: count, avgResponseMin: 6.0 };
  });

  const affectedZones = [
    { zone: "Sector A (North Arterial)", risk: "High", activeCalls: Math.ceil(incidents.length * 0.4), avgArrival: "5m 40s" },
    { zone: "Sector B (Downtown Commercial)", risk: "Critical", activeCalls: Math.floor(incidents.length * 0.3), avgArrival: "6m 12s" },
    { zone: "Sector C (Harbor Transit Bore)", risk: "Medium", activeCalls: Math.floor(incidents.length * 0.2), avgArrival: "7m 05s" },
    { zone: "Sector D (East Industrial Park)", risk: "Moderate", activeCalls: Math.floor(incidents.length * 0.1), avgArrival: "6m 48s" },
  ];

  const activeUnits = units.filter(u => u.status !== "Available").length;
  const unitUtilizationPct = units.length > 0 ? ((activeUnits / units.length) * 100).toFixed(1) : "0.0";


  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Header with Reference B Ambient Motion Background */}
      <div className="relative rounded-2xl border border-slate-200/90 bg-white/70 backdrop-blur-md p-6 shadow-xs overflow-hidden min-h-[140px]">
        {/* Reference B Video Background */}
        <AmbientVideoBackground
          src="/media/original-e6c90943d3d9da57b997c2898244009e.mp4"
          poster="/media/poster-b.png"
          opacity={0.35}
          overlayStrength={0.82}
          playbackSpeed={0.7}
          theme="light"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Operational Analytics & Telemetry
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Historical dispatch durations, call volume trends, mutual aid triggers, and sector load metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none shadow-xs"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Monthly Review">Monthly Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 KPI Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Median Dispatch Response
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">06:42</span>
            <span className="text-xs font-semibold text-emerald-600">(-18s under target)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Target standard: Under 08:00 minutes</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Field Unit Utilization
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-600">{unitUtilizationPct}%</span>
            <span className="text-xs font-semibold text-slate-500">({activeUnits} of {units.length} active)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Optimal operational threshold: 75% - 85%</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CAD Call Resolution Rate
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">96.4%</span>
            <span className="text-xs font-semibold text-emerald-600">(First-dispatch code)</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Mutual aid escalation rate: 3.6%</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Volume & Response Times */}
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hourly Incident Volume & Response Time</h3>
              <p className="text-xs text-slate-500">Volume (bars) vs average response in minutes (line)</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600">Peak: 08:00</span>
          </div>

          {/* Lightweight Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
            {hourlyTrends.map((item, idx) => {
              const maxVal = 14;
              const heightPct = (item.incidents / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono text-slate-500 group-hover:font-bold group-hover:text-slate-900">
                    {item.incidents}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-md h-36 flex items-end overflow-hidden border-t border-x border-slate-200">
                    <div
                      className="w-full bg-indigo-600 group-hover:bg-indigo-500 transition-all rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Type Distribution */}
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Incident Distribution by Category</h3>
            <p className="text-xs text-slate-500">Breakdown of priority calls dispatched in current shift</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {incidentTypesData.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.type}</span>
                  <span className="font-mono text-slate-500">
                    <strong className="text-slate-900">{item.count} calls</strong> ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Affected District Zones Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Coverage & Zone Vulnerability</h3>
            <p className="text-xs text-slate-500">
              Corridor congestion index and average time-to-scene
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-900">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Sector Zone</th>
                <th className="px-4 py-2.5">Risk Rating</th>
                <th className="px-4 py-2.5">Active Incidents</th>
                <th className="px-4 py-2.5">Avg Time to Scene</th>
                <th className="px-4 py-2.5">Mutual Aid Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {affectedZones.map((z, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{z.zone}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        z.risk === "Critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : z.risk === "High"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {z.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                    {z.activeCalls} Calls
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{z.avgArrival}</td>
                  <td className="px-4 py-2.5 text-emerald-600 font-medium">Auto-dispatch armed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
