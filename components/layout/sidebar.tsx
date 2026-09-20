"use client";

import React from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Map,
  BarChart3,
  Settings,
  Shield,
  Radio,
  X,
} from "lucide-react";

export type NavSection =
  | "overview"
  | "incidents"
  | "resources"
  | "map"
  | "analytics"
  | "settings";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
  activeIncidentsCount,
}) => {
  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "incidents",
      label: "Live Incidents",
      icon: AlertTriangle,
      badge: activeIncidentsCount,
    },
    {
      id: "resources",
      label: "Resource Coordination",
      icon: Users,
    },
    {
      id: "map",
      label: "Map & Coverage",
      icon: Map,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const content = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-900 shadow-sm">
      {/* Agency Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
              AEGIS
            </div>
            <div className="text-[11px] font-semibold text-indigo-600 tracking-wide mt-1">
              Emergency Operations
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Command Center
        </div>

        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobile();
              }}
              className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-50 text-indigo-900 font-bold border border-indigo-200/80 shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {/* Indigo rail indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-md bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                  aria-hidden="true"
                />
              )}

              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
                }`}
              />

              <span className="flex-1 text-left">{item.label}</span>

              {item.badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Emergency Status Card */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              CAD Mesh Online
            </span>
            <span className="font-mono text-emerald-600 font-bold">99.9%</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 leading-relaxed">
            Encrypted radio telemetry active across District 01. 18 field vehicles synced.
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden md:flex md:shrink-0">{content}</div>

      {/* Mobile Drawer (Accessible overlay) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white animate-fadeIn">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
