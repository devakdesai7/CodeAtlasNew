"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Shield,
  User,
  Radio,
  Menu,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ActivityEvent } from "@/lib/types";

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  unreadCount: number;
  activityList: ActivityEvent[];
  onSelectActivity?: (item: ActivityEvent) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  unreadCount,
  activityList,
  onSelectActivity,
}) => {
  const [timeString, setTimeString] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live ticking operating time in local format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) +
          " " +
          now.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 md:px-6 backdrop-blur-md shadow-xs text-slate-900">
      {/* Left side: Mobile menu toggle + Agency breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden transition"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
            <Shield className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-sm">AEGIS</span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 tracking-wide border border-indigo-100">
                DISTRICT 01
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Emergency Response & Resource Coordination
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Telemetry time, status, sound toggle, notifications, profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700 border border-slate-200">
          <Clock className="h-3.5 w-3.5 text-indigo-600" />
          <span className="font-mono font-medium tracking-wide">
            {timeString || "08:32:14 EDT"}
          </span>
        </div>

        {/* System Readiness Status */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
          </span>
          <span>All Systems Normal</span>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title={soundEnabled ? "Radio Chime Enabled" : "Radio Chime Muted"}
          aria-label="Toggle radio dispatch sound alerts"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-indigo-600" />
          ) : (
            <VolumeX className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Open dispatch notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-fadeIn z-50 text-slate-900"
              role="dialog"
              aria-label="Active Notifications"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                  <Radio className="h-4 w-4 text-indigo-600" />
                  <span>Dispatch Alerts & Events ({activityList.length})</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activityList.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      onSelectActivity?.(act);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                    </div>
                    {act.description && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{act.description}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center text-[11px] text-slate-500">
                Supervisor Watch: Station 01 Central Hub
              </div>
            </div>
          )}
        </div>

        {/* Dispatcher Avatar & Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs">
            SM
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-bold text-slate-900 leading-tight">Supervisor Miller</div>
            <div className="text-[10px] text-slate-500">CAD Dispatch Command</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
