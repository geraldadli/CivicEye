import React, { useEffect, useRef, useState } from "react";
import { useApp, OPERATOR_PAYOUT, type ReportItemExtended } from "@/context/AppContext";
import CameraCapture from "@/components/CameraCapture";
import { rupiah } from "@/utils/format";
import {
  MapPin,
  Check,
  Camera,
  ImagePlus,
  ShieldCheck,
  User,
  ExternalLink,
} from "lucide-react";

// Finished jobs are history: only the most recent few stay in the inbox list.
const HISTORY_LIMIT = 5;

export default function StaffReportInbox() {
  const { reports, userId, acceptReport, submitOperatorReport } = useApp();

  // Reports arrive newest first. Active work is always listed in full.
  const activeReports = reports.filter((r) => r.status !== "Rejected" && r.status !== "Selesai");
  const historyReports = reports.filter((r) => r.status === "Selesai").slice(0, HISTORY_LIMIT);
  const visibleReports = [...activeReports, ...historyReports];

  // Selected report ID (default to the first report in the list if available)
  const [selectedReportId, setSelectedReportId] = useState<string>(
    visibleReports[0]?.id || ""
  );

  // Find the selected report object
  const selectedReport = reports.find((r) => r.id === selectedReportId);

  // Completion report form
  const [progressNote, setProgressNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [completion, setCompletion] = useState<{ title: string; payout: number; balance: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!proofFile) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  // Mobile layout state: "list" | "detail" | "toolbar"
  const [mobileView, setMobileView] = useState<"list" | "detail" | "toolbar">("list");

  // Keep track of checkboxed select states
  const [checkedReports, setCheckedReports] = useState<Record<string, boolean>>({});

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setProgressNote("");
    setProofFile(null);
    setCameraOpen(false);
    setMessage(null);
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

  const selectProof = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) {
      setMessage({ kind: "error", text: "Pilih gambar dengan ukuran maksimal 20MB." });
      return;
    }
    setMessage(null);
    setProofFile(file);
    setCameraOpen(false);
  };

  const handleAccept = async () => {
    if (!selectedReport) return;
    setBusy(true);
    setMessage(null);
    try {
      await acceptReport(selectedReport.id);
      if (window.innerWidth < 1024) setMobileView("toolbar");
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!proofFile) {
      setMessage({ kind: "error", text: "Ambil atau unggah foto hasil pekerjaan terlebih dahulu." });
      return;
    }
    if (!progressNote.trim()) {
      setMessage({ kind: "error", text: "Tuliskan laporan singkat pekerjaan Anda." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await submitOperatorReport(selectedReport.id, progressNote.trim(), proofFile);
      setProgressNote("");
      setProofFile(null);
      if (result) {
        setCompletion({ title: selectedReport.title, ...result });
      }
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  const renderReportCard = (report: ReportItemExtended) => {
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
          {activeReports.map(renderReportCard)}

          {activeReports.length === 0 && (
            <div className="text-center py-12 text-[#A6C5E3] text-sm">
              Tidak ada laporan aktif di inbox.
            </div>
          )}

          {historyReports.length > 0 && (
            <>
              <p className="px-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Riwayat Selesai · {HISTORY_LIMIT} Terakhir
              </p>
              {historyReports.map(renderReportCard)}
            </>
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
                Tindakan →
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
              <div className="h-60 relative w-full">
                <iframe
                  title="Google Map View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    selectedReport.location
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
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
                {selectedReport.proofPhotoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-emerald-500/40 h-32 relative">
                    <img
                      src={selectedReport.proofPhotoUrl}
                      alt="Bukti Operator"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 pointer-events-none">
                      <span className="text-[10px] font-bold text-white">Bukti Operator</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#1E4D6B] h-32 flex items-center justify-center text-center p-3 text-[10px] text-stone-400">
                    Foto hasil pekerjaan muncul di sini setelah laporan operator dikirim.
                  </div>
                )}
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
              <span className="text-xs text-stone-400">Tindakan</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-stone-400 tracking-widest">
                Tindakan Operator
              </h3>
              <ol className="grid grid-cols-3 gap-2">
                {["Terima", "Foto & Deskripsi", "Kirim & Dibayar"].map((label, idx) => {
                  const step =
                    selectedReport.status === "New" ? 0 : selectedReport.status === "Selesai" ? 3 : 1;
                  const done = idx < step;
                  const current = idx === step;
                  return (
                    <li
                      key={label}
                      className={`rounded-xl border p-2 text-center text-[10px] font-bold leading-tight ${
                        done
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : current
                          ? "border-orange-400/70 bg-orange-500/10 text-orange-300"
                          : "border-[#1E4D6B] text-stone-500"
                      }`}
                    >
                      <span className="block text-xs">{done ? "✓" : idx + 1}</span>
                      {label}
                    </li>
                  );
                })}
              </ol>
            </div>

            {message && (
              <div
                role={message.kind === "error" ? "alert" : "status"}
                className={`p-3 rounded-xl text-xs border ${
                  message.kind === "ok"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            {selectedReport.status === "Selesai" ? (
              <div className="p-4 bg-[#123956] border border-emerald-500/30 rounded-2xl space-y-2">
                <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Laporan Selesai
                </p>
                {selectedReport.operatorName && (
                  <p className="text-xs text-stone-300">Dikerjakan oleh {selectedReport.operatorName}</p>
                )}
                {selectedReport.notes && (
                  <p className="text-xs text-stone-200 leading-relaxed">{selectedReport.notes}</p>
                )}
              </div>
            ) : selectedReport.status === "New" ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-300 leading-relaxed">
                  Terima laporan ini untuk mengerjakannya. Setelah selesai, kirim laporan hasil pekerjaan
                  dan upah {rupiah(OPERATOR_PAYOUT)} dibayarkan otomatis.
                </p>
                <button
                  onClick={handleAccept}
                  disabled={busy}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {busy ? "Memproses..." : "Accept & Process"}
                </button>
              </div>
            ) : selectedReport.operatorId && selectedReport.operatorId !== userId ? (
              <div className="p-4 bg-[#123956] border border-[#1E4D6B] rounded-2xl text-xs text-stone-300">
                Sedang dikerjakan oleh{" "}
                <span className="font-bold text-white">{selectedReport.operatorName || "operator lain"}</span>.
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReport}
                className="space-y-4 rounded-2xl border border-orange-400/40 bg-[#0F3350] p-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">Laporan Progress Operator</p>
                  <p className="text-xs text-stone-300 leading-relaxed mt-1">
                    Foto hasil pekerjaan dan ceritakan apa yang sudah dikerjakan. Setelah dikirim, tugas
                    selesai dan upah {rupiah(OPERATOR_PAYOUT)} langsung dibayarkan.
                  </p>
                </div>

                <div className="rounded-2xl border border-dashed border-[#2b6d98] bg-[#123956] p-4 text-center space-y-3">
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) selectProof(file);
                      e.target.value = "";
                    }}
                  />
                  {cameraOpen ? (
                    <CameraCapture onCapture={selectProof} onClose={() => setCameraOpen(false)} />
                  ) : proofPreview ? (
                    <img src={proofPreview} alt="Foto hasil pekerjaan" className="mx-auto h-32 w-full object-cover rounded-xl" />
                  ) : (
                    <p className="text-xs text-stone-300 font-semibold">Foto hasil pekerjaan (wajib)</p>
                  )}
                  {!cameraOpen && (
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCameraOpen(true)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" /> {proofFile ? "Ambil Ulang" : "Kamera"}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E4D6B] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <ImagePlus className="w-4 h-4" /> Unggah
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="progress-note" className="block text-[10px] font-bold uppercase text-stone-300 tracking-wider mb-1.5">
                    Deskripsi Pekerjaan
                  </label>
                  <textarea
                    id="progress-note"
                    rows={3}
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="Contoh: Sampah sudah diangkut 2 karung, area sudah bersih."
                    className="w-full bg-[#123956] border border-[#1E4D6B] rounded-xl p-3 text-xs text-white placeholder:text-stone-500 outline-none focus:border-orange-400 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy || cameraOpen}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {busy ? "Mengirim..." : "Kirim Laporan & Selesaikan"}
                </button>
              </form>
            )}
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

      {completion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center text-stone-900 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 id="completion-title" className="mt-4 text-xl font-extrabold">Tugas Selesai!</h3>
            <p className="mt-1 text-sm text-stone-500">{completion.title}</p>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Upah Diterima</p>
              <p className="mt-1 text-3xl font-extrabold text-emerald-700">+{rupiah(completion.payout)}</p>
              <p className="mt-2 text-xs text-stone-500">Saldo dompet sekarang {rupiah(completion.balance)}</p>
            </div>

            <button
              onClick={() => setCompletion(null)}
              autoFocus
              className="mt-5 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
