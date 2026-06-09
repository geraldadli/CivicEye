import React from "react";
import { useApp } from "@/context/AppContext";
import { ClipboardList, ShieldAlert, Award, Radio, ChevronRight } from "lucide-react";

export default function StaffDashboard({
  setActiveTab,
}: {
  setActiveTab: (tab: "home" | "inbox" | "teams" | "tasks" | "analytics" | "settings") => void;
}) {
  const { reports, teams } = useApp();

  const stats = {
    total: reports.length,
    new: reports.filter((r) => r.status === "New").length,
    processing: reports.filter((r) => r.status === "Processing").length,
    review: reports.filter((r) => r.status === "Needs Review").length,
    resolved: reports.filter((r) => r.status === "Selesai").length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
  };

  const activeTeamsCount = teams.filter((t) => t.status !== "Offline").length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Dashboard Ringkasan
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Status Operasional CivicEye</h2>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E4D6B] p-5 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300">Total Laporan</span>
            <ClipboardList className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.total}</p>
          <p className="text-xs text-stone-400">{stats.new} laporan baru masuk</p>
        </div>

        <div className="bg-[#1E4D6B] p-5 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300">Sedang Diproses</span>
            <Radio className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.processing}</p>
          <p className="text-xs text-stone-400">{stats.review} butuh review petugas</p>
        </div>

        <div className="bg-[#1E4D6B] p-5 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300">Selesai Ditangani</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.resolved}</p>
          <p className="text-xs text-stone-400">Tingkat resolusi {Math.round((stats.resolved / (stats.total || 1)) * 100)}%</p>
        </div>

        <div className="bg-[#1E4D6B] p-5 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300">Tim Lapangan Aktif</span>
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{activeTeamsCount} / {teams.length}</p>
          <p className="text-xs text-stone-400">{teams.filter((t) => t.status === "Available").length} tim siap bertugas</p>
        </div>
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Laporan Terbaru */}
        <div className="lg:col-span-2 bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Laporan Terbaru Butuh Respon</h3>
            <button
              onClick={() => setActiveTab("inbox")}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              Lihat Semua Inbox <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {reports
              .filter((r) => r.status === "New" || r.status === "Needs Review")
              .slice(0, 4)
              .map((report) => (
                <div
                  key={report.id}
                  onClick={() => setActiveTab("inbox")}
                  className="flex items-center justify-between p-4 bg-[#1E4D6B]/50 hover:bg-[#1E4D6B] rounded-2xl border border-white/5 transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{report.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          report.status === "New"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">
                      {report.location} • {report.time}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              ))}
            {reports.filter((r) => r.status === "New" || r.status === "Needs Review").length === 0 && (
              <div className="text-center py-8 text-stone-400 text-sm">
                Tidak ada laporan baru atau yang memerlukan review saat ini. Semua terkendali!
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Tim Lapangan Status */}
        <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Status Tim</h3>
            <button
              onClick={() => setActiveTab("teams")}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              Kelola Tim
            </button>
          </div>

          <div className="space-y-3.5">
            {teams.map((team) => (
              <div
                key={team.name}
                className="flex items-center justify-between p-3.5 bg-[#1E4D6B]/40 rounded-2xl border border-white/5"
              >
                <div>
                  <p className="font-bold text-white text-sm">{team.name}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Anggota: {team.members.join(", ")}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-1 rounded-full uppercase ${
                    team.status === "Available"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : team.status === "Active"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-stone-500/20 text-stone-400 border border-stone-500/30"
                  }`}
                >
                  {team.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
