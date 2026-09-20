"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Incident, ResponseUnit, RouteInfo, NearbyPlace } from "@/lib/types";
import { GEOAPIFY_API_KEY, DEFAULT_CENTER } from "@/lib/mock-data";
import {
  Search,
  Navigation,
  MapPin,
  Flame,
  Shield,
  Ambulance,
  Radio,
  Layers,
  Hospital,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Building,
  Fuel,
  Compass,
} from "lucide-react";

export interface EmergencyMapProps {
  incidents?: Incident[];
  units?: ResponseUnit[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  height?: string;
  showControls?: boolean;
  initialMode?: "all" | "incidents" | "units" | "resources";
  enableRouting?: boolean;
  className?: string;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  incidents = [],
  units = [],
  selectedIncident = null,
  onSelectIncident,
  height = "560px",
  showControls = true,
  enableRouting = true,
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const incidentMarkersRef = useRef<{ [id: string]: any }>({});
  const unitMarkersRef = useRef<{ [id: string]: any }>({});
  const nearbyMarkersRef = useRef<any[]>([]);
  const tempMarkerRef = useRef<any>(null);

  // Status indicators matching reference HTML
  const [apiStatus, setApiStatus] = useState({
    leaflet: "READY",
    nominatim: "STANDBY",
    reverse: "STANDBY",
    osrm: "STANDBY",
    geoapify: "STANDBY",
  });

  // UI state
  const [activeTab, setActiveTab] = useState<"incidents" | "geocode" | "routing" | "geoapify">("incidents");
  const [searchAddress, setSearchAddress] = useState("14 Meridian Ave");
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<any>(null);

  // Reverse geocode state
  const [reverseCoords, setReverseCoords] = useState({ lat: 23.0225, lon: 72.5714 });
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseResult, setReverseResult] = useState<any>(null);

  // Routing state
  const [startUnitId, setStartUnitId] = useState<string>(units[0]?.id || "U-104");
  const [destIncidentId, setDestIncidentId] = useState<string>(incidents[0]?.id || "INC-4821");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Geoapify nearby places state
  const [placeType, setPlaceType] = useState("healthcare.hospital");
  const [searchRadius, setSearchRadius] = useState(3000);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Clean up existing instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const centerLat = selectedIncident ? selectedIncident.coordinates.lat : DEFAULT_CENTER.lat;
        const centerLon = selectedIncident ? selectedIncident.coordinates.lon : DEFAULT_CENTER.lon;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([centerLat, centerLon], 13);

        // OpenStreetMap crisp light tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Click on map to trigger reverse geocode preview
        map.on("click", (e: any) => {
          const lat = parseFloat(e.latlng.lat.toFixed(5));
          const lon = parseFloat(e.latlng.lng.toFixed(5));
          setReverseCoords({ lat, lon });
        });

        // Fix Leaflet grid rendering issue on flexbox resize
        const resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);

        setApiStatus((prev) => ({ ...prev, leaflet: "OPERATIONAL" }));
      } catch (err) {
        console.error("Leaflet init error:", err);
        setApiStatus((prev) => ({ ...prev, leaflet: "ERROR" }));
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // The resizeObserver is cleaned up automatically when the DOM node is removed, 
      // but to be perfectly clean we could disconnect it if we had a ref.
    };
  }, []);

  // Update Incident & Unit Markers
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current;

      // Clear existing incident markers
      Object.values(incidentMarkersRef.current).forEach((m: any) => map.removeLayer(m));
      incidentMarkersRef.current = {};

      // Clear existing unit markers
      Object.values(unitMarkersRef.current).forEach((m: any) => map.removeLayer(m));
      unitMarkersRef.current = {};

      // Add Incident Markers
      incidents.forEach((inc) => {
        const isSelected = selectedIncident?.id === inc.id;
        const severityColor =
          inc.severity === "Critical"
            ? "#dc2626"
            : inc.severity === "High"
            ? "#ea580c"
            : inc.severity === "Medium"
            ? "#2563eb"
            : "#16a34a";

        const markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
            <div style="position: absolute; width: ${isSelected ? "44px" : "32px"}; height: ${isSelected ? "44px" : "32px"}; border-radius: 9999px; background-color: ${severityColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background: white; border: 2.5px solid ${severityColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
              <div style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${severityColor};"></div>
            </div>
            <div style="position: absolute; bottom: -18px; white-space: nowrap; font-size: 10px; font-weight: 700; background: #0f172a; color: #f8fafc; padding: 1px 6px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); letter-spacing: 0.5px;">
              ${inc.id}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "custom-incident-marker",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([inc.coordinates.lat, inc.coordinates.lon], { icon }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; min-width: 180px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; color: #0f172a; font-size: 13px;">${inc.id}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${severityColor}; background: ${severityColor}15; padding: 2px 6px; border-radius: 4px; border: 1px solid ${severityColor}40;">
                ${inc.severity.toUpperCase()}
              </span>
            </div>
            <div style="font-weight: 600; color: #334155; margin-bottom: 4px;">${inc.type}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${inc.location}</div>
            <div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px;">
              <strong>Units:</strong> ${inc.assignedUnits.join(", ") || "None assigned"}
            </div>
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">
              Status: <span style="color: #0f172a;">${inc.status}</span>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        marker.on("click", () => {
          onSelectIncident?.(inc);
        });

        incidentMarkersRef.current[inc.id] = marker;
      });

      // Add Unit Markers
      units.forEach((unit) => {
        const unitColor =
          unit.type === "Fire & Rescue"
            ? "#dc2626"
            : unit.type === "Medical / EMS"
            ? "#2563eb"
            : unit.type === "Police Support"
            ? "#4f46e5"
            : "#d97706";

        const unitIconHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; cursor: pointer;">
            <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #0f172a; border: 1.5px solid ${unitColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">
              <span style="font-size: 9px; font-weight: 800; color: white;">${unit.callsign.split(" ")[0][0]}${unit.callsign.split(" ")[1] || ""}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: unitIconHtml,
          className: "custom-unit-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([unit.coordinates.lat, unit.coordinates.lon], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #1e293b; min-width: 170px;">
            <div style="font-weight: 800; color: #0f172a; font-size: 13px;">${unit.callsign}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">${unit.type}</div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 4px;">📍 ${unit.currentLocation}</div>
            <div style="font-size: 11px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
              <strong>Status:</strong> <span style="color: ${unit.status === "Available" ? "#16a34a" : "#2563eb"}">${unit.status}</span>
              <br/>
              <strong>Crew:</strong> ${unit.crewCount} personnel | <strong>Fuel:</strong> ${unit.batteryFuelPct}%
            </div>
          </div>
        `);

        unitMarkersRef.current[unit.id] = marker;
      });
    };

    updateMarkers();
  }, [incidents, units, selectedIncident, onSelectIncident]);

  // Center on selected incident
  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedIncident.coordinates.lat, selectedIncident.coordinates.lon],
        15,
        { animate: true }
      );
      const m = incidentMarkersRef.current[selectedIncident.id];
      if (m) {
        setTimeout(() => m.openPopup(), 200);
      }
    }
  }, [selectedIncident]);

  // 1. GEOCODING via Nominatim
  const handleGeocode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchAddress.trim()) return;

    setGeocodeLoading(true);
    setApiStatus((prev) => ({ ...prev, nominatim: "TESTING" }));

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchAddress
      )}&limit=5`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setGeocodeResult({ error: "No location coordinates found for this query." });
        setApiStatus((prev) => ({ ...prev, nominatim: "NO RESULT" }));
        setGeocodeLoading(false);
        return;
      }

      const first = data[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);

      setGeocodeResult({
        name: first.display_name,
        lat,
        lon,
        type: first.type,
      });

      if (mapInstanceRef.current) {
        const L = (await import("leaflet")).default;
        if (tempMarkerRef.current) {
          mapInstanceRef.current.removeLayer(tempMarkerRef.current);
        }
        tempMarkerRef.current = L.marker([lat, lon])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Geocoded Address</b><br/>${first.display_name}`)
          .openPopup();

        mapInstanceRef.current.setView([lat, lon], 15, { animate: true });
      }

      setApiStatus((prev) => ({ ...prev, nominatim: "OPERATIONAL" }));
    } catch (err: any) {
      console.error("Geocode error:", err);
      setGeocodeResult({ error: err.message || "Failed to contact Nominatim service" });
      setApiStatus((prev) => ({ ...prev, nominatim: "FAILED" }));
    } finally {
      setGeocodeLoading(false);
    }
  };

  // 2. REVERSE GEOCODING via Nominatim
  const handleReverseGeocode = async (overrideLat?: number, overrideLon?: number) => {
    const lat = overrideLat !== undefined ? overrideLat : reverseCoords.lat;
    const lon = overrideLon !== undefined ? overrideLon : reverseCoords.lon;

    setReverseLoading(true);
    setApiStatus((prev) => ({ ...prev, reverse: "TESTING" }));

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.display_name) {
        throw new Error("No address returned for these coordinates.");
      }

      setReverseResult({
        address: data.display_name,
        lat,
        lon,
      });

      if (mapInstanceRef.current) {
        const L = (await import("leaflet")).default;
        if (tempMarkerRef.current) {
          mapInstanceRef.current.removeLayer(tempMarkerRef.current);
        }
        tempMarkerRef.current = L.marker([lat, lon])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Resolved Location</b><br/>${data.display_name}`)
          .openPopup();

        mapInstanceRef.current.setView([lat, lon], 15, { animate: true });
      }

      setApiStatus((prev) => ({ ...prev, reverse: "OPERATIONAL" }));
    } catch (err: any) {
      console.error("Reverse geocode error:", err);
      setReverseResult({ error: err.message || "Failed to resolve address." });
      setApiStatus((prev) => ({ ...prev, reverse: "FAILED" }));
    } finally {
      setReverseLoading(false);
    }
  };

  // 3. OSRM DRIVING ROUTE CALCULATION
  const handleCalculateRoute = async () => {
    const unit = units.find((u) => u.id === startUnitId) || units[0];
    const incident = incidents.find((i) => i.id === destIncidentId) || incidents[0];

    if (!unit || !incident) return;

    setRouteLoading(true);
    setApiStatus((prev) => ({ ...prev, osrm: "TESTING" }));

    try {
      const startLat = unit.coordinates.lat;
      const startLon = unit.coordinates.lon;
      const destLat = incident.coordinates.lat;
      const destLon = incident.coordinates.lon;

      // OSRM format: longitude,latitude;longitude,latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No navigable driving route found between coordinates.");
      }

      const route = data.routes[0];
      const distKm = Number((route.distance / 1000).toFixed(2));
      const durMin = Number((route.duration / 60).toFixed(1));

      setRouteInfo({
        distance_km: distKm,
        duration_minutes: durMin,
        distance_meters: route.distance,
        duration_seconds: route.duration,
        geometry: route.geometry,
      });

      if (mapInstanceRef.current) {
        const L = (await import("leaflet")).default;

        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        routeLayerRef.current = L.geoJSON(route.geometry, {
          style: {
            color: "#ea580c", // Emergency tactical coral route line
            weight: 5,
            opacity: 0.85,
            dashArray: "1, 0",
          },
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
          padding: [40, 40],
        });
      }

      setApiStatus((prev) => ({ ...prev, osrm: "OPERATIONAL" }));
    } catch (err: any) {
      console.error("OSRM Route error:", err);
      setRouteInfo(null);
      setApiStatus((prev) => ({ ...prev, osrm: "FAILED" }));
    } finally {
      setRouteLoading(false);
    }
  };

  // 4. GEOAPIFY NEARBY EMERGENCY PLACES
  const handleFetchNearby = async () => {
    const centerLat = selectedIncident ? selectedIncident.coordinates.lat : reverseCoords.lat;
    const centerLon = selectedIncident ? selectedIncident.coordinates.lon : reverseCoords.lon;

    setNearbyLoading(true);
    setApiStatus((prev) => ({ ...prev, geoapify: "TESTING" }));

    // Clean up old nearby markers
    if (mapInstanceRef.current) {
      nearbyMarkersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
      nearbyMarkersRef.current = [];
    }

    try {
      const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
        placeType
      )}&filter=circle:${centerLon},${centerLat},${searchRadius}&bias=proximity:${centerLon},${centerLat}&limit=20&apiKey=${encodeURIComponent(
        GEOAPIFY_API_KEY
      )}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.features || data.features.length === 0) {
        setNearbyPlaces([]);
        setApiStatus((prev) => ({ ...prev, geoapify: "NO RESULTS" }));
        setNearbyLoading(false);
        return;
      }

      const L = (await import("leaflet")).default;
      const places: NearbyPlace[] = [];

      data.features.forEach((feature: any) => {
        if (!feature.geometry || !feature.geometry.coordinates) return;
        const [lon, lat] = feature.geometry.coordinates;
        const props = feature.properties || {};

        const name = props.name || "Emergency Facility";
        const address = props.formatted || "Address unavailable";
        const distance = props.distance;

        // Custom icon for facility
        const facilityHtml = `
          <div style="background-color: #0f172a; color: #38bdf8; border: 1.5px solid #38bdf8; border-radius: 9999px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 11px;">
            ✚
          </div>
        `;
        const icon = L.divIcon({
          html: facilityHtml,
          className: "custom-facility-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([lat, lon], { icon }).addTo(mapInstanceRef.current);
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 170px;">
            <div style="font-weight: bold; color: #0f172a;">${name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${address}</div>
            ${
              distance !== undefined
                ? `<div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 4px;">📍 ${Math.round(
                    distance
                  )}m away</div>`
                : ""
            }
          </div>
        `);

        nearbyMarkersRef.current.push(marker);

        places.push({
          name,
          address,
          category: placeType,
          distance_meters: distance,
          lat,
          lon,
        });
      });

      setNearbyPlaces(places);
      setApiStatus((prev) => ({ ...prev, geoapify: "OPERATIONAL" }));
    } catch (err: any) {
      console.error("Geoapify error:", err);
      setNearbyPlaces([]);
      setApiStatus((prev) => ({ ...prev, geoapify: "FAILED" }));
    } finally {
      setNearbyLoading(false);
    }
  };

  const focusPlaceOnMap = async (place: NearbyPlace) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([place.lat, place.lon], 16, { animate: true });
    // Find matching marker
    const marker = nearbyMarkersRef.current.find((m) => {
      const pos = m.getLatLng();
      return Math.abs(pos.lat - place.lat) < 0.0001 && Math.abs(pos.lng - place.lon) < 0.0001;
    });
    if (marker) marker.openPopup();
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-300 text-slate-900 ${
        isExpanded ? "fixed inset-4 z-50 shadow-2xl" : ""
      } ${className}`}
    >
      {/* Map Command Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 backdrop-blur-md text-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-sm">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Tactical Emergency GIS</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              OSM Tiles Active
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              {incidents.length} Incidents, {units.length} Units Tracked
            </span>
          </div>
        </div>

        {/* API Services Operational Status Bar */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              apiStatus.leaflet === "OPERATIONAL"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            Leaflet
          </div>
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              apiStatus.nominatim === "OPERATIONAL"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : apiStatus.nominatim === "TESTING"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            Nominatim
          </div>
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              apiStatus.osrm === "OPERATIONAL"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : apiStatus.osrm === "TESTING"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            OSRM
          </div>
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              apiStatus.geoapify === "OPERATIONAL"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : apiStatus.geoapify === "TESTING"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            Geoapify
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            title={isExpanded ? "Minimize" : "Expand to Fullscreen"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Map Body with Side-by-Side Command Panels */}
      <div className="relative flex-1 flex flex-col lg:flex-row min-h-[460px]">
        {/* The Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{ height: isExpanded ? "calc(100vh - 120px)" : height }}
          className="w-full flex-1 z-0 bg-slate-50"
        />

        {/* Tactical Control Panels */}
        {showControls && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col text-slate-900 shadow-sm max-h-[580px] overflow-y-auto">
            {/* Control Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab("incidents")}
                className={`flex-1 py-1.5 px-2 rounded-md text-center transition ${
                  activeTab === "incidents"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Incidents
              </button>
              <button
                onClick={() => setActiveTab("routing")}
                className={`flex-1 py-1.5 px-2 rounded-md text-center transition ${
                  activeTab === "routing"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🚗 OSRM Route
              </button>
              <button
                onClick={() => setActiveTab("geocode")}
                className={`flex-1 py-1.5 px-2 rounded-md text-center transition ${
                  activeTab === "geocode"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                📍 Geocode
              </button>
              <button
                onClick={() => setActiveTab("geoapify")}
                className={`flex-1 py-1.5 px-2 rounded-md text-center transition ${
                  activeTab === "geoapify"
                    ? "bg-white text-slate-900 shadow-xs font-bold border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🏥 Nearby
              </button>
            </div>

            {/* TAB CONTENT: Incidents */}
            {activeTab === "incidents" && (
              <div className="p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Active Incident Targets ({incidents.length})</span>
                  <span>Click to Center</span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {incidents.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    const sevBorder =
                      inc.severity === "Critical"
                        ? "border-l-rose-500"
                        : inc.severity === "High"
                        ? "border-l-amber-500"
                        : inc.severity === "Medium"
                        ? "border-l-blue-500"
                        : "border-l-emerald-500";

                    return (
                      <div
                        key={inc.id}
                        onClick={() => onSelectIncident?.(inc)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition border-l-4 ${sevBorder} ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-200 shadow-xs ring-1 ring-indigo-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{inc.id}</span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              inc.severity === "Critical"
                                ? "bg-rose-50 text-rose-700"
                                : inc.severity === "High"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <div className="font-medium text-slate-900 mt-1">{inc.type}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">📍 {inc.location}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                          <span>Units: {inc.assignedUnits.join(", ") || "Unassigned"}</span>
                          <span className="font-medium text-indigo-700">{inc.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: OSRM Routing */}
            {activeTab === "routing" && (
              <div className="p-3.5 space-y-3.5 text-xs text-slate-900">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">3. 🚗 OSRM Dispatch Routing</div>
                  <div className="text-slate-500 mt-0.5">
                    Live road network calculation with real driving geometry.
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Origin Unit (Departure)
                    </label>
                    <select
                      value={startUnitId}
                      onChange={(e) => setStartUnitId(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.callsign} ({u.type}) — {u.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Target Incident (Destination)
                    </label>
                    <select
                      value={destIncidentId}
                      onChange={(e) => setDestIncidentId(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    >
                      {incidents.map((inc) => (
                        <option key={inc.id} value={inc.id}>
                          {inc.id} — {inc.location} ({inc.severity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCalculateRoute}
                    disabled={routeLoading}
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                  >
                    {routeLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Querying OSRM Router...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Calculate Dispatch Route</span>
                      </>
                    )}
                  </button>

                  {/* Route Results Metric Box */}
                  {routeInfo && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-emerald-800 font-semibold text-xs">
                        <span>✅ OSRM Route Calculated</span>
                        <span className="text-[10px] bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                          200 OK
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-slate-900">
                        <div className="bg-white p-2 rounded border border-emerald-200/60 shadow-xs">
                          <span className="block text-[10px] text-slate-500 font-medium">Road Distance</span>
                          <span className="text-base font-bold text-slate-900">
                            {routeInfo.distance_km} km
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200/60 shadow-xs">
                          <span className="block text-[10px] text-slate-500 font-medium">Estimated Arrival</span>
                          <span className="text-base font-bold text-indigo-700">
                            ~{routeInfo.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 pt-1">
                        Route geometry rendered on tactical map with turn-by-turn vector trace.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Geocoding & Reverse */}
            {activeTab === "geocode" && (
              <div className="p-3.5 space-y-4 text-xs text-slate-900">
                {/* 1. Forward Geocoding */}
                <div>
                  <div className="font-semibold text-slate-900 text-sm">1. 📍 Nominatim Geocoding</div>
                  <div className="text-slate-500 mt-0.5 text-[11px]">
                    Convert address to precise tactical coordinates.
                  </div>

                  <form onSubmit={handleGeocode} className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      placeholder="e.g. Nirma University, Ahmedabad"
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={geocodeLoading}
                      className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {geocodeLoading ? "Searching Nominatim..." : "Search Address"}
                    </button>
                  </form>

                  {geocodeResult && (
                    <div className="mt-2 rounded bg-slate-50 p-2 border border-slate-200 text-[11px] space-y-1">
                      {geocodeResult.error ? (
                        <span className="text-rose-600 font-medium">{geocodeResult.error}</span>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-900">{geocodeResult.name}</div>
                          <div className="font-mono text-indigo-600">
                            Lat: {geocodeResult.lat}, Lon: {geocodeResult.lon}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="font-semibold text-slate-900 text-sm">2. 🔄 Reverse Geocoding</div>
                  <div className="text-slate-500 mt-0.5 text-[11px]">
                    Click map or enter coordinates to resolve street address.
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={reverseCoords.lat}
                        onChange={(e) =>
                          setReverseCoords((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))
                        }
                        className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={reverseCoords.lon}
                        onChange={(e) =>
                          setReverseCoords((prev) => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))
                        }
                        className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleReverseGeocode()}
                    disabled={reverseLoading}
                    className="mt-2 w-full rounded bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
                  >
                    {reverseLoading ? "Resolving Address..." : "Reverse Geocode"}
                  </button>

                  {reverseResult && (
                    <div className="mt-2 rounded bg-slate-50 p-2 border border-slate-200 text-[11px]">
                      {reverseResult.error ? (
                        <span className="text-rose-600">{reverseResult.error}</span>
                      ) : (
                        <span className="text-slate-900">{reverseResult.address}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Geoapify Nearby Resources */}
            {activeTab === "geoapify" && (
              <div className="p-3.5 space-y-3 text-xs text-slate-900">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">4. 🚨 Geoapify Nearby Resources</div>
                  <div className="text-slate-500 mt-0.5 text-[11px]">
                    Find emergency facilities using Geoapify Places API.
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Resource Type
                    </label>
                    <select
                      value={placeType}
                      onChange={(e) => setPlaceType(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                    >
                      <option value="healthcare.hospital">🏥 Hospitals & ER Centers</option>
                      <option value="service.police">👮 Police Stations & Substations</option>
                      <option value="service.fire_station">🚒 Fire & Rescue Stations</option>
                      <option value="healthcare.pharmacy">💊 Emergency Pharmacies</option>
                      <option value="healthcare">🩺 All Healthcare Facilities</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Search Radius</span>
                      <span className="text-indigo-600 font-mono font-semibold">{searchRadius} meters</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1"
                    />
                  </div>

                  <button
                    onClick={handleFetchNearby}
                    disabled={nearbyLoading}
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                  >
                    {nearbyLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Scanning Geoapify...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5" />
                        <span>Find Nearby Places</span>
                      </>
                    )}
                  </button>

                  {/* Places Result List */}
                  {nearbyPlaces.length > 0 && (
                    <div className="space-y-1.5 pt-2 max-h-[260px] overflow-y-auto">
                      <div className="text-[11px] font-semibold text-emerald-700">
                        Found {nearbyPlaces.length} facilities nearby:
                      </div>
                      {nearbyPlaces.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => focusPlaceOnMap(p)}
                          className="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 cursor-pointer transition text-[11px] shadow-xs"
                        >
                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                            <span className="truncate">{p.name}</span>
                            {p.distance_meters && (
                              <span className="text-[10px] text-indigo-600 font-mono shrink-0 ml-1">
                                {p.distance_meters}m
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 truncate text-[10px]">{p.address}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Footer Bar with Quick Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-900">Tactical Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-white border border-indigo-500" />
            <span>Field Unit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Healthcare</span>
          </div>
        </div>

        <div className="text-slate-400 text-[10px]">
          Leaflet 1.9 · OpenStreetMap · OSRM Driving Engine · Geoapify Places
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
