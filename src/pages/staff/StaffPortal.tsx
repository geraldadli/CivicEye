import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Home,
  Inbox,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutGrid,
  Map,
} from "lucide-react";

import StaffDashboard from "./StaffDashboard";
import StaffReportInbox from "./StaffReportInbox";
import StaffTeamManagement from "./StaffTeamManagement";
import StaffFieldTasks from "./StaffFieldTasks";
import StaffAnalytics from "./StaffAnalytics";
import StaffSettings from "./StaffSettings";

type StaffTab =
  | "home"
  | "inbox"
  | "teams"
  | "tasks"
  | "analytics"
  | "settings";

export default function StaffPortal() {
  const { user, logout } = useApp();
  const [activeTab, setActiveTab] = useState<StaffTab>("inbox");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [separateWindows, setSeparateWindows] = useState(false);

  const sidebarItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "inbox", label: "Report Inbox", icon: Inbox },
    { key: "teams", label: "Team Management", icon: Users },
    { key: "tasks", label: "Field Tasks", icon: Briefcase },
    { key: "analytics", label: "Data & Analytics", icon: BarChart3 },
    { key: "settings", label: "Staff Settings", icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <StaffDashboard setActiveTab={setActiveTab} />;
      case "inbox":
        return <StaffReportInbox />;
      case "teams":
        return <StaffTeamManagement />;
      case "tasks":
        return <StaffFieldTasks />;
      case "analytics":
        return <StaffAnalytics />;
      case "settings":
        return <StaffSettings />;
      default:
        return <StaffReportInbox />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F4] text-stone-850 flex flex-col font-sans">
      {/* Mobile Top Navigation */}
      <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#0F354D] text-white shadow-md z-45">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase">
              CivicEye Operations
            </p>
            <h1 className="text-base font-bold leading-tight">Staff Portal</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            Halo, {user?.name || "David"}
          </span>
          <button
            onClick={logout}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm lg:hidden">
          <div className="w-72 bg-[#0F354D] h-full flex flex-col p-6 text-white shadow-2xl relative animate-slide-right">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-1.5 hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 mt-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                CivicEye
              </span>
              <h2 className="text-xl font-bold mt-1 text-white leading-snug">
                Operations Portal
              </h2>
            </div>

            <nav className="space-y-1.5 flex-1">
              {sidebarItems.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition ${
                      active
                        ? "bg-[#1E4D6B] text-white font-bold border-l-4 border-orange-400 pl-3"
                        : "text-stone-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-stone-300">
                <span className="text-sm font-medium">Separate windows</span>
                <button
                  onClick={() => setSeparateWindows(!separateWindows)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    separateWindows ? "bg-orange-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      separateWindows ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-bold"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Keluar / Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Main Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:p-6 bg-transparent h-full shrink-0">
          <div className="flex flex-col h-full bg-[#0F354D] rounded-[36px] p-5 text-white shadow-xl shadow-stone-200 border border-slate-700/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-400">
                CivicEye
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold leading-snug tracking-tight">
                Operations Portal
              </h2>
            </div>

            <nav className="mt-8 space-y-1.5 flex-1">
              {sidebarItems.map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition ${
                      active
                        ? "bg-[#1E4D6B] text-white font-bold border-l-4 border-orange-400 pl-3 shadow-md"
                        : "text-stone-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-stone-300">
                <span className="text-sm font-semibold">Separate windows</span>
                <button
                  onClick={() => setSeparateWindows(!separateWindows)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    separateWindows ? "bg-orange-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      separateWindows ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-bold"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:py-6 lg:pr-6">
          {/* Top Navbar */}
          <div className="hidden lg:flex items-center justify-between mb-5 bg-[#C9DFEC]/50 hover:bg-[#C9DFEC]/70 border border-[#b8cedb] rounded-[24px] p-2 backdrop-blur transition shrink-0">
            {/* Top Navigation Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                  activeTab === "inbox"
                    ? "bg-[#E27D3A] text-white shadow-md shadow-orange-100"
                    : "text-[#0F354D] hover:bg-white/30"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Reports Overview
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                  activeTab === "tasks"
                    ? "bg-[#E27D3A] text-white shadow-md shadow-orange-100"
                    : "text-[#0F354D] hover:bg-white/30"
                }`}
              >
                <Map className="w-4 h-4" />
                Field Coordination
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "bg-[#E27D3A] text-white shadow-md shadow-orange-100"
                    : "text-[#0F354D] hover:bg-white/30"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/40 rounded-2xl transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 border border-orange-200">
                  {user?.name?.charAt(0) || "D"}
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-semibold leading-tight">
                    Halo, Staff
                  </p>
                  <p className="text-xs font-bold text-stone-800 leading-tight">
                    {user?.name || "David"}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-600" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">
                      {user?.name || "David"}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {user?.email || "staff@civiceye.id"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition"
                  >
                    Profil Saya
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition font-bold"
                  >
                    Keluar / Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Subpage Render Area */}
          <main className="flex-1 overflow-hidden min-h-0 bg-[#0F354D] rounded-[36px] border border-slate-700/10 shadow-lg text-white">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
