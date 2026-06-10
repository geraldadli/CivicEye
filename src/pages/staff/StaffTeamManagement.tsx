import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/utils/supabaseClient";
import {
  Users,
  Plus,
  Trash2,
  Send,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Helper to parse member contact details
export function parseMember(memberStr: string) {
  const match = memberStr.match(/^(.*?)\s*\((.*?)\s*\|\s*(.*?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim(),
      phone: match[3].trim(),
    };
  }
  const slug = memberStr.toLowerCase().replace(/\s+/g, "");
  return {
    name: memberStr,
    email: `${slug}@civiceye.id`,
    phone: "0812-XXXX-XXXX",
  };
}

export default function StaffTeamManagement() {
  const {
    teams,
    updateTeamStatus,
    reports,
    createTeam,
    updateTeamMembers,
    updateReportStatus,
    updateTaskAssignmentStatus,
  } = useApp();

  // Registered staff profiles from database
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase.database
          .from("profiles")
          .select("*")
          .eq("role", "staff");
        if (!error && data) {
          setStaffProfiles(data);
        }
      } catch (err) {
        console.error("Error fetching staff profiles:", err);
      }
    };
    fetchStaff();
  }, [teams]);

  // Create Team state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Add Member inputs per team
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [memberEmails, setMemberEmails] = useState<Record<string, string>>({});
  const [memberPhones, setMemberPhones] = useState<Record<string, string>>({});

  // Simulation state
  const [simTeam, setSimTeam] = useState("");
  const [simReportId, setSimReportId] = useState("");
  const [simMessage, setSimMessage] = useState("");
  const [simSubmitReview, setSimSubmitReview] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  // Filter all active reports in the system for simulation (not Selesai / Rejected)
  const activeReportsForSim = reports.filter(
    (r) => r.status !== "Selesai" && r.status !== "Rejected"
  );

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess(false);

    if (!newTeamName.trim()) {
      setCreateError("Nama Tim wajib diisi.");
      return;
    }

    const membersArray = newTeamMembers
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0)
      .map((m) => {
        // Parse or assign default formatting
        const parsed = parseMember(m);
        return `${parsed.name} (${parsed.email} | ${parsed.phone})`;
      });

    if (membersArray.length === 0) {
      setCreateError("Masukkan minimal 1 nama anggota regu.");
      return;
    }

    // Check if team name already exists
    if (
      teams.some(
        (t) => t.name.toLowerCase() === newTeamName.trim().toLowerCase()
      )
    ) {
      setCreateError(`Nama tim "${newTeamName}" sudah terdaftar.`);
      return;
    }

    const success = await createTeam(newTeamName.trim(), membersArray);
    if (success) {
      setNewTeamName("");
      setNewTeamMembers("");
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 3000);
    } else {
      setCreateError("Gagal menyimpan tim ke database.");
    }
  };

  const handleSelectStaffProfile = (teamName: string, staffProfileId: string) => {
    const profile = staffProfiles.find((p) => p.id === staffProfileId);
    if (!profile) return;

    const slug = profile.full_name.toLowerCase().replace(/\s+/g, "");
    const emailFallback = `${slug}.staff@civiceye.id`;
    const email = profile.email || emailFallback;

    setMemberNames((prev) => ({ ...prev, [teamName]: profile.full_name }));
    setMemberEmails((prev) => ({ ...prev, [teamName]: email }));
    setMemberPhones((prev) => ({ ...prev, [teamName]: profile.phone || "0812-XXXX-XXXX" }));
  };

  const handleAddMember = async (teamName: string) => {
    const name = memberNames[teamName]?.trim();
    const email = memberEmails[teamName]?.trim() || `${name?.toLowerCase().replace(/\s+/g, "")}@civiceye.id`;
    const phone = memberPhones[teamName]?.trim() || "0812-XXXX-XXXX";

    if (!name) {
      alert("Nama anggota tidak boleh kosong.");
      return;
    }

    const team = teams.find((t) => t.name === teamName);
    if (!team) return;

    const newMemberFormatted = `${name} (${email} | ${phone})`;

    // Check if member already in team
    const isAlreadyMember = team.members.some((m) => {
      const parsed = parseMember(m);
      return parsed.name.toLowerCase() === name.toLowerCase();
    });

    if (isAlreadyMember) {
      alert("Anggota dengan nama tersebut sudah ada di dalam tim ini.");
      return;
    }

    const updated = [...team.members, newMemberFormatted];
    const success = await updateTeamMembers(teamName, updated);
    if (success) {
      setMemberNames((prev) => ({ ...prev, [teamName]: "" }));
      setMemberEmails((prev) => ({ ...prev, [teamName]: "" }));
      setMemberPhones((prev) => ({ ...prev, [teamName]: "" }));
    }
  };

  const handleRemoveMember = async (teamName: string, memberToRemove: string) => {
    const team = teams.find((t) => t.name === teamName);
    if (!team) return;

    if (team.members.length <= 1) {
      alert("Tim harus memiliki minimal 1 anggota regu.");
      return;
    }

    const parsedTarget = parseMember(memberToRemove);
    const confirmDel = window.confirm(
      `Keluarkan ${parsedTarget.name} dari ${teamName}?`
    );
    if (!confirmDel) return;

    const updated = team.members.filter((m) => m !== memberToRemove);
    await updateTeamMembers(teamName, updated);
  };

  const handleSimulateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimSuccess(false);

    if (!simTeam) {
      alert("Pilih tim lapangan yang ingin melaporkan.");
      return;
    }
    if (!simReportId) {
      alert("Pilih tugas aktif untuk dilaporkan.");
      return;
    }
    if (!simMessage.trim()) {
      alert("Masukkan pesan laporan dari lapangan.");
      return;
    }

    const selectedReport = reports.find((r) => r.id === simReportId);
    if (!selectedReport) return;

    try {
      // 1. Automatically assign the team to the task if not already assigned (connectivity fix)
      if (selectedReport.assignedTeam !== simTeam) {
        await supabase.database
          .from("reports")
          .update({
            assigned_team: simTeam,
            status: "Processing",
          })
          .eq("id", simReportId);

        await supabase.database
          .from("teams")
          .update({
            status: "Active",
            current_task_id: simReportId,
          })
          .eq("name", simTeam);
      }

      // 2. Insert chat message from the simulated team
      const { error: chatErr } = await supabase.database
        .from("report_chats")
        .insert([
          {
            report_id: simReportId,
            sender: `🚛 Regu ${simTeam}`,
            text: simMessage,
            time: "Baru saja",
          },
        ]);

      if (chatErr) throw chatErr;

      // 3. If submitting for review, update report statuses
      if (simSubmitReview) {
        await updateReportStatus(simReportId, "Needs Review");
        await updateTaskAssignmentStatus(simReportId, "Needs Review");
      } else {
        // Just trigger a state refresh in AppContext
        await updateTaskAssignmentStatus(simReportId, "In Progress");
      }

      setSimMessage("");
      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Simulasi Gagal: " + (err.message || err));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100 bg-transparent">
      {/* Page Header */}
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Operations Management
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Kelola & Simulasi Hubungan Tim</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left/Middle Column: Team Cards & Creator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Team Form Card */}
          <section className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 shadow-lg space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Buat Regu Tim Baru</h3>
                <p className="text-xs text-stone-400">Daftarkan tim operasional ke database</p>
              </div>
            </div>

            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                ⚠️ {createError}
              </div>
            )}
            {createSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                ✓ Regu Lapangan Berhasil Didaftarkan!
              </div>
            )}

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    Nama Tim / Regu
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Contoh: Team D, Regu Pembersih 3..."
                    className="w-full bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    Daftar Anggota Awal (Format: Nama (Email | Telp) pisah koma)
                  </label>
                  <input
                    type="text"
                    value={newTeamMembers}
                    onChange={(e) => setNewTeamMembers(e.target.value)}
                    placeholder="Contoh: Andi (andi@mail.com | 08123), Budi"
                    className="w-full bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition active:scale-[0.98]"
              >
                Tambah Tim Baru
              </button>
            </form>
          </section>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => {
              const currentTask = team.currentTaskId
                ? reports.find((r) => r.id === team.currentTaskId)
                : null;

              return (
                <div
                  key={team.name}
                  className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 flex flex-col justify-between space-y-5 shadow-lg text-left"
                >
                  <div className="space-y-4">
                    {/* Team Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{team.name}</h3>
                          <p className="text-[10px] text-stone-400">
                            {team.members.length} Petugas Terhubung
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
                      <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                        Anggota Regu ({team.members.length})
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {team.members.map((member) => {
                          const parsed = parseMember(member);
                          return (
                            <div
                              key={member}
                              className="flex items-center justify-between text-xs bg-[#1E4D6B] p-2.5 rounded-xl border border-white/5 text-white"
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-white">{parsed.name}</span>
                                <span className="text-[10px] text-stone-300 mt-0.5">
                                  ✉️ <a href={`mailto:${parsed.email}`} className="hover:underline text-orange-400">{parsed.email}</a>
                                </span>
                                <span className="text-[10px] text-stone-300">
                                  📞 <a href={`tel:${parsed.phone}`} className="hover:underline text-orange-400">{parsed.phone}</a>
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveMember(team.name, member)}
                                className="text-stone-400 hover:text-red-400 p-1.5 transition"
                                title={`Keluarkan ${parsed.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Member inline form */}
                    <div className="bg-[#123956] p-3 rounded-2xl border border-white/5 space-y-3">
                      <span className="text-[9px] font-bold uppercase text-stone-300 tracking-wider block">
                        Tambah Anggota Regu
                      </span>

                      {/* Dropdown to link registered staff profiles */}
                      <div>
                        <select
                          onChange={(e) =>
                            handleSelectStaffProfile(team.name, e.target.value)
                          }
                          defaultValue=""
                          className="w-full bg-[#17415B] text-white border border-white/10 rounded-xl px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                        >
                          <option value="">-- Pilih Akun Staff Terdaftar --</option>
                          {staffProfiles.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.full_name} ({p.department || "Staff"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={memberNames[team.name] || ""}
                          onChange={(e) =>
                            setMemberNames((prev) => ({
                              ...prev,
                              [team.name]: e.target.value,
                            }))
                          }
                          placeholder="Nama Lengkap..."
                          className="w-full bg-[#17415B] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="email"
                            value={memberEmails[team.name] || ""}
                            onChange={(e) =>
                              setMemberEmails((prev) => ({
                                ...prev,
                                [team.name]: e.target.value,
                              }))
                            }
                            placeholder="Email..."
                            className="w-full bg-[#17415B] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-550"
                          />
                          <input
                            type="tel"
                            value={memberPhones[team.name] || ""}
                            onChange={(e) =>
                              setMemberPhones((prev) => ({
                                ...prev,
                                [team.name]: e.target.value,
                              }))
                            }
                            placeholder="No Telpon..."
                            className="w-full bg-[#17415B] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-550"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddMember(team.name)}
                        className="w-full bg-[#1E4D6B] hover:bg-[#235b80] border border-white/5 text-orange-400 font-bold py-2 rounded-xl text-xs transition active:scale-[0.97] flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Hubungkan Staff
                      </button>
                    </div>

                    {/* Current Activity */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block">
                        Tugas Berjalan
                      </span>
                      {currentTask ? (
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
                        <p className="text-xs text-stone-450">Tidak ada tugas aktif.</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update Button */}
                  <div className="pt-4 border-t border-white/5">
                    <label className="block text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-2">
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
                            updateTeamStatus(
                              team.name,
                              s.value as "Available" | "Active" | "Offline"
                            )
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

        {/* Right Column: Field Team Simulation Feed */}
        <section className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 shadow-lg space-y-5 text-left h-fit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/25 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Simulator Laporan Tim</h3>
              <p className="text-xs text-stone-400">Simulasikan regu mengirim laporan ke Staff</p>
            </div>
          </div>

          {simSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
              ✓ Laporan Regu Terkirim! Cek di Report Inbox / Field Tasks.
            </div>
          )}

          <form onSubmit={handleSimulateReportSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                1. Pilih Regu Lapangan
              </label>
              <select
                value={simTeam}
                onChange={(e) => {
                  setSimTeam(e.target.value);
                  setSimReportId("");
                }}
                className="w-full bg-[#123956] text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              >
                <option value="">-- Pilih Regu --</option>
                {teams.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                2. Pilih Tugas Laporan (Semua Aktif)
              </label>
              <select
                value={simReportId}
                disabled={!simTeam}
                onChange={(e) => setSimReportId(e.target.value)}
                className="w-full bg-[#123956] text-white border border-white/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">-- Pilih Laporan --</option>
                {activeReportsForSim.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} (ID #{r.id}){r.assignedTeam ? ` - Assigned: ${r.assignedTeam}` : " - Unassigned"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                3. Laporan dari Lapangan (Kirim ke Chat)
              </label>
              <textarea
                rows={4}
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                placeholder="Contoh: Pembersihan selesai, menyedot air di parit tersumbat..."
                className="w-full bg-[#123956] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500 placeholder:text-stone-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="submit-review"
                checked={simSubmitReview}
                onChange={(e) => setSimSubmitReview(e.target.checked)}
                className="rounded border-white/10 bg-[#123956] text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <label
                htmlFor="submit-review"
                className="text-xs text-stone-300 font-semibold cursor-pointer select-none"
              >
                Selesaikan pembersihan & ajukan review (Needs Review)
              </label>
            </div>

            <button
              type="submit"
              disabled={!simTeam || !simReportId}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Kirim Laporan ke Staff
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
