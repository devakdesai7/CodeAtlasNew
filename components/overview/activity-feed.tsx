"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Send,
  Layers,
} from "lucide-react";
import { ActivityEvent } from "@/lib/types";

interface ActivityFeedProps {
  activities: ActivityEvent[];
  onSelectIncidentById?: (id: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  onSelectIncidentById,
}) => {
  const getActivityIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "escalation":
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
      case "arrival":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case "dispatch":
        return <Send className="h-3.5 w-3.5 text-indigo-600" />;
      case "system":
        return <Layers className="h-3.5 w-3.5 text-purple-600" />;
      case "resource":
        return <Radio className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md p-4 shadow-xs text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Chronological Dispatch Feed</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Live CAD Stream</span>
      </div>

      {/* Escalation Warning Banner in Light Theme */}
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-700">Automated Queue Watchdog:</span> Incident INC-4819 reached
          escalation threshold due to blocked transport corridors. Supervisor review recommended.
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="relative flex items-start gap-3 pl-2 group"
          >
            {/* Timeline dot */}
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
              {getActivityIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-slate-900 truncate">
                  {act.title}
                </span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {act.timestamp}
                </span>
              </div>

              {act.description && (
                <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                  {act.description}
                </p>
              )}

              {act.relatedIncidentId && (
                <button
                  onClick={() => onSelectIncidentById?.(act.relatedIncidentId!)}
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Target: {act.relatedIncidentId}</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
