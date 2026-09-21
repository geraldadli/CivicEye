import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Check, HandHeart, MapPin, Users } from "lucide-react";
import { clamp, rupiah } from "@/utils/format";

// Operators' view of the citizen forum: they can volunteer to join community projects.
export default function StaffForum() {
  const { projects, joinProject } = useApp();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedTitle, setJoinedTitle] = useState<string | null>(null);

  const handleJoin = async (projectId: string, title: string) => {
    setJoiningId(projectId);
    const success = await joinProject(projectId);
    setJoiningId(null);
    if (success) setJoinedTitle(title);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-stone-100 bg-[#0F354D]">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          Forum Aksi Warga
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Ikut Aksi Besar Warga</h2>
        <p className="text-xs text-stone-400 mt-1">
          Bergabung secara sukarela dalam proyek gotong royong warga.
        </p>
      </div>

      {joinedTitle && (
        <div role="status" className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300">
          ✓ Anda bergabung sebagai relawan di "{joinedTitle}".
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => {
          const progress = project.target > 0 ? project.donated / project.target : 0;
          return (
            <article
              key={project.id}
              className="bg-[#17415B] rounded-[32px] p-4 sm:p-6 border border-white/5 space-y-4 shadow-lg text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E4D6B] border border-white/10 text-2xl">
                  {project.emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base leading-snug">{project.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" /> {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-400" /> {project.volunteers} relawan
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center justify-between text-xs">
                  <span className="text-stone-300 font-semibold">Dana Terkumpul</span>
                  <span className="text-stone-400">
                    {rupiah(project.donated)} / {rupiah(project.target)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1E4D6B]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    style={{ width: `${clamp(progress, 0, 1) * 100}%` }}
                  />
                </div>
              </div>

              {project.joined ? (
                <div className="w-full py-3 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Anda Sudah Bergabung
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(project.id, project.title)}
                  disabled={joiningId === project.id}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <HandHeart className="w-4 h-4" />
                  {joiningId === project.id ? "Bergabung..." : "Ikut Bantu (Sukarela)"}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-16 bg-[#17415B] border border-white/5 rounded-[32px] text-stone-300">
          <p className="font-bold">Belum Ada Aksi Warga</p>
          <p className="text-xs mt-1">Proyek gotong royong warga akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
}
