"use client";

import React from "react";
import {
  Plus,
} from "lucide-react";
import { Incident, ResponseUnit } from "@/lib/types";
import { ShinyButton } from "@/components/ui/shiny-button";
import { IncidentQueueTable } from "@/components/overview/incident-queue-table";

interface LiveIncidentsScreenProps {
  incidents: Incident[];
  units: ResponseUnit[];
  onSelectIncident: (incident: Incident) => void;
  onOpenCreateModal: () => void;
  onEscalate: (incident: Incident) => void;
  onNotifyUnits: (incident: Incident) => void;
  onOpenMapRouting: (incident: Incident) => void;
}

export const LiveIncidentsScreen: React.FC<LiveIncidentsScreenProps> = ({
  incidents,
  units,
  onSelectIncident,
  onOpenCreateModal,
  onEscalate,
  onNotifyUnits,
  onOpenMapRouting,
}) => {
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const highCount = incidents.filter((i) => i.severity === "High").length;
  const enRouteCount = incidents.filter((i) => i.status === "En route" || i.status === "On scene").length;

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Live Incident Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active CAD incident queue, status verification, mutual aid triggers, and unit assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ShinyButton
            onClick={onOpenCreateModal}
            fillColor="#0f172a"
            labelColor="#ffffff"
            accentColor="#ff6b4a"
            accentSoftColor="#ffb199"
            className="py-2 px-4 text-xs font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Incident</span>
          </ShinyButton>
        </div>
      </div>

      {/* Quick Summary Pill Bar in Light Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Active Queue</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{incidents.length} Calls</div>
          <div className="text-[11px] text-slate-500 mt-1">District 01 Metro Sector</div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-700">Critical Priority</span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{criticalCount} Urgent</div>
          <div className="text-[11px] text-rose-600 mt-1">Life safety response active</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-700">High Priority</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">{highCount} Calls</div>
          <div className="text-[11px] text-amber-600 mt-1">Major hazards & arterial blocks</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-indigo-700">Units Deployed</span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">{enRouteCount} In Field</div>
          <div className="text-[11px] text-indigo-600 mt-1">En route or on scene</div>
        </div>
      </div>

      {/* Comprehensive Incident Table Component */}
      <IncidentQueueTable
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        onEscalate={onEscalate}
        onNotifyUnits={onNotifyUnits}
        onRouteIncident={onOpenMapRouting}
      />
    </div>
  );
};

export default LiveIncidentsScreen;
