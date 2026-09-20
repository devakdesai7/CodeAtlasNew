"use client";

import React, { useState, useCallback } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Sidebar, NavSection } from "@/components/layout/sidebar";
import { OverviewScreen } from "@/components/overview/overview-screen";
import { LiveIncidentsScreen } from "@/components/screens/live-incidents-screen";
import { ResourceCoordinationScreen } from "@/components/screens/resource-coordination-screen";
import { MapCoverageScreen } from "@/components/screens/map-coverage-screen";
import { AnalyticsScreen } from "@/components/screens/analytics-screen";
import { SettingsScreen } from "@/components/screens/settings-screen";
import { CreateIncidentModal } from "@/components/modals/create-incident-modal";
import { IncidentDetailModal } from "@/components/modals/incident-detail-modal";
import { EscalateModal } from "@/components/modals/escalate-modal";
import { DispatchModal } from "@/components/modals/dispatch-modal";
import { Incident, ResponseUnit, ActivityEvent } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { mapIncident, mapResource, mapAlert, toDBIncidentType, toDBSeverity, toDBStatus, toDBUnitStatus } from "@/lib/mapper";
import { CheckCircle2, AlertTriangle, Send } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message?: string;
}

export const AppShell: React.FC = () => {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<NavSection>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Platform Data State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<ResponseUnit[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);



  // Modal Overlays
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<Incident | null>(null);
  const [incidentToEscalate, setIncidentToEscalate] = useState<Incident | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [preselectedUnitForDispatch, setPreselectedUnitForDispatch] = useState<ResponseUnit | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sound synthesizer for emergency radio tones
  const playAlertTone = useCallback((type: "notify" | "escalate" | "create") => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "escalate") {
        // High alert two-tone beep (880Hz -> 1046Hz)
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1046, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else {
        // Calm radio acknowledgment chirp (650Hz -> 780Hz)
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch (e) {
      // AudioContext might be blocked until user gesture, ignore safely
    }
  }, []);

  const addToast = useCallback((type: "success" | "warning" | "info", title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Supabase Data Fetching & Realtime
  React.useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      // 1. Fetch Incidents
      const { data: dbIncidents, error: incErr } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!incErr && dbIncidents && mounted) {
        setIncidents(dbIncidents.map(mapIncident));
      }

      // 2. Fetch Resources
      const { data: dbResources, error: resErr } = await supabase
        .from("resources")
        .select("*");
      
      if (!resErr && dbResources && mounted) {
        setUnits(dbResources.map(mapResource));
      }

      // 3. Fetch Alerts
      const { data: dbAlerts, error: altErr } = await supabase
        .from("alerts")
        .select("*")
        .order("triggered_at", { ascending: false });
      
      if (!altErr && dbAlerts && mounted) {
        setActivities(dbAlerts.map(mapAlert));
      }
    };

    fetchInitialData();

    // Setup Subscriptions
    const incidentSub = supabase.channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newInc = mapIncident(payload.new as any);
          setIncidents(prev => [newInc, ...prev]);
          addToast("warning", "New Incident Detected", `ML Pipeline classified a new incident: ${newInc.type}`);
        } else if (payload.eventType === 'UPDATE') {
          const updatedInc = mapIncident(payload.new as any);
          setIncidents(prev => prev.map(i => i.id === updatedInc.id ? updatedInc : i));
        }
      })
      .subscribe();

    const resourceSub = supabase.channel('public:resources')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const unit = mapResource(payload.new as any);
          setUnits(prev => {
            const exists = prev.find(u => u.id === unit.id);
            if (exists) return prev.map(u => u.id === unit.id ? unit : u);
            return [...prev, unit];
          });
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(incidentSub);
      supabase.removeChannel(resourceSub);
    };
  }, [addToast]);

  // ACTIONS
  // 1. Create Incident
  const handleCreateIncident = async (newIncident: Incident) => {
    const { error: incError } = await supabase.from("incidents").insert({
      id: newIncident.id,
      incident_type: toDBIncidentType(newIncident.type),
      description: newIncident.callerReport,
      source: newIncident.location,
      latitude: newIncident.coordinates.lat,
      longitude: newIncident.coordinates.lon,
      severity: toDBSeverity(newIncident.severity),
      status: toDBStatus(newIncident.status),
    });

    if (incError) {
      console.error("Failed to create incident in Supabase:", incError);
      addToast("warning", "Database Error", incError.message);
      return;
    }

    await supabase.from("alerts").insert({
      incident_id: newIncident.id,
      alert_type: "dispatch",
      message: `Reported at ${newIncident.location} (${newIncident.type}). Units alerted.`,
      status: "active"
    });

    setIncidents((prev) => [newIncident, ...prev]);

    // Add activity event
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: newIncident.timeReceived,
      title: `Incident ${newIncident.id} created & dispatched`,
      description: `Reported at ${newIncident.location} (${newIncident.type}). Units alerted.`,
      type: "dispatch",
      severity: newIncident.severity,
      relatedIncidentId: newIncident.id,
    };
    setActivities((prev) => [newAct, ...prev]);

    playAlertTone("create");
    addToast("success", `Incident ${newIncident.id} Registered`, `Dispatched code 3 to ${newIncident.location}`);
  };

  // 2. Notify Units
  const handleNotifyUnits = (incident: Incident) => {
    playAlertTone("notify");

    // Add timeline item
    const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === incident.id) {
        return {
          ...inc,
          timeline: [
            {
              time: nowStr,
              description: "Supervisor radio broadcast alert dispatched to field responders.",
              actor: "Supervisor Miller",
            },
            ...inc.timeline,
          ],
        };
      }
      return inc;
    });
    setIncidents(updatedIncidents);

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowStr,
      title: `Broadcast alert sent to units on ${incident.id}`,
      description: `Tactical telemetry updated for ${incident.assignedUnits.join(", ") || "assigned units"}.`,
      type: "dispatch",
      relatedIncidentId: incident.id,
    };
    setActivities((prev) => [newAct, ...prev]);

    addToast("info", `Units Alerted for ${incident.id}`, "Radio broadcast tone delivered to Mobile Data Terminals.");
  };

  // 3. Confirm Escalate Incident
  const handleConfirmEscalate = async (incident: Incident, reason: string) => {
    playAlertTone("escalate");

    const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    // Update DB
    await supabase.from("incidents").update({ severity: toDBSeverity("Critical") }).eq("id", incident.id);
    await supabase.from("alerts").insert({
      incident_id: incident.id,
      alert_type: "escalation",
      message: `Escalated to CRITICAL by Supervisor. Reason: ${reason}`,
      status: "active"
    });

    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === incident.id) {
        return {
          ...inc,
          severity: "Critical" as const,
          timeline: [
            {
              time: nowStr,
              description: `Escalated to CRITICAL by Supervisor. Reason: ${reason}`,
              actor: "Supervisor Miller",
            },
            ...inc.timeline,
          ],
        };
      }
      return inc;
    });
    setIncidents(updatedIncidents);

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowStr,
      title: `Incident ${incident.id} escalated to CRITICAL`,
      description: `Supervisor escalation logged: ${reason}`,
      type: "escalation",
      severity: "Critical",
      relatedIncidentId: incident.id,
    };
    setActivities((prev) => [newAct, ...prev]);

    addToast("warning", `Incident ${incident.id} Escalated`, "Priority elevated to CRITICAL. Mutual aid protocols alerted.");
  };

  // 4. Confirm Dispatch Unit
  const handleConfirmDispatch = async (unitId: string, incidentId: string) => {
    playAlertTone("notify");

    const unit = units.find((u) => u.id === unitId);
    const incident = incidents.find((i) => i.id === incidentId);

    if (!unit || !incident) return;

    await supabase.from("resources").update({ status: toDBUnitStatus("En route") }).eq("id", unitId);
    // Note: To properly assign units we should insert into resource_assignments, but we do it optimistically here
    await supabase.from("alerts").insert({
      incident_id: incidentId,
      alert_type: "dispatch",
      message: `${unit.callsign} dispatched. En route to ${incident.location}.`,
      status: "active"
    });

    // Update unit status
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status: "En route" as const,
            assignedIncidentId: incidentId,
          };
        }
        return u;
      })
    );

    // Update incident assigned units
    setIncidents((prev) =>
      prev.map((i) => {
        if (i.id === incidentId) {
          const currentUnits = i.assignedUnits || [];
          if (!currentUnits.includes(unit.callsign)) {
            return {
              ...i,
              assignedUnits: [...currentUnits, unit.callsign],
            };
          }
        }
        return i;
      })
    );

    const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: nowStr,
      title: `${unit.callsign} dispatched to ${incident.id}`,
      description: `En route to ${incident.location}. Driving telemetry tracking initiated.`,
      type: "dispatch",
      relatedIncidentId: incident.id,
    };
    setActivities((prev) => [newAct, ...prev]);

    addToast("success", `${unit.callsign} Deployed`, `Assigned to ${incident.id} (${incident.location})`);
  };

  // 5. Reset Simulation Data
  const handleResetData = () => {
    setIncidents([]);
    setUnits([]);
    setActivities([]);
    addToast("info", "Simulation Data Reset", "Cleared UI state.");
  };

  // Open map routing
  const handleOpenMapRouting = (incident: Incident) => {
    setSelectedIncidentForDetail(incident);
    setCurrentSection("map");
  };

  // Continuous Ambient Motion Video Background ref & continuous playback assurance
  const bgVideoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.playbackRate = 1.0;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    tryPlay();

    // Continuous loop guarantee: if video pauses or ends, immediately resume
    const handleEnded = () => {
      video.currentTime = 0;
      tryPlay();
    };
    const handlePause = () => {
      tryPlay();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tryPlay();
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-slate-900 flex overflow-hidden selection:bg-indigo-500/20 selection:text-slate-900">
      {/* Global Continuous Ambient Motion Background (original-e10daf1419f90a8b1787ae43f95d3c36.mp4) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <video
          ref={bgVideoRef}
          src="/media/original-e10daf1419f90a8b1787ae43f95d3c36.mp4"
          poster="/media/poster-a.png"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover saturate-[1.25] contrast-[1.08] brightness-[1.04]"
        />

        {/* Light Theme Frosted Wash: translucent veil letting continuous fluid motion be prominently visible */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 50% 20%, rgba(255, 255, 255, 0.28) 0%, rgba(248, 250, 252, 0.42) 100%)",
          }}
        />

        {/* Soft edge blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-slate-50/50" />

        {/* Delicate tactical grid pattern over continuous video */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      {/* Foreground Application Shell (z-10) */}
      <div className="relative z-10 flex w-full h-screen overflow-hidden bg-transparent">
        {/* Left Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => setCurrentSection(sec)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          activeIncidentsCount={incidents.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Sticky Header */}
          <TopHeader
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            unreadCount={activities.length}
            activityList={activities}
            onSelectActivity={(act) => {
              if (act.relatedIncidentId) {
                const target = incidents.find((i) => i.id === act.relatedIncidentId);
                if (target) setSelectedIncidentForDetail(target);
              }
            }}
          />

          {/* Naturally Scrollable View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {currentSection === "overview" && (
                <OverviewScreen
                  incidents={incidents}
                  units={units}
                  activities={activities}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onOpenLiveMap={() => setCurrentSection("map")}
                  onSelectIncident={(inc) => setSelectedIncidentForDetail(inc)}
                  onEscalateIncident={(inc) => setIncidentToEscalate(inc)}
                  onNotifyUnits={handleNotifyUnits}
                  onViewAllResources={() => setCurrentSection("resources")}
                  onOpenMapRouting={handleOpenMapRouting}
                />
              )}

              {currentSection === "incidents" && (
                <LiveIncidentsScreen
                  incidents={incidents}
                  units={units}
                  onSelectIncident={(inc) => setSelectedIncidentForDetail(inc)}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onEscalate={(inc) => setIncidentToEscalate(inc)}
                  onNotifyUnits={handleNotifyUnits}
                  onOpenMapRouting={handleOpenMapRouting}
                />
              )}

              {currentSection === "resources" && (
                <ResourceCoordinationScreen
                  units={units}
                  incidents={incidents}
                  onOpenDispatchModal={(unit) => {
                    setPreselectedUnitForDispatch(unit);
                    setIsDispatchModalOpen(true);
                  }}
                  onSelectUnit={(unit) => {
                    setPreselectedUnitForDispatch(unit);
                    setIsDispatchModalOpen(true);
                  }}
                />
              )}

              {currentSection === "map" && (
                <MapCoverageScreen
                  incidents={incidents}
                  units={units}
                  selectedIncident={selectedIncidentForDetail}
                  onSelectIncident={(inc) => setSelectedIncidentForDetail(inc)}
                />
              )}

              {currentSection === "analytics" && <AnalyticsScreen incidents={incidents} units={units} />}

              {currentSection === "settings" && <SettingsScreen onResetData={handleResetData} />}
            </div>
          </main>
        </div>
      </div>

      {/* OVERLAY MODALS */}
      {/* 1. Create Incident Modal */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateIncident={handleCreateIncident}
      />

      {/* 2. Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncidentForDetail}
        onClose={() => setSelectedIncidentForDetail(null)}
        onEscalate={(inc) => {
          setSelectedIncidentForDetail(null);
          setIncidentToEscalate(inc);
        }}
        onNotifyUnits={handleNotifyUnits}
        onOpenMapRouting={handleOpenMapRouting}
      />

      {/* 3. Escalate Confirmation Modal */}
      <EscalateModal
        incident={incidentToEscalate}
        isOpen={!!incidentToEscalate}
        onClose={() => setIncidentToEscalate(null)}
        onConfirmEscalate={handleConfirmEscalate}
      />

      {/* 4. Dispatch Deployment Modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setPreselectedUnitForDispatch(undefined);
        }}
        units={units}
        incidents={incidents}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* TOAST SYSTEM (Light Command Surface) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-xl backdrop-blur-md animate-fadeIn min-w-[300px] max-w-sm ${
              toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-950"
                : toast.type === "warning"
                ? "border-rose-200 bg-white text-rose-950"
                : "border-indigo-200 bg-white text-indigo-950"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              ) : (
                <Send className="h-4 w-4 text-indigo-600" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-900">{toast.title}</div>
              {toast.message && <p className="mt-0.5 text-[11px] text-slate-600">{toast.message}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppShell;

