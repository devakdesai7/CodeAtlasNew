"use client";

import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { ResponseUnit, Incident } from "@/lib/types";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: ResponseUnit[];
  incidents: Incident[];
  onConfirmDispatch: (unitId: string, incidentId: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  units,
  incidents,
  onConfirmDispatch,
}) => {
  const availableUnits = units.filter((u) => u.status === "Available");
  const [selectedUnitId, setSelectedUnitId] = useState(availableUnits[0]?.id || units[0]?.id || "");
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0]?.id || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !selectedIncidentId) return;
    onConfirmDispatch(selectedUnitId, selectedIncidentId);
    onClose();
  };

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Deploy Field Unit</h3>
              <p className="text-xs text-slate-500">Dispatch available response team to target call</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Unit to Deploy</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.callsign} ({u.type}) — Status: {u.status} (Fuel: {u.batteryFuelPct}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Incident Location</label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none font-semibold"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.id} — {inc.location} ({inc.type} · {inc.severity})
                </option>
              ))}
            </select>
          </div>

          {selectedUnit && selectedIncident && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-1.5 text-slate-700">
              <div className="font-semibold text-indigo-950 flex items-center justify-between">
                <span>Deployment Summary</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                  Priority Route
                </span>
              </div>
              <div className="text-slate-900">
                <strong>Unit:</strong> {selectedUnit.callsign} · {selectedUnit.crewCount} crew
              </div>
              <div className="text-slate-900">
                <strong>Location:</strong> {selectedIncident.location}
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Estimated arrival time will be broadcasted to field telemetry upon acknowledgment.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700 transition shadow-sm flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Confirm & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DispatchModal;
