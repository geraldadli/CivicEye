import { useMemo, useState } from "react";
import {
  Search,
  Home,
  MessageSquareText,
  ScanLine,
  Users,
  Store,
  LogOut,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import ReportPage from "@/pages/ReportPage";
import ForumPage from "@/pages/ForumPage";
import CommunityPage from "@/pages/CommunityPage";
import StorePage from "@/pages/StorePage";
import { BottomTab } from "@/types/civiceye";
import { getRank } from "@/utils/ranks";
import { AppProvider, useApp } from "@/context/AppContext";
import LoginScreen from "@/components/LoginScreen";
import StaffPortal from "@/pages/staff/StaffPortal";

const navItems: Array<{
  key: BottomTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "home", label: "Home", icon: Home },
  { key: "forum", label: "Forum", icon: MessageSquareText },
  { key: "scan", label: "Scan / Report", icon: ScanLine },
  { key: "community", label: "Community", icon: Users },
  { key: "store", label: "Store / Rewards", icon: Store },
];

function VolunteerPortal() {
  const [tab, setTab] = useState<BottomTab>("home");
  const { user, logout } = useApp();
  const points = user?.points ?? 1250;
  const rank = useMemo(() => getRank(points), [points]);

  const page = {
    home: <HomePage setTab={setTab} />,
    scan: <ReportPage setTab={setTab} />,
    forum: <ForumPage />,
    community: <CommunityPage />,
    store: <StorePage />,
  }[tab];

  return (
    <div className="min-h-screen overflow-x-hidden text-stone-900 bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="hidden lg:block lg:w-80 lg:p-6">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[32px] border border-orange-100 bg-white/90 p-5 shadow-[0_16px_40px_rgba(122,62,25,0.12)] backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                CivicEye
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight">
                Community Action Platform
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Laporan publik, forum warga, operator task, dan rewards.
              </p>
            </div>

            <div className="mt-6 rounded-[28px] bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-5 text-white shadow-lg shadow-orange-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-50/80">
                    Civic Points
                  </p>
                  <p className="text-3xl font-extrabold mt-1">{points.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-orange-50/90 font-medium mt-0.5">{rank.current}</p>
                </div>
                <div className="rounded-2xl bg-white/15 px-3.5 py-2 text-right">
                  <p className="text-[10px] text-orange-50/85">Next Rank</p>
                  <p className="font-bold text-xs mt-0.5">{rank.next}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-orange-50/80">
                    Dompet Civic
                  </p>
                  <p className="text-base font-extrabold mt-0.5">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(user?.cashBalance ?? 0)}
                  </p>
                </div>
                <p className="text-[10px] text-orange-50/90 font-medium">
                  {rank.nextPointsNeeded} pts to {rank.next}
                </p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      active
                        ? "bg-orange-50 text-orange-700"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition font-semibold"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <header className="mb-4 flex items-center justify-between lg:hidden bg-white/80 p-4 rounded-3xl border border-orange-100 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                CivicEye
              </p>
              <h1 className="text-lg font-bold text-stone-950">Community Platform</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={logout}
                className="rounded-2xl bg-white p-3 shadow-sm border border-orange-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button className="rounded-2xl bg-white p-3 shadow-sm border border-orange-100 text-stone-700 hover:bg-stone-50">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-5xl pb-28 lg:pb-6">
            <div className="mb-4 hidden gap-2 overflow-x-auto rounded-[24px] bg-white/80 p-2 shadow-sm border border-orange-150 md:flex lg:hidden">
              {navItems.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                      active
                        ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            <main className="rounded-[36px] bg-white/75 p-3 shadow-[0_16px_40px_rgba(122,62,25,0.08)] border border-orange-100/80 backdrop-blur sm:p-4 lg:p-6">
              {page}
            </main>
          </div>
        </div>
      </div>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

function AppContent() {
  const { role } = useApp();

  if (role === null) {
    return <LoginScreen />;
  }

  if (role === "staff") {
    return <StaffPortal />;
  }

  return <VolunteerPortal />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}