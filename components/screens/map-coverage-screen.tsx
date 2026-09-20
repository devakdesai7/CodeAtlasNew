"use client";

import React from "react";
import { EmergencyMap } from "@/components/emergency-map";
import { Incident, ResponseUnit } from "@/lib/types";
import { Compass } from "lucide-react";
import { AmbientVideoBackground } from "@/components/ambient-video-background";

interface MapCoverageScreenProps {
  incidents: Incident[];
  units: ResponseUnit[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

export const MapCoverageScreen: React.FC<MapCoverageScreenProps> = ({
  incidents,
  units,
  selectedIncident,
  onSelectIncident,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* Screen Header with Reference B Ambient Motion Background */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden min-h-[140px]">
        {/* Reference B Video Background */}
        <AmbientVideoBackground
          src="/media/original-e6c90943d3d9da57b997c2898244009e.mp4"
          poster="/media/poster-b.png"
          opacity={0.4}
          overlayStrength={0.82}
          playbackSpeed={0.7}
          theme="light"
        />

        {/* Header content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Tactical Map & Coverage Operations
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Geographic intelligence layer: Leaflet GIS, OpenStreetMap tiles, Nominatim Geocoding, OSRM road routing, and Geoapify emergency facilities.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200 font-mono shadow-xs">
              District 01 Metro Sector (23.0225° N, 72.5714° E)
            </span>
          </div>
        </div>
      </div>

      {/* Main Full GIS Map Component on Solid Light Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm overflow-hidden">
        <EmergencyMap
          incidents={incidents}
          units={units}
          selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
          height="640px"
          showControls={true}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default MapCoverageScreen;
