import React, { useState } from "react";
import { useApp, ReportItemExtended, ReportStatus } from "@/context/AppContext";
import {
  MapPin,
  Check,
  RotateCw,
  X,
  MessageSquare,
  ShieldCheck,
  Send,
  User,
  ExternalLink,
} from "lucide-react";

export default function StaffReportInbox() {
  const {
    reports,
    teams,
    updateReportStatus,
    assignReportTeam,
    assignReportSchedule,
    addStaffChat,
    updateReportNotes,
    updateTaskAssignmentStatus,
    rejectReport,
  } = useApp();

  // Selected report ID (default to the first report in the list if available)
  const nonRejectedReports = reports.filter((r) => r.status !== "Rejected");
  const [selectedReportId, setSelectedReportId] = useState<string>(
    nonRejectedReports[0]?.id || ""
  );

  // Find the selected report object
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  // Local state for forms
  const [rejectReason, setRejectReason] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [staffNote, setStaffNote] = useState("");

  // Mobile layout state: "list" | "detail" | "toolbar"
  const [mobileView, setMobileView] = useState<"list" | "detail" | "toolbar">("list");

  // Keep track of checkboxed select states
  const [checkedReports, setCheckedReports] = useState<Record<string, boolean>>({});

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setRejectReason("");
    setChatMessage("");
    setStaffNote(reports.find((r) => r.id === id)?.notes || "");
    if (window.innerWidth < 1024) {
      setMobileView("detail");
    }
  };

  const handleCheckboxToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the report for detail view
    setCheckedReports((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAcceptProcess = () => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, "Processing");
  };

  const handleAssignTeam = (teamName: string) => {
    if (!selectedReport || !teamName) return;
    assignReportTeam(selectedReport.id, teamName);
  };

  const handleAssignSchedule = (schedule: string) => {
    if (!selectedReport || !schedule) return;
    assignReportSchedule(selectedReport.id, schedule);
  };

  const handleReject = () => {
    if (!selectedReport) return;
    if (!rejectReason.trim()) {
      alert("Masukkan alasan penolakan terlebih dahulu.");
      return;
    }
    rejectReport(selectedReport.id, rejectReason);
    setRejectReason("");
    // Autoselect the next available report
    const remaining = reports.filter((r) => r.status !== "Rejected" && r.id !== selectedReport.id);
    if (remaining.length > 0) {
      setSelectedReportId(remaining[0].id);
    } else {
      setSelectedReportId("");
    }
    if (window.innerWidth < 1024) {
      setMobileView("list");
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !chatMessage.trim()) return;
    addStaffChat(selectedReport.id, chatMessage);
    setChatMessage("");
  };

  const handleSaveNotes = () => {
    if (!selectedReport) return;
    updateReportNotes(selectedReport.id, staffNote);
    alert("Catatan petugas berhasil disimpan.");
  };

  const handleTaskStatusChange = (status: string) => {
    if (!selectedReport) return;
    updateTaskAssignmentStatus(selectedReport.id, status);
  };

  const handleFinishTask = () => {
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, "Selesai");
    alert("Masalah ditandai selesai! Volunteer akan menerima notifikasi dan poin reward.");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden text-stone-800 bg-[#0A2540]">
      {/* COLUMN 1: REPORT LIST (Laporan Terakhir) */}
      <div
        className={`${
          mobileView !== "list" ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 flex-col border-r border-[#1E4D6B] bg-[#0C304A] h-full shrink-0`}
      >
        <div className="p-4 border-b border-[#1E4D6B]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            Laporan Terakhir
          </h3>
          <p className="text-[11px] text-[#A6C5E3] mt-1 leading-tight">
            Pantau status laporan publik dan progress penanganannya.
          </p>
        </div>

        {/* Scrollable reports list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {nonRejectedReports.map((report) => {
            const isSelected = report.id === selectedReportId;
            const isChecked = !!checkedReports[report.id];
            return (
              <div
                key={report.id}
                onClick={() => handleSelectReport(report.id)}
                className={`flex gap-3 p-3 rounded-2xl cursor-pointer border transition text-left relative ${
                  isSelected
                    ? "bg-[#1E4D6B] border-orange-400/80 shadow-[0_4px_16px_rgba(249,115,22,0.15)]"
                    : "bg-[#123956] border-[#1E4D6B] hover:bg-[#184464]"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#092033] px-2 py-1 rounded-lg border border-white/5 z-10" onClick={(e) => handleCheckboxToggle(report.id, e)}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-3.5 h-3.5 rounded border-stone-400 text-orange-500 focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-[#A6C5E3]">Select</span>
                </div>

                {/* Status dot / indicator */}
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 ${
                      report.status === "New"
                        ? "bg-orange-500"
                        : report.status === "Processing"
                        ? "bg-[#3498db]"
                        : report.status === "Needs Review"
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>

                {/* Report basic info */}
                <div className="flex-1 min-w-0 pr-12">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                      report.status === "New"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/25"
                        : report.status === "Processing"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/25"
                        : report.status === "Needs Review"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/25"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25"
                    }`}
                  >
                    {report.status === "New" ? "New" : report.status}
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1.5 truncate">
                    {report.title}
                  </h4>
                  <p className="text-xs text-[#A6C5E3] mt-0.5 truncate">{report.location}</p>
                  <p className="text-[10px] text-stone-400 mt-2">{report.time}</p>
                </div>

                {/* Photo Thumbnail */}
                <div className="w-12 h-12 bg-black/20 rounded-xl overflow-hidden shrink-0 border border-white/5">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          })}

          {nonRejectedReports.length === 0 && (
            <div className="text-center py-12 text-[#A6C5E3] text-sm">
              Tidak ada laporan aktif di inbox.
            </div>
          )}
        </div>
      </div>

      {/* REPORT WORK AREA (COLUMNS 2 & 3 Combined or Swapped on Mobile) */}
      {selectedReport ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* COLUMN 2: REPORT DETAILS (Map, Photos, Citizen Info) */}
          <div
            className={`${
              mobileView !== "detail" ? "hidden lg:flex" : "flex"
            } flex-1 flex-col overflow-y-auto p-5 space-y-5 border-r border-[#1E4D6B] bg-[#0E3554]`}
          >
            {/* Mobile Navigation bar inside details */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#1E4D6B]">
              <button
                onClick={() => setMobileView("list")}
                className="text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                ← Kembali ke List
              </button>
              <button
                onClick={() => setMobileView("toolbar")}
                className="text-xs font-bold bg-[#E27D3A] text-white px-3 py-1.5 rounded-xl shadow"
              >
                Buka Toolbar Tindakan →
              </button>
            </div>

            {/* Header info */}
            <div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                Detail Laporan #{selectedReport.id}
              </p>
              <h2 className="text-xl font-bold text-white mt-1">
                {selectedReport.title}
              </h2>
            </div>

            {/* Google Map Mockup */}
            <div className="rounded-2xl border border-[#1E4D6B] overflow-hidden bg-[#0A2540] relative">
              <div className="p-3 bg-[#0A2540] flex items-center justify-between border-b border-[#1E4D6B]">
                <div className="flex items-center gap-2 text-stone-200">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold">{selectedReport.location}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                  Google Map
                </span>
              </div>
              <div className="h-60 relative">
                <img
                  src="/images/map_mockup.png"
                  alt="Google Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-stone-850 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-stone-200 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {selectedReport.location}
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase font-bold text-stone-300 tracking-wider">
                Photos / Bukti Warga
              </h4>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl overflow-hidden border border-[#1E4D6B] h-32 relative group">
                  <img
                    src={selectedReport.photoUrl}
                    alt="Report Evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 pointer-events-none">
                    <span className="text-[10px] font-bold text-white">Bukti Warga</span>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#1E4D6B] h-32 bg-[#0A2540] flex flex-col items-center justify-center text-stone-400 text-center p-3">
                  <span className="text-[11px] font-bold text-stone-300">Foto Pengawas</span>
                  <p className="text-[9px] mt-1">Belum ada foto pasca-tugas terunggah.</p>
                </div>
              </div>
            </div>

            {/* Citizen info & Detail description */}
            <div className="bg-[#123956] border border-[#1E4D6B] rounded-2xl p-4.5 space-y-3">
              <div>
                <h5 className="text-[10px] font-bold uppercase text-stone-300 tracking-wider">
                  Citizen Info
                </h5>
                <a
                  href={selectedReport.citizenProfile}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold mt-1 hover:underline"
                >
                  <User className="w-3.5 h-3.5" />
                  {selectedReport.citizenName}'s profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <h5 className="text-[10px] font-bold uppercase text-stone-300 tracking-wider">
                  Deskripsi Laporan
                </h5>
                <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                  {selectedReport.details}
                </p>
              </div>
            </div>

            {/* Quick dropdown selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-300 tracking-wider mb-1.5">
                  Current: {selectedReport.assignedTeam || "Not Assigned"}
                </label>
                <select
                  value={selectedReport.assignedTeam || ""}
                  onChange={(e) => handleAssignTeam(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#123956] border border-[#1E4D6B] rounded-xl p-3 outline-none text-white focus:border-orange-400"
                >
                  <option value="">Assign to Field Team</option>
                  {teams
                    .filter((t) => t.status === "Available" || t.name === selectedReport.assignedTeam)
                    .map((team) => (
                      <option key={team.name} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-300 tracking-wider mb-1.5">
                  Schedule
                </label>
                <select
                  value={selectedReport.assignedSchedule || ""}
                  onChange={(e) => handleAssignSchedule(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#123956] border border-[#1E4D6B] rounded-xl p-3 outline-none text-white focus:border-orange-400"
                >
                  <option value="">Schedule Task</option>
                  <option value="Schedule for Friday">Schedule for Friday</option>
                  <option value="Schedule for Saturday">Schedule for Saturday</option>
                  <option value="Schedule for Sunday">Schedule for Sunday</option>
                  <option value="Schedule for Monday">Schedule for Monday</option>
                </select>
              </div>
            </div>
          </div>

          {/* COLUMN 3: INTERNAL OPERATIONS TOOLBAR */}
          <div
            className={`${
              mobileView !== "toolbar" ? "hidden lg:flex" : "flex"
            } w-full lg:w-96 flex-col overflow-y-auto p-5 bg-[#0C2942] border-t lg:border-t-0 lg:border-l border-[#1E4D6B] h-full space-y-4.5 shrink-0`}
          >
            {/* Mobile Navigation bar inside toolbar */}
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#1E4D6B]">
              <button
                onClick={() => setMobileView("detail")}
                className="text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                ← Kembali ke Detail
              </button>
              <span className="text-xs text-stone-400">Operations Toolbar</span>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest">
                INTERNAL OPERATIONS TOOLBAR
              </h3>
            </div>

            {/* Accept & Process */}
            <div className="space-y-2">
              <button
                onClick={handleAcceptProcess}
                disabled={selectedReport.status !== "New"}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
                  selectedReport.status === "New"
                    ? "bg-[#1E4D6B] text-white border-orange-400/80 hover:bg-[#23587a]"
                    : "bg-stone-800/20 text-stone-400 border-stone-850/40 cursor-not-allowed"
                }`}
              >
                <Check className="w-4 h-4 text-orange-400" />
                Accept & Process
              </button>
            </div>

            {/* Quick Team Assign Button */}
            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedReport.assignedTeam || ""}
                  onChange={(e) => handleAssignTeam(e.target.value)}
                  className="w-full py-3 px-4 bg-[#123956] border border-[#1E4D6B] rounded-xl outline-none text-xs font-bold text-white appearance-none cursor-pointer focus:border-orange-400"
                >
                  <option value="">Assign to Field Team</option>
                  {teams.map((t) => (
                    <option key={t.name} value={t.name}>
                      Assign to {t.name} ({t.status})
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                  <RotateCw className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Reject / Duplicate */}
            <div className="p-3 bg-[#123956] border border-[#1E4D6B] rounded-2xl space-y-2.5">
              <button
                onClick={handleReject}
                className="w-full py-2 px-3 bg-[#a83232]/20 hover:bg-[#a83232]/35 border border-[#a83232]/40 text-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <X className="w-4 h-4 text-red-400" />
                Reject / Duplicate
              </button>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan / deskripsi duplikat"
                className="w-full bg-[#0A2540] border border-[#1E4D6B] rounded-xl p-2.5 text-xs text-white placeholder:text-stone-500 outline-none focus:border-orange-400 transition"
              />
            </div>

            {/* Internal Staff Chat */}
            <div className="p-3.5 bg-[#123956] border border-[#1E4D6B] rounded-2xl flex flex-col h-64">
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                Internal Staff Chat
              </span>

              {/* Chat messages box */}
              <div className="flex-1 overflow-y-auto space-y-2 p-1.5 bg-[#092033]/60 rounded-xl mb-2.5 text-xs border border-white/5">
                {selectedReport.chat && selectedReport.chat.length > 0 ? (
                  selectedReport.chat.map((msg) => (
                    <div key={msg.id} className="bg-[#123956] p-2.5 rounded-xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold">
                        <span className="text-orange-400">{msg.sender}</span>
                        <span className="text-stone-400">{msg.time}</span>
                      </div>
                      <p className="text-white text-xs leading-relaxed">{msg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-stone-500 text-[10px]">
                    Belum ada obrolan internal untuk laporan ini. Mulai percakapan di bawah.
                  </div>
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ketik pesan internal..."
                  className="flex-1 bg-[#0A2540] border border-[#1E4D6B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-400 transition"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#E27D3A] hover:bg-orange-600 text-white rounded-xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Task Assignment Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-300 tracking-wider mb-1.5">
                Task Assignment Status
              </label>
              <select
                value={selectedReport.taskAssignmentStatus || "Available"}
                onChange={(e) => handleTaskStatusChange(e.target.value)}
                className="w-full text-xs font-semibold bg-[#123956] border border-[#1E4D6B] rounded-xl p-3 outline-none text-white focus:border-orange-400"
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Busy">Busy</option>
              </select>
            </div>

            {/* Staff Notes (Internal Only) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-stone-300 tracking-wider">
                Tambahkan Catatan Petugas (Hanya Internal)
              </label>
              <textarea
                rows={3}
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Tambahkan Catatan Petugas (Hanya Internal)"
                className="w-full bg-[#123956] border border-[#1E4D6B] rounded-xl p-3 text-xs text-white placeholder:text-stone-500 outline-none focus:border-orange-400 transition resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full py-2 bg-[#1E4D6B] hover:bg-[#256187] text-stone-200 border border-[#2b6d98] rounded-xl text-xs font-semibold transition"
              >
                Simpan Catatan
              </button>
            </div>

            {/* Finish Task & Resolve Problem */}
            <div className="pt-2 border-t border-[#1E4D6B]">
              <button
                onClick={handleFinishTask}
                disabled={selectedReport.status === "Selesai"}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border transition ${
                  selectedReport.status !== "Selesai"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-emerald-400/80 shadow-lg shadow-emerald-900/20 hover:scale-[1.01]"
                    : "bg-stone-800/25 text-stone-400 border-stone-850/40 cursor-not-allowed"
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-100" />
                Selesaikan Laporan (Finish Problem)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-[#A6C5E3]">
          <div>
            <p className="text-base font-bold">Tidak Ada Laporan Terpilih</p>
            <p className="text-xs text-stone-400 mt-1">Silakan pilih laporan dari kolom kiri.</p>
          </div>
        </div>
      )}
    </div>
  );
}
