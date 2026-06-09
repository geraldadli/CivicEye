import React from "react";
import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, PieChart, Sparkles } from "lucide-react";

export default function StaffAnalytics() {
  const { reports } = useApp();

  const total = reports.length || 1;
  const cats = {
    waste: reports.filter((r) => r.title.includes("Sampah") || r.title.includes("Daun")).length,
    light: reports.filter((r) => r.title.includes("Lampu")).length,
    water: reports.filter((r) => r.title.includes("Saluran") || r.title.includes("Air")).length,
    road: reports.filter((r) => r.title.includes("Jalan Rusak") || r.title.includes("Lubang")).length,
  };

  const status = {
    new: reports.filter((r) => r.status === "New").length,
    processing: reports.filter((r) => r.status === "Processing" || r.status === "Needs Review").length,
    solved: reports.filter((r) => r.status === "Selesai").length,
    rejected: reports.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100 bg-[#0F354D]">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Data & Analytics Hub
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Analisis Laporan Warga</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Laporan Berdasarkan Kategori */}
        <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-white text-base">Laporan Berdasarkan Kategori</h3>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: "Sampah / Kebersihan", count: cats.waste, color: "from-orange-500 to-orange-400" },
              { label: "Penerangan Jalan", count: cats.light, color: "from-amber-400 to-yellow-300" },
              { label: "Saluran Air / Drainase", count: cats.water, color: "from-blue-500 to-cyan-400" },
              { label: "Infrastruktur / Jalan Rusak", count: cats.road, color: "from-red-500 to-red-400" },
            ].map((cat) => {
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-stone-300">{cat.label}</span>
                    <span className="text-white">
                      {cat.count} Laporan ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#1E4D6B] h-3 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Distribusi Status Laporan */}
        <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <PieChart className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-white text-base">Distribusi Status Kasus</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center flex-1 py-4">
            {/* Visual SVG Donut Chart */}
            <div className="relative w-36 h-36 mx-auto shrink-0 flex items-center justify-center bg-transparent">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1E4D6B" strokeWidth="4.2" />
                {/* Solved circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="4.2"
                  strokeDasharray={`${(status.solved / total) * 100} ${100 - (status.solved / total) * 100}`}
                  strokeDashoffset="0"
                />
                {/* Processing circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="4.2"
                  strokeDasharray={`${(status.processing / total) * 100} ${100 - (status.processing / total) * 100}`}
                  strokeDashoffset={`-${(status.solved / total) * 100}`}
                />
                {/* New circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="4.2"
                  strokeDasharray={`${(status.new / total) * 100} ${100 - (status.new / total) * 100}`}
                  strokeDashoffset={`-${((status.solved + status.processing) / total) * 100}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-none">
                <span className="text-xl font-extrabold text-white">{reports.length}</span>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total</span>
              </div>
            </div>

            {/* Labels and values */}
            <div className="space-y-2.5">
              {[
                { label: "Selesai (Solved)", count: status.solved, color: "bg-emerald-500 text-emerald-400" },
                { label: "Proses (Processing)", count: status.processing, color: "bg-blue-500 text-blue-400" },
                { label: "Baru (New)", count: status.new, color: "bg-orange-500 text-orange-400" },
                { label: "Ditolak (Rejected)", count: status.rejected, color: "bg-stone-500 text-stone-400" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color.split(" ")[0]}`} />
                    <span className="text-stone-300 font-semibold">{s.label.split(" ")[0]}</span>
                  </div>
                  <span className="font-bold text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="font-bold text-white text-base">Key Performance Indicators</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E4D6B] p-4.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Rata-rata Waktu Respon</span>
            <p className="text-xl font-extrabold text-white mt-1">~12 Menit</p>
            <p className="text-[10px] text-stone-400 mt-1">Target Dinas: &lt; 20 menit</p>
          </div>
          <div className="bg-[#1E4D6B] p-4.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Tingkat Kepuasan Warga</span>
            <p className="text-xl font-extrabold text-white mt-1">4.8 / 5.0</p>
            <p className="text-[10px] text-stone-400 mt-1">Berdasarkan 120 survey warga</p>
          </div>
          <div className="bg-[#1E4D6B] p-4.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Predikat Wilayah</span>
              <p className="text-xl font-extrabold text-white mt-1">Zona Hijau</p>
              <p className="text-[10px] text-stone-400 mt-1">Respon cepat & bersih</p>
            </div>
            <Sparkles className="w-8 h-8 text-orange-400 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
