"use client";

import React, { useState } from "react";
import {
  Settings,
  Volume2,
  Compass,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";

interface SettingsScreenProps {
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onResetData }) => {
  const [density, setDensity] = useState<"spacious" | "normal" | "compact">("normal");
  const [radioChimes, setRadioChimes] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoEscalateThreshold, setAutoEscalateThreshold] = useState("20");
  const [districtSector] = useState("District 01 — Metro Central (23.0225° N, 72.5714° E)");
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Command Platform Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure CAD supervisory thresholds, radio tones, display density, and jurisdiction preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs self-start sm:self-auto"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Operational settings saved successfully for Supervisor Miller.</span>
        </div>
      )}

      {/* Settings Sections on Solid Light Panels */}
      <div className="space-y-4">
        {/* 1. Display & Density */}
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            <Eye className="h-4 w-4 text-indigo-600" />
            <span>Display Density & Video Motion</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Command Grid Table Density
              </label>
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                {(["compact", "normal", "spacious"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDensity(mode)}
                    className={`flex-1 py-1.5 capitalize rounded-md font-semibold transition ${
                      density === mode
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Adjusts table row padding and visual spacing for high-density dispatch screens.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Reduced Motion Simulation
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium text-slate-800 text-xs">
                  Pause ambient video motion and display static posters
                </span>
              </label>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Video components strictly respect OS prefers-reduced-motion media query by default.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Audio & Notifications */}
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            <Volume2 className="h-4 w-4 text-indigo-600" />
            <span>Radio Telemetry & Audio Dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={radioChimes}
                  onChange={(e) => setRadioChimes(e.target.checked)}
                  className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">
                  Enable Critical Alert Radio Chime
                </span>
              </label>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Plays a two-tone alert frequency when an incident is escalated or created.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Auto-Escalation Threshold Timer
              </label>
              <select
                value={autoEscalateThreshold}
                onChange={(e) => setAutoEscalateThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="10">10 Minutes Unassigned</option>
                <option value="15">15 Minutes Unassigned</option>
                <option value="20">20 Minutes Unassigned (Standard)</option>
                <option value="30">30 Minutes Unassigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. District Jurisdiction & Reset */}
        <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Jurisdiction & Data Management</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Active Tactical GIS Operations District
              </label>
              <input
                type="text"
                disabled
                value={districtSector}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-indigo-700 font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div>
                <div className="font-semibold text-slate-900">Reset Local Simulation State</div>
                <div className="text-[11px] text-slate-400">
                  Restores default mock incidents, field units, and chronological feed.
                </div>
              </div>

              <button
                onClick={onResetData}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
