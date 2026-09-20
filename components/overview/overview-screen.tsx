"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Shield,
  MapPin,
  Clock,
  Compass,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Incident, ResponseUnit, ActivityEvent } from "@/lib/types";

import { ShinyButton } from "@/components/ui/shiny-button";
import { MetricCard } from "@/components/overview/metric-card";
import { PriorityIncidentCard } from "@/components/overview/priority-incident-card";
import { IncidentQueueTable } from "@/components/overview/incident-queue-table";
import { ResourceAvailabilityCard } from "@/components/overview/resource-availability-card";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { EmergencyMap } from "@/components/emergency-map";
import { AmbientVideoBackground } from "@/components/ambient-video-background";

interface OverviewScreenProps {
  incidents: Incident[];
  units: ResponseUnit[];
  activities: ActivityEvent[];
  onOpenCreateModal: () => void;
  onOpenLiveMap: () => void;
  onSelectIncident: (incident: Incident) => void;
  onEscalateIncident: (incident: Incident) => void;
  onNotifyUnits: (incident: Incident) => void;
  onViewAllResources: () => void;
  onOpenMapRouting: (incident: Incident) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  incidents,
  units,
  activities,
  onOpenCreateModal,
  onOpenLiveMap,
  onSelectIncident,
  onEscalateIncident,
  onNotifyUnits,
  onViewAllResources,
  onOpenMapRouting,
}) => {
  const [syncSeconds, setSyncSeconds] = useState(18);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-increment last synchronized counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSeconds((prev) => (prev >= 59 ? 5 : prev + 3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSyncSeconds(2);
      setIsRefreshing(false);
    }, 600);
  };

  // Find priority incident (structure fire at 14 Meridian Ave) or first critical
  const priorityIncident =
    incidents.find((i) => i.id === "INC-4821") ||
    incidents.find((i) => i.severity === "Critical") ||
    incidents[0];

  const activeIncidentsCount = incidents.filter(i => i.status !== "Resolved").length;
  const criticalHighCount = incidents.filter(i => i.severity === "Critical" || i.severity === "High").length;
  const teamsDeployedCount = units.filter(u => u.status === "En route" || u.status === "On scene").length;

  const dynamicMetrics = [
    {
      title: "Active Incidents",
      value: activeIncidentsCount,
      change: "Live from Supabase",
      iconName: "Flame",
      trend: [activeIncidentsCount, activeIncidentsCount, activeIncidentsCount],
      statusColor: "coral",
    },
    {
      title: "Critical / High Priority",
      value: criticalHighCount,
      change: "Require action",
      iconName: "AlertTriangle",
      trend: [criticalHighCount, criticalHighCount, criticalHighCount],
      statusColor: "amber",
    },
    {
      title: "Teams Deployed",
      value: teamsDeployedCount,
      change: "Field capacity",
      iconName: "ShieldAlert",
      trend: [teamsDeployedCount, teamsDeployedCount, teamsDeployedCount],
      statusColor: "blue",
    },
    {
      title: "Median Dispatch Time",
      value: "06:42",
      change: "Target: under 08:00",
      iconName: "Clock",
      trend: [7.2, 7.0, 6.8],
      statusColor: "emerald",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Screen Hero Area with Continuous Ambient Motion Background Shining Through */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-white/65 backdrop-blur-md p-6 sm:p-8 shadow-xs overflow-hidden min-h-[220px]">
        {/* Subtle accent glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-indigo-700">METRO DISTRICT · LIVE OPERATIONS</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600 font-semibold">CAD TELEMETRY SYNCED</span>
            </div>

            {/* Title */}
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight drop-shadow-xs">
              Emergency response, coordinated.
            </h1>

            {/* Supporting line */}
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Prioritize incidents, deploy resources, and monitor field response from one unified command view.
            </p>

            {/* Status line */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>Last synchronized {syncSeconds} sec ago.</span>
              <button
                onClick={handleManualSync}
                className="rounded p-1 text-slate-400 hover:text-slate-700 transition"
                title="Synchronize CAD Telemetry"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-rose-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {/* Secondary Button */}
            <button
              onClick={onOpenLiveMap}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
            >
              <Compass className="h-4 w-4 text-indigo-600" />
              <span>View Live Map</span>
            </button>

            {/* Primary Action Button via ShinyButton */}
            <ShinyButton
              onClick={onOpenCreateModal}
              fillColor="#0f172a"
              labelColor="#ffffff"
              accentColor="#ff6b4a"
              accentSoftColor="#ffb199"
              className="py-2.5 px-5 text-xs font-semibold shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create Incident</span>
            </ShinyButton>
          </div>
        </div>
      </div>

      {/* Operational Metrics Cards (4 columns) - Solid Light Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicMetrics.map((metric, idx) => (
          <MetricCard key={idx} data={metric as any} />
        ))}
      </div>

      {/* 12-Column Command Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Primary Column (8 columns on desktop) - Solid Panels */}
        <div className="lg:col-span-8 space-y-6">
          {/* Priority Incident Spotlight Panel */}
          {priorityIncident && (
            <PriorityIncidentCard
              incident={priorityIncident}
              onOpenIncident={onSelectIncident}
              onEscalate={onEscalateIncident}
              onNotifyUnits={onNotifyUnits}
            />
          )}

          {/* Live Incident Queue Table */}
          <IncidentQueueTable
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            onEscalate={onEscalateIncident}
            onNotifyUnits={onNotifyUnits}
            onRouteIncident={onOpenMapRouting}
          />
        </div>

        {/* Right / Auxiliary Column (4 columns on desktop) - Solid Panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resource Availability Card */}
          <ResourceAvailabilityCard units={units} onViewAllResources={onViewAllResources} />

          {/* Tactical GIS Map Preview Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md p-4 shadow-xs text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tactical GIS Map</h3>
              </div>
              <button
                onClick={onOpenLiveMap}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
              >
                <span>Open Full Map</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Embedded Live Leaflet Map Preview */}
            <div className="rounded-lg overflow-hidden border border-slate-200">
              <EmergencyMap
                incidents={incidents}
                units={units}
                selectedIncident={priorityIncident}
                onSelectIncident={onSelectIncident}
                height="280px"
                showControls={false}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>District 01 Metro Sector</span>
              <span className="font-semibold text-indigo-600">OSRM & Geoapify Online</span>
            </div>
          </div>

          {/* Chronological Activity Feed */}
          <ActivityFeed
            activities={activities}
            onSelectIncidentById={(id) => {
              const target = incidents.find((i) => i.id === id);
              if (target) onSelectIncident(target);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;
