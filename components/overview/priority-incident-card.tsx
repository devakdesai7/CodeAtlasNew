"use client";

import React from "react";
import {
  Flame,
  AlertTriangle,
  Radio,
  Droplets,
  Clock,
  ChevronRight,
  Send,
  Zap,
} from "lucide-react";
import { Incident } from "@/lib/types";

interface PriorityIncidentCardProps {
  incident: Incident;
  onOpenIncident: (incident: Incident) => void;
  onEscalate: (incident: Incident) => void;
  onNotifyUnits: (incident: Incident) => void;
}

export const PriorityIncidentCard: React.FC<PriorityIncidentCardProps> = ({
  incident,
  onOpenIncident,
  onEscalate,
  onNotifyUnits,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-200/90 bg-white/85 backdrop-blur-md p-5 sm:p-6 shadow-xs text-slate-900">
      {/* Restrained emergency top accent line in coral */}
      <div className="absolute left-0 top-0 h-1 w-full bg-rose-500" />

      {/* Header with severity badge and incident ID */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="rounded bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 uppercase tracking-wide">
            Priority Incident · {incident.severity}
          </span>
          <span className="font-mono text-xs font-bold text-slate-900">{incident.id}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          <span>Received {incident.timeReceived} ({incident.timeAgo})</span>
        </div>
      </div>

      {/* Title & Location */}
      <div className="mt-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Flame className="h-5 w-5 text-rose-500 shrink-0" />
          <span>
            {incident.type} at {incident.location}
          </span>
        </h3>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {incident.callerReport}
        </p>
      </div>

      {/* Telemetry Matrix Grid in Light Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="block text-[10px] uppercase font-semibold text-slate-400">
            Commander
          </span>
          <span className="mt-0.5 block font-bold text-slate-900 truncate">
            {incident.incidentCommander || "Unassigned"}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="block text-[10px] uppercase font-semibold text-slate-400">
            Hydrant Flow
          </span>
          <span className="mt-0.5 block font-bold text-slate-900 flex items-center gap-1">
            <Droplets className="h-3 w-3 text-blue-500" />
            <span className="truncate">{incident.hydrantStatus || "Adequate"}</span>
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="block text-[10px] uppercase font-semibold text-slate-400">
            Evac Radius
          </span>
          <span className="mt-0.5 block font-bold text-slate-900">
            {incident.evacuationRadiusMeters ? `${incident.evacuationRadiusMeters}m Zone` : "None"}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
          <span className="block text-[10px] uppercase font-semibold text-slate-400">
            Active Response
          </span>
          <span className="mt-0.5 block font-bold text-slate-900">
            {incident.assignedUnits.length} Teams ({incident.status})
          </span>
        </div>
      </div>

      {/* AI-assisted Operational Recommendation */}
      <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>AI-Assisted Operational Recommendation</span>
          <span className="text-[10px] text-indigo-400 font-normal ml-auto">
            Demo Telemetry
          </span>
        </div>
        <p className="text-slate-800 leading-relaxed font-sans">
          "{incident.aiRecommendation}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenIncident(incident)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
          >
            <span>Open Incident</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => onEscalate(incident)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Escalate</span>
          </button>
        </div>

        <button
          onClick={() => onNotifyUnits(incident)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition shadow-xs"
        >
          <Send className="h-3.5 w-3.5 text-indigo-600 group-hover:text-white" />
          <span>Notify Units</span>
        </button>
      </div>
    </div>
  );
};

export default PriorityIncidentCard;
