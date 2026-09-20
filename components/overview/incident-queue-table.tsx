"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronRight,
  Send,
  Navigation,
} from "lucide-react";
import { Incident, SeverityLevel, IncidentStatus } from "@/lib/types";

interface IncidentQueueTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onEscalate: (incident: Incident) => void;
  onNotifyUnits: (incident: Incident) => void;
  onRouteIncident?: (incident: Incident) => void;
}

export const IncidentQueueTable: React.FC<IncidentQueueTableProps> = ({
  incidents,
  onSelectIncident,
  onEscalate,
  onNotifyUnits,
  onRouteIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.assignedUnits.some((u) => u.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeverity =
        severityFilter === "all" || inc.severity.toLowerCase() === severityFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || inc.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchTerm, severityFilter, statusFilter]);

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
            Critical
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Medium
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case "En route":
        return "text-indigo-700 bg-indigo-50 border-indigo-200";
      case "On scene":
        return "text-purple-700 bg-purple-50 border-purple-200";
      case "Assessing":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "Dispatched":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "Transporting":
        return "text-cyan-700 bg-cyan-50 border-cyan-200";
      case "Resolved":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/85 backdrop-blur-md shadow-xs overflow-hidden text-slate-900">
      {/* Table Header & Controls Bar */}
      <div className="border-b border-slate-100 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live Incident Queue</h3>
            <p className="text-xs text-slate-500">
              Active calls prioritized by CAD telemetry and field reports ({filteredIncidents.length} active)
            </p>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "Critical", "High", "Medium"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  severityFilter === sev
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {sev === "all" ? "All Severity" : sev}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, type, location, or unit..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="En route">En route</option>
              <option value="On scene">On scene</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Assessing">Assessing</option>
              <option value="Transporting">Transporting</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-900">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Incident ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Assigned Units</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No incidents match the active search or filters.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-50/80 transition group cursor-pointer"
                  onClick={() => onSelectIncident(inc)}
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {inc.id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {inc.type}
                  </td>
                  <td className="px-4 py-3">
                    {getSeverityBadge(inc.severity)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate" title={inc.location}>
                    {inc.location}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate italic" title={inc.callerReport}>
                    "{inc.callerReport}"
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono">
                    {inc.timeReceived} <span className="text-[10px] text-slate-400">({inc.timeAgo})</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inc.assignedUnits.map((u, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                        >
                          {u}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                        inc.status
                      )}`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRouteIncident?.(inc)}
                        title="Route Unit to Incident"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onNotifyUnits(inc)}
                        title="Send Radio Notification"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectIncident(inc)}
                        title="View Full Dossier"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onSelectIncident(inc)}
            className="p-4 hover:bg-slate-50 transition cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">{inc.id}</span>
                {getSeverityBadge(inc.severity)}
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                  inc.status
                )}`}
              >
                {inc.status}
              </span>
            </div>

            <div className="font-semibold text-slate-900 text-xs">{inc.type}</div>
            <div className="text-slate-500 text-xs">📍 {inc.location}</div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">{inc.timeReceived}</span>
              <div className="flex items-center gap-1">
                {inc.assignedUnits.map((u, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentQueueTable;

