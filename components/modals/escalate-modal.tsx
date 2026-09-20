"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Incident } from "@/lib/types";

interface EscalateModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmEscalate: (incident: Incident, reason: string) => void;
}

export const EscalateModal: React.FC<EscalateModalProps> = ({
  incident,
  isOpen,
  onClose,
  onConfirmEscalate,
}) => {
  const [reason, setReason] = useState(
    "Structural degradation / heavy fire spread on upper levels. Secondary mutual aid required."
  );

  if (!isOpen || !incident) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-rose-300 bg-white p-5 shadow-2xl text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirm Incident Escalation</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3 text-xs text-slate-600">
          <div className="rounded-xl bg-rose-50 p-3 border border-rose-200">
            <span className="font-semibold text-rose-900 block">
              Escalating {incident.id} ({incident.type})
            </span>
            <span className="text-rose-700 text-[11px] mt-0.5 block leading-relaxed">
              This will elevate priority to <strong>CRITICAL</strong>, alert all District 01 watch
              captains, and trigger immediate Mutual Aid protocols.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Supervisor Escalation Log Justification
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmEscalate(incident, reason);
              onClose();
            }}
            className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-sm flex items-center gap-1.5"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Confirm Escalation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EscalateModal;
