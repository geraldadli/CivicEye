import React, { useState } from "react";
import { useApp, ProjectProposal } from "@/context/AppContext";
import { MessageSquare, Check, X, FileText } from "lucide-react";

export default function StaffProposals() {
  const { proposals, approveProjectProposal, rejectProjectProposal } = useApp();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  const filteredProposals = proposals.filter((p) => p.status === filter);

  const handleApprove = (id: string, title: string) => {
    approveProjectProposal(id);
    alert(
      `Usulan Proyek "${title}" disetujui!\nProyek aksi gotong royong warga telah aktif diterbitkan di Forum Komunitas Warga.`
    );
  };

  const handleReject = (id: string, title: string) => {
    const confirmReject = window.confirm(`Tolak usulan proyek "${title}"?`);
    if (!confirmReject) return;
    rejectProjectProposal(id);
    alert(`Usulan Proyek "${title}" ditolak.`);
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
          filteredProposals.map((prop) => (
            <div
              key={prop.id}
              className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4 shadow-lg"
            >
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

              {/* Action Buttons (Pending only) */}
              {prop.status === "pending" && (
                <div className="flex gap-3 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleReject(prop.id, prop.title)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-[#a83232]/40 bg-[#a83232]/10 hover:bg-[#a83232]/25 text-red-200 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4 text-red-400" />
                    Tolak Usulan
                  </button>
                  <button
                    onClick={() => handleApprove(prop.id, prop.title)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    Setujui & Terbitkan Proyek
                  </button>
                </div>
              )}
            </div>
          ))
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
