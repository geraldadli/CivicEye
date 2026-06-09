import React from "react";
import { useApp } from "@/context/AppContext";
import { Users, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

export default function StaffTeamManagement() {
  const { teams, updateTeamStatus, reports } = useApp();

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Operations Management
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Kelola Tim Lapangan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const currentTask = team.currentTaskId
            ? reports.find((r) => r.id === team.currentTaskId)
            : null;

          return (
            <div
              key={team.name}
              className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-4">
                {/* Team Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{team.name}</h3>
                      <p className="text-xs text-stone-400">
                        {team.members.length} Petugas Lapangan
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                      team.status === "Available"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : team.status === "Active"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-stone-500/10 text-stone-400 border-stone-500/30"
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                {/* Team Members List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider">
                    Anggota Regu
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <span
                        key={member}
                        className="text-xs bg-[#1E4D6B] px-3 py-1.5 rounded-xl border border-white/5 font-semibold text-white"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Current Activity */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider block">
                    Tugas Berjalan
                  </span>
                  {team.status === "Active" && currentTask ? (
                    <div className="bg-[#1E4D6B]/50 p-3 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-xs font-bold text-white leading-tight">
                        {currentTask.title}
                      </p>
                      <p className="text-[10px] text-stone-300 leading-tight">
                        Lokasi: {currentTask.location}
                      </p>
                      <span className="text-[9px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 uppercase mt-2 inline-block">
                        ID #{currentTask.id} · {currentTask.status}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400">Tidak ada tugas aktif.</p>
                  )}
                </div>
              </div>

              {/* Status Update Button */}
              <div className="pt-4 border-t border-white/5">
                <label className="block text-[10px] font-bold uppercase text-stone-300 tracking-wider mb-2">
                  Ubah Status Regu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Siap", value: "Available" },
                    { label: "Sibuk", value: "Active" },
                    { label: "Offline", value: "Offline" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() =>
                        updateTeamStatus(team.name, s.value as "Available" | "Active" | "Offline")
                      }
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition ${
                        team.status === s.value
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-[#1E4D6B] hover:bg-[#235b80] text-stone-300 border-white/5"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
