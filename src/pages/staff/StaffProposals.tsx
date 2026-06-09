import React, { useState } from "react";
import { useApp, ProjectProposal } from "@/context/AppContext";
import { MessageSquare, Check, X, FileText, Coins } from "lucide-react";
import { rupiah } from "@/utils/format";

export default function StaffProposals() {
  const {
    proposals,
    projects,
    approveProjectProposal,
    rejectProjectProposal,
    updateProjectTargetFund,
  } = useApp();

  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  // Local state for proposal target inputs
  const [customTargets, setCustomTargets] = useState<Record<string, string>>({});
  const [editTargets, setEditTargets] = useState<Record<string, string>>({});

  const filteredProposals = proposals.filter((p) => p.status === filter);

  const handleApprove = (id: string, title: string) => {
    const targetVal = customTargets[id] || "10000000";
    const fundAmount = parseInt(targetVal, 10);
    if (isNaN(fundAmount) || fundAmount <= 0) {
      alert("Masukkan jumlah target dana yang valid.");
      return;
    }

    approveProjectProposal(id, fundAmount);
    alert(
      `Usulan Proyek "${title}" disetujui!\nProyek aksi gotong royong warga telah aktif diterbitkan di Forum Komunitas Warga dengan target dana ${rupiah(
        fundAmount
      )}.`
    );
  };

  const handleReject = (id: string, title: string) => {
    const confirmReject = window.confirm(`Tolak usulan proyek "${title}"?`);
    if (!confirmReject) return;
    rejectProjectProposal(id);
    alert(`Usulan Proyek "${title}" ditolak.`);
  };

  const handleSaveEdit = (projectId: string, title: string) => {
    const val = editTargets[projectId] || "";
    const fundAmount = parseInt(val, 10);
    if (isNaN(fundAmount) || fundAmount <= 0) {
      alert("Masukkan jumlah target dana yang valid.");
      return;
    }

    updateProjectTargetFund(projectId, fundAmount);
    alert(`Target dana proyek "${title}" berhasil diperbarui menjadi ${rupiah(fundAmount)}!`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100 bg-[#0F354D]">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Citizen Proposal Review Queue
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Usulan Proyek Aksi Warga</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-[#123956] rounded-2xl w-fit border border-white/5">
        {[
          { key: "pending", label: `Pending (${proposals.filter((p) => p.status === "pending").length})` },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              filter === tab.key
                ? "bg-[#E27D3A] text-white shadow-md"
                : "text-stone-300 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals Grid/List */}
      <div className="space-y-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((prop) => {
            const project = projects.find((p) => p.id === prop.id);
            const pendingVal = customTargets[prop.id] || "10000000";
            const editVal =
              editTargets[prop.id] !== undefined
                ? editTargets[prop.id]
                : project?.target.toString() || "";

            return (
              <div
                key={prop.id}
                className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4 shadow-lg text-left"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base leading-snug">{prop.title}</h3>
                      <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                        {prop.id}
                      </span>
                      <span className="text-[10px] bg-[#1E4D6B] border border-white/10 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                        {prop.category === "Greenery"
                          ? "🌳 Greening"
                          : prop.category === "Repair"
                          ? "🚧 Repair"
                          : "🌊 Cleanup"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 font-medium">
                      Diusulkan oleh: <span className="text-orange-400">{prop.proposerName}</span> · Lokasi: {prop.location}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                      prop.status === "pending"
                        ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                        : prop.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>

                {/* Description */}
                <div className="bg-[#1E4D6B]/40 p-4.5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    Rincian Usulan Proyek
                  </span>
                  <p className="text-xs text-stone-200 leading-relaxed">{prop.description}</p>
                </div>

                {/* Pendataan Dana (Approved Only) */}
                {prop.status === "approved" && project && (
                  <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-orange-400" />
                        Status Pendanaan
                      </span>
                      <p className="text-xs text-stone-200">
                        Terkumpul: <span className="font-bold text-emerald-400">{rupiah(project.donated)}</span> dari target <span className="font-bold text-white">{rupiah(project.target)}</span>
                      </p>
                    </div>

                    <div className="flex items-end gap-2 shrink-0">
                      <div className="flex flex-col gap-1 w-36">
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                          Edit Target Dana
                        </label>
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditTargets({ ...editTargets, [prop.id]: e.target.value })}
                          className="bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-400 transition"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(prop.id, prop.title)}
                        className="bg-[#E27D3A] hover:bg-orange-600 px-3 py-2 rounded-xl text-xs font-bold text-white transition active:scale-[0.98]"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons (Pending only) */}
                {prop.status === "pending" && (
                  <div className="pt-3 border-t border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1 w-full md:w-48">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Set Target Dana (Rupiah)
                      </label>
                      <input
                        type="number"
                        value={pendingVal}
                        onChange={(e) => setCustomTargets({ ...customTargets, [prop.id]: e.target.value })}
                        className="bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-400 transition"
                      />
                    </div>

                    <div className="flex gap-3 flex-1 w-full">
                      <button
                        type="button"
                        onClick={() => handleReject(prop.id, prop.title)}
                        className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-[#a83232]/40 bg-[#a83232]/10 hover:bg-[#a83232]/25 text-red-200 transition flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4 text-red-400" />
                        Tolak Usulan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(prop.id, prop.title)}
                        className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        Setujui & Terbitkan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#17415B] border border-white/5 rounded-[32px] text-stone-300">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-500 mb-3" />
            <p className="font-bold">Tidak Ada Usulan Proyek ({filter})</p>
            <p className="text-xs mt-1">
              {filter === "pending"
                ? "Semua usulan warga telah selesai ditinjau."
                : `Belum ada usulan proyek dengan status ${filter}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
