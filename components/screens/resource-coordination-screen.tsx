"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  Flame,
  Ambulance,
  Radio,
  Fuel,
  Send,
} from "lucide-react";
import { ResponseUnit, Incident, UnitType } from "@/lib/types";

interface ResourceCoordinationScreenProps {
  units: ResponseUnit[];
  incidents: Incident[];
  onOpenDispatchModal: (unit?: ResponseUnit) => void;
  onSelectUnit?: (unit: ResponseUnit) => void;
}

export const ResourceCoordinationScreen: React.FC<ResourceCoordinationScreenProps> = ({
  units,
  incidents,
  onOpenDispatchModal,
  onSelectUnit,
}) => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredUnits = units.filter((u) => {
    const matchesType = selectedType === "all" || u.type === selectedType;
    const matchesStatus = selectedStatus === "all" || u.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const availableCount = units.filter((u) => u.status === "Available").length;
  const deployedCount = units.filter((u) => u.status !== "Available").length;

  const getUnitIcon = (type: UnitType) => {
    switch (type) {
      case "Fire & Rescue":
        return <Flame className="h-4 w-4 text-[#ff6b4a]" />;
      case "Medical / EMS":
        return <Ambulance className="h-4 w-4 text-[#4f9cff]" />;
      case "Police Support":
        return <Shield className="h-4 w-4 text-[#7c6bea]" />;
      default:
        return <Radio className="h-4 w-4 text-[#c9b8f0]" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resource Fleet Coordination
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, battery/fuel reserves, crew rosters, and tactical unit deployment.
          </p>
        </div>

        <button
          onClick={() => onOpenDispatchModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs self-start sm:self-auto"
        >
          <Send className="h-4 w-4" />
          <span>Deploy Field Unit</span>
        </button>
      </div>

      {/* Fleet Overview Metrics in Solid Light Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Fleet</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{units.length} Assets</div>
          <div className="text-[11px] text-slate-500 mt-1">District 01 Motor Pool</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Available Now</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{availableCount} Units</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for instant dispatch</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-blue-700">Deployed In Field</span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">{deployedCount} Active</div>
          <div className="text-[11px] text-blue-600 mt-1">Code 2 & Code 3 responses</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-indigo-700">Operational Readiness</span>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">92.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Fleet telemetry synced</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "Fire & Rescue", "Medical / EMS", "Police Support", "HazMat & Special", "Public Works"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  selectedType === type
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {type === "all" ? "All Divisions" : type}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="En route">En route</option>
            <option value="On scene">On scene</option>
            <option value="Transporting">Transporting</option>
          </select>
        </div>
      </div>

      {/* Unit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => {
          const isAvailable = unit.status === "Available";

          return (
            <div
              key={unit.id}
              className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs hover:border-indigo-300 hover:bg-white/95 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                      {getUnitIcon(unit.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{unit.callsign}</h3>
                      <p className="text-[11px] text-slate-500">{unit.type}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Base:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {unit.currentLocation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vehicle Type:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">
                      {unit.vehicleType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Crew:</span>
                    <span className="font-bold text-slate-900">{unit.crewCount} Certified Personnel</span>
                  </div>

                  {unit.assignedIncidentId && (
                    <div className="flex items-center justify-between font-medium text-indigo-700 bg-indigo-50/70 p-1.5 rounded border border-indigo-100">
                      <span>Assigned Target:</span>
                      <span className="font-mono font-bold">{unit.assignedIncidentId}</span>
                    </div>
                  )}

                  {/* Battery/Fuel Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3 w-3 text-indigo-600" />
                        Fuel / Battery Reserve
                      </span>
                      <span className="font-mono font-bold text-slate-900">{unit.batteryFuelPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          unit.batteryFuelPct > 70
                            ? "bg-emerald-500"
                            : unit.batteryFuelPct > 35
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${unit.batteryFuelPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {unit.id}</span>

                <button
                  onClick={() => onOpenDispatchModal(unit)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isAvailable
                      ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white"
                      : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isAvailable ? "Dispatch Unit" : "Reassign"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceCoordinationScreen;
