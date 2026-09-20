"use client";

import React from "react";
import {
  X,
  MapPin,
  Send,
  Navigation,
  Droplets,
  Layers,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Incident } from "@/lib/types";

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onEscalate: (incident: Incident) => void;
  onNotifyUnits: (incident: Incident) => void;
  onOpenMapRouting?: (incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onEscalate,
  onNotifyUnits,
  onOpenMapRouting,
}) => {
  if (!incident) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm shadow-sm ${
                incident.severity === "Critical"
                  ? "bg-[#ff6b4a]"
                  : incident.severity === "High"
                  ? "bg-[#f5b544] text-slate-950"
                  : "bg-[#4f9cff]"
              }`}
            >
              {incident.id.split("-")[1]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{incident.id}</h2>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    incident.severity === "Critical"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : incident.severity === "High"
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {incident.severity}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  {incident.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {incident.type} · Received {incident.timeReceived} ({incident.timeAgo})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Location & Coordinates Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4 text-[#ff6b4a]" />
                <span>{incident.location}</span>
              </div>
              <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                Coordinates: {incident.coordinates.lat.toFixed(5)}, {incident.coordinates.lon.toFixed(5)}
              </div>
            </div>

            {onOpenMapRouting && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMapRouting(incident);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4f46e5] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4338ca] transition self-start sm:self-auto shadow-sm"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Open in Tactical GIS</span>
              </button>
            )}
          </div>

          {/* Telemetry Quad in Solid Light Slate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">Commander</span>
              <div className="mt-1 font-bold text-slate-800 truncate">
                {incident.incidentCommander || "Unassigned"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hydrant Status</span>
              <div className="mt-1 font-bold text-slate-800 flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                <span className="truncate">{incident.hydrantStatus || "Adequate"}</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">Evac Radius</span>
              <div className="mt-1 font-bold text-slate-800">
                {incident.evacuationRadiusMeters ? `${incident.evacuationRadiusMeters}m Zone` : "None"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400">Duplicate Reports</span>
              <div className="mt-1 font-bold text-slate-800 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>{incident.duplicateReportsCount || 1} Merged</span>
              </div>
            </div>
          </div>

          {/* Caller Report */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-1.5">Initial Dispatch & Caller Telemetry</h4>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-700 leading-relaxed font-normal">
              {incident.callerReport}
            </div>
          </div>

          {/* AI-Assisted Recommendation */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
              <Zap className="h-4 w-4 text-[#ff6b4a]" />
              <span>AI-Assisted Operational Recommendation</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              "{incident.aiRecommendation}"
            </p>
          </div>

          {/* Assigned Units */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-1.5">Assigned Field Units</h4>
            <div className="flex flex-wrap gap-2">
              {incident.assignedUnits.length > 0 ? (
                incident.assignedUnits.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{u}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 italic">No units assigned yet.</span>
              )}
            </div>
          </div>

          {/* Chronological Incident Timeline */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Event Timeline</h4>
            <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
              {incident.timeline.map((item, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                    <span>{item.time}</span>
                    <span className="font-sans font-semibold text-indigo-700">{item.actor}</span>
                  </div>
                  <div className="text-slate-800 font-medium mt-0.5">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3">
          <button
            onClick={() => onEscalate(incident)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Escalate Priority</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNotifyUnits(incident)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              <Send className="h-4 w-4 text-[#ff6b4a]" />
              <span>Notify Units Code 3</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
