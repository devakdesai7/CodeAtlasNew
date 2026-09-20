# AEGIS Emergency Operations — Command & Resource Coordination Platform

**AEGIS Emergency Operations** is a calm, high-stakes emergency dispatch and coordination platform designed for 911 supervisors and emergency operations center (EOC) watch captains. Built with Next.js (App Router), React, TypeScript, Tailwind CSS, lucide-react icons, and interactive Leaflet GIS integration.

---

## 🎨 Visual Direction & Light Theme Palette

The platform follows a calm, high-clarity **Executive Light Command Center** aesthetic with crisp slate hierarchy:

- **Foundation Background**: `#f8fafc` (clean slate-50)
- **Primary Surface / Cards**: `#ffffff` (pure white with subtle `#e2e8f0` borders)
- **Elevated Surfaces / Inputs**: `#f1f5f9` (soft slate-100 controls and badges)
- **Main Typography**: `#0f172a` (high-contrast slate-900)
- **Muted Telemetry**: `#64748b` (slate-500 secondary labels & coordinates)
- **Primary Brand / Action**: `#4f46e5` (indigo-600 active rails, markers, and primary buttons)
- **Critical Alert / Glow**: `#ff6b4a` (vibrant emergency coral for critical calls and edge accents)
- **High Severity**: `#f5b544` / amber-700 (caution markers)
- **Medium Severity**: `#3b82f6` / blue-600 (tactical blue)
- **Available / Operational**: `#10b981` / emerald-600 (fleet readiness)

---

## 🎥 Ambient Motion Background Integration

The application integrates two reference video clips as subtle, non-intrusive ambient atmospheric textures beneath light-theme overlays:

### Video Assets & Placement
- **Reference A (`public/media/original-e10daf1419f90a8b1787ae43f95d3c36.mp4`)**:
  - **Location**: Placed behind the **Overview Command Hero** section.
  - **Role**: Establishes a calm, focused, high-stakes operational atmosphere.
  - **Attributes**: Rendered via `AmbientVideoBackground` with light-theme radial frost (`rgba(255,255,255,0.76)` to `#f8fafc`), smooth top/bottom edge blends, 0.42 opacity, and 0.75x playback speed. Dark slate typography and operational indicators remain effortlessly readable.

- **Reference B (`public/media/original-e6c90943d3d9da57b997c2898244009e.mp4`)**:
  - **Location**: Placed selectively behind the **Map & Coverage header** and the **Analytics header**.
  - **Role**: Acts as a secondary visual layer for geographic intelligence and operational analytics without distracting from maps or charts.

### Strict Legibility Guardrails
Neither video is ever placed behind:
- Incident data tables
- Resource and unit fleet lists
- Entry forms and inputs
- Dialogs and modals
- Platform settings controls
- Dense mobile layouts

For all data surfaces, solid crisp white panels (`#ffffff`) with `#e2e8f0` borders and subtle drop shadows are used.

### Performance & Accessibility
- **IntersectionObserver**: Automatically pauses video playback whenever the component scrolls out of the active viewport.
- **Single Active Video**: Never plays more than one video simultaneously in the viewport.
- **`prefers-reduced-motion`**: Detects system preferences and displays static fallback posters (`public/media/poster-a.png`, `public/media/poster-b.png`) instead of playing video.
- **Mobile Friendly**: Automatically suppresses ambient video playback on mobile screens to save battery and maintain maximum contrast.

---

## 🗺️ GIS & Mapping Architecture

Integrated directly with real-world geospatial emergency routing services:
1. **Leaflet + OpenStreetMap Vector Tiles**: Tactical dark styling and interactive pins.
2. **Nominatim Geocoding**: Real-time forward address lookup to coordinates.
3. **Nominatim Reverse Geocoding**: Click any point or enter coordinates to resolve the physical street address.
4. **OSRM Live Driving Routing**: Road network calculation with real-time distance in kilometers, estimated travel time in minutes, and driving polyline on the map.
5. **Geoapify Nearby Resources**: Direct integration with Geoapify Places API (`healthcare.hospital`, `service.fire_station`, `service.police`, `healthcare.pharmacy`).

---

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── globals.css              # Dark command design tokens, scrollbars, Leaflet theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Root page mounting AppShell
├── public/
│   └── media/
│       ├── original-e10daf1419f90a8b1787ae43f95d3c36.mp4  # Reference A video
│       ├── original-e6c90943d3d9da57b997c2898244009e.mp4  # Reference B video
│       ├── poster-a.png                                     # Fallback poster A
│       └── poster-b.png                                     # Fallback poster B
├── components/
│   ├── ambient-video-background.tsx # Reusable video background with IntersectionObserver & fallback
│   ├── emergency-map.tsx        # Tactical Leaflet map with Nominatim, OSRM & Geoapify
│   ├── ui/
│   │   └── shiny-button.tsx     # Primary emergency action button with coral edge glow
│   ├── layout/
│   │   ├── app-shell.tsx        # Central state, Web Audio alert tones & toast system
│   │   ├── top-header.tsx       # Real-time clock, readiness indicator & notifications
│   │   └── sidebar.tsx          # Navigation rail with unread incident badges
│   ├── overview/
│   │   ├── overview-screen.tsx  # Overview screen with Reference A hero background
│   │   ├── metric-card.tsx      # 4 KPI operational cards with SVG sparklines
│   │   ├── priority-incident-card.tsx # Critical structure fire at 14 Meridian Ave
│   │   ├── incident-queue-table.tsx   # Filterable incident queue table & cards
│   │   ├── resource-availability-card.tsx # Fleet capacity progress meters
│   │   └── activity-feed.tsx    # Chronological CAD timeline with escalation watchdog
│   ├── screens/
│   │   ├── live-incidents-screen.tsx # Incident queue with multi-filtering & drawer
│   │   ├── resource-coordination-screen.tsx # Fleet readiness & battery telemetry
│   │   ├── map-coverage-screen.tsx  # Full tactical GIS console with Reference B header
│   │   ├── analytics-screen.tsx # Response trends & distribution with Reference B header
│   │   └── settings-screen.tsx  # Density, tone alerts & simulation reset (solid panel)
│   └── modals/
│       ├── create-incident-modal.tsx # Structured incident creation modal
│       ├── incident-detail-modal.tsx # Incident commander dossier
│       ├── escalate-modal.tsx        # Supervisor escalation confirmation
│       └── dispatch-modal.tsx        # Field unit route deployment modal
├── lib/
│   ├── types.ts                 # TypeScript interfaces for incidents, units, routes
│   ├── mock-data.ts             # Realistic mock CAD dataset and Geoapify configuration
│   └── utils.ts                 # Tailwind cn utility helper
├── package.json
└── tsconfig.json
```

---

## 🚀 Running the Project

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
