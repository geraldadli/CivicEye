import React from "react";
import { useApp } from "@/context/AppContext";
import { Briefcase, MapPin, Truck, ShieldCheck, Clock } from "lucide-react";

export default function StaffFieldTasks() {
  const { reports } = useApp();

  const activeTasks = reports.filter(
    (r) => r.assignedTeam && r.status !== "Selesai" && r.status !== "Rejected"
  );

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Field Coordination Center
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Monitoring Tugas Lapangan</h2>
      </div>

      <div className="space-y-4">
        {activeTasks.length > 0 ? (
          activeTasks.map((task) => {
            const steps = [
              { label: "Diterima / New", reached: true },
              { label: "Petugas Ditugaskan", reached: !!task.assignedTeam },
              { label: "Proses Pembersihan", reached: task.status === "Processing" || task.status === "Needs Review" },
              { label: "Verifikasi Review", reached: task.status === "Needs Review" },
            ];

            return (
              <div
                key={task.id}
                className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-5 shadow-lg flex flex-col justify-between"
              >
                {/* Task Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/25 rounded-2xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{task.title}</h3>
                        <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                          ID #{task.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {task.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                      Regu Bertugas
                    </span>
                    <span className="text-xs font-extrabold bg-[#1E4D6B] border border-white/10 text-orange-400 px-3.5 py-1.5 rounded-xl">
                      🚛 {task.assignedTeam}
                    </span>
                  </div>
                </div>

                {/* Progress bar timeline */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider block">
                    Tahapan Pengerjaan
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {steps.map((step, idx) => (
                      <div
                        key={step.label}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                          step.reached
                            ? "bg-[#1E4D6B] border-emerald-500/40 text-white"
                            : "bg-[#123956] border-white/5 text-stone-400"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                            step.reached ? "bg-emerald-500 text-white" : "bg-[#092033] text-stone-500"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[10px] font-bold leading-tight">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
                  <div className="bg-[#1E4D6B]/40 p-3 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-400 mb-1" />
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Jadwal Tugas</span>
                    <span className="text-xs font-bold text-white mt-0.5">{task.assignedSchedule || "Sudah Dijadwalkan"}</span>
                  </div>
                  <div className="bg-[#1E4D6B]/40 p-3 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <Truck className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Jarak Lokasi</span>
                    <span className="text-xs font-bold text-white mt-0.5">~1.2 Km</span>
                  </div>
                  <div className="bg-[#1E4D6B]/40 p-3 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Status Penugasan</span>
                    <span className="text-xs font-bold text-white mt-0.5">{task.taskAssignmentStatus || "Assigned"}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#17415B] border border-white/5 rounded-[32px] text-stone-300">
            <Briefcase className="w-8 h-8 mx-auto text-stone-500 mb-3" />
            <p className="font-bold">Tidak Ada Tugas Lapangan Aktif</p>
            <p className="text-xs mt-1">Gunakan Report Inbox untuk menugaskan Regu Lapangan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
