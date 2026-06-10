import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Briefcase,
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { parseMember } from "./StaffTeamManagement";

export default function StaffFieldTasks() {
  const {
    reports,
    teams,
    updateReportStatus,
    updateTaskAssignmentStatus,
    updateReportNotes,
    cancelTeamAssignment,
    rejectReport,
    addStaffChat,
  } = useApp();

  const [notesEdit, setNotesEdit] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});

  const handleSendChat = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInputs[taskId]?.trim();
    if (!msg) return;

    await addStaffChat(taskId, msg);
    setChatInputs((prev) => ({ ...prev, [taskId]: "" }));
  };

  const activeTasks = reports.filter(
    (r) => r.assignedTeam && r.status !== "Selesai" && r.status !== "Rejected"
  );

  const handleSaveNotes = async (taskId: string) => {
    const notesValue = notesEdit[taskId];
    if (notesValue === undefined) return;
    await updateReportNotes(taskId, notesValue);
    setSaveSuccess((prev) => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setSaveSuccess((prev) => ({ ...prev, [taskId]: false }));
    }, 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100 bg-transparent">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Field Coordination Center
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Monitoring Tugas Lapangan</h2>
      </div>

      <div className="space-y-6">
        {activeTasks.length > 0 ? (
          activeTasks.map((task) => {
            const steps = [
              { label: "New / Assigned", reached: true },
              {
                label: "En Route (Jalan)",
                reached: task.status === "Processing" || task.status === "Needs Review",
              },
              {
                label: "In Progress (Bersih)",
                reached:
                  (task.status === "Processing" &&
                    (task.taskAssignmentStatus === "In Progress" ||
                      task.taskAssignmentStatus === "On Site" ||
                      task.taskAssignmentStatus === "Needs Review")) ||
                  task.status === "Needs Review",
              },
              { label: "Needs Review", reached: task.status === "Needs Review" },
            ];

            const assignedTeamObj = teams.find((t) => t.name === task.assignedTeam);

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
                    <div className="text-left">
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

                  <div className="flex flex-col md:items-end gap-1.5 shrink-0 text-left md:text-right">
                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider">
                      Regu Bertugas
                    </span>
                    <span className="text-xs font-extrabold bg-[#1E4D6B] border border-white/10 text-orange-400 px-3.5 py-1.5 rounded-xl">
                      🚛 {task.assignedTeam}
                    </span>
                  </div>
                </div>

                {/* Crew Members with clickable contacts */}
                {assignedTeamObj && (
                  <div className="bg-[#123956]/60 p-4 rounded-2xl border border-white/5 space-y-2.5 text-left">
                    <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider block">
                      Anggota Regu Bertugas ({assignedTeamObj.members.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {assignedTeamObj.members.map((member) => {
                        const parsed = parseMember(member);
                        return (
                          <div
                            key={member}
                            className="bg-[#1E4D6B]/80 p-3 rounded-xl border border-white/5 flex flex-col justify-between"
                          >
                            <span className="font-bold text-white text-xs truncate" title={parsed.name}>
                              {parsed.name}
                            </span>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={`mailto:${parsed.email}`}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[#123956] hover:bg-[#17415b] border border-white/5 rounded-lg text-[10px] text-orange-400 font-bold hover:underline transition"
                                title={`Kirim email ke ${parsed.name}`}
                              >
                                <Mail className="w-3 h-3" /> Email
                              </a>
                              <a
                                href={`tel:${parsed.phone}`}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-[#123956] hover:bg-[#17415b] border border-white/5 rounded-lg text-[10px] text-orange-400 font-bold hover:underline transition"
                                title={`Hubungi ${parsed.name}`}
                              >
                                <Phone className="w-3 h-3" /> Telepon
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Progress bar timeline */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider block text-left">
                    Tahapan Pengerjaan
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {steps.map((step, idx) => (
                      <div
                        key={step.label}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                          step.reached
                            ? "bg-[#1E4D6B] border-emerald-500/45 text-white"
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
                    <span className="text-xs font-bold text-white mt-0.5">{task.assignedSchedule || "Hari Ini"}</span>
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

                {/* Dispatcher Actions */}
                <div className="bg-[#123956] rounded-2xl p-4 border border-white/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase text-stone-300 tracking-wider block text-left">
                    Kontrol Dispatcher & Progress Lapangan
                  </span>
                  
                  <div className="flex flex-wrap gap-2 text-left">
                    {task.status === "New" && (
                      <button
                        onClick={async () => {
                          await updateReportStatus(task.id, "Processing");
                          await updateTaskAssignmentStatus(task.id, "En Route");
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mulai Perjalanan (En Route)
                      </button>
                    )}

                    {task.status === "Processing" && task.taskAssignmentStatus === "En Route" && (
                      <button
                        onClick={() => updateTaskAssignmentStatus(task.id, "On Site")}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Tiba di Lokasi (On Site)
                      </button>
                    )}

                    {task.status === "Processing" && (task.taskAssignmentStatus === "On Site" || task.taskAssignmentStatus === "En Route") && (
                      <button
                        onClick={() => updateTaskAssignmentStatus(task.id, "In Progress")}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                      >
                        <Briefcase className="w-3.5 h-3.5" /> Mulai Pembersihan (In Progress)
                      </button>
                    )}

                    {task.status === "Processing" && task.taskAssignmentStatus === "In Progress" && (
                      <button
                        onClick={async () => {
                          await updateReportStatus(task.id, "Needs Review");
                          await updateTaskAssignmentStatus(task.id, "Needs Review");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Ajukan Review (Needs Review)
                      </button>
                    )}

                    {task.status === "Needs Review" && (
                      <>
                        <button
                          onClick={() => updateReportStatus(task.id, "Selesai")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verifikasi & Selesaikan Tugas
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt("Masukkan alasan penolakan laporan:");
                            if (reason) {
                              await rejectReport(task.id, reason);
                            }
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak Laporan (Spam)
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => cancelTeamAssignment(task.id, task.assignedTeam || "")}
                      className="ml-auto bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-600/35 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Batalkan Penugasan
                    </button>
                  </div>
                </div>

                {/* Dispatcher Notes Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="md:col-span-2 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Catatan & Instruksi Dispatcher
                      </label>
                      <input
                        type="text"
                        value={notesEdit[task.id] !== undefined ? notesEdit[task.id] : (task.notes || "")}
                        onChange={(e) => setNotesEdit((prev) => ({ ...prev, [task.id]: e.target.value }))}
                        placeholder="Contoh: Bawa sekop tambahan, sampah menyumbat parit..."
                        className="w-full bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveNotes(task.id)}
                      className="bg-[#1E4D6B] hover:bg-[#235b7e] border border-white/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs shrink-0 flex items-center gap-1.5 transition active:scale-[0.98]"
                    >
                      {saveSuccess[task.id] ? "Saved!" : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Save
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 tracking-wider mb-1.5">
                      Ubah Status Penugasan
                    </label>
                    <select
                      value={task.taskAssignmentStatus || "Available"}
                      onChange={(e) => updateTaskAssignmentStatus(task.id, e.target.value)}
                      className="w-full bg-[#123956] text-orange-400 font-bold border border-white/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="En Route">En Route (Dalam Perjalanan)</option>
                      <option value="On Site">On Site (Tiba di Lokasi)</option>
                      <option value="In Progress">In Progress (Pembersihan)</option>
                      <option value="Needs Review">Needs Review (Menunggu Review)</option>
                      <option value="Completed">Completed (Selesai)</option>
                    </select>
                  </div>
                </div>

                {/* Chat Komunikasi Tim */}
                <div className="bg-[#123956]/60 p-4 rounded-2xl border border-white/5 space-y-3 text-left">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                    Obrolan & Log Aktivitas Regu
                  </span>

                  {/* Chat messages list */}
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-[#092033]/60 rounded-xl text-xs border border-white/5">
                    {task.chat && task.chat.length > 0 ? (
                      task.chat.map((msg) => (
                        <div key={msg.id} className="bg-[#123956]/80 p-2.5 rounded-xl border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-orange-400">{msg.sender}</span>
                            <span className="text-stone-400">{msg.time}</span>
                          </div>
                          <p className="text-white text-xs leading-relaxed">{msg.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-stone-500 text-[10px]">
                        Belum ada pesan obrolan. Gunakan form di bawah untuk mengirim pesan koordinasi.
                      </div>
                    )}
                  </div>

                  {/* Chat input form */}
                  <form onSubmit={(e) => handleSendChat(task.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInputs[task.id] || ""}
                      onChange={(e) => setChatInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      placeholder="Ketik koordinasi tim lapangan..."
                      className="flex-1 bg-[#0A2540] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-400 transition"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#E27D3A] hover:bg-orange-600 text-white rounded-xl transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
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
