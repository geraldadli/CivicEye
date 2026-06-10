import { useState } from "react";
import { Heart, Plus, Compass, ChevronDown, ChevronUp } from "lucide-react";
import ProgressBar from "@/components/common/ProgressBar";
import SectionCard from "@/components/common/SectionCard";
import { rupiah } from "@/utils/format";
import { useApp } from "@/context/AppContext";

export default function ForumPage() {
  const { projects, donateToProject, joinProject, proposeProject, user } = useApp();

  // Local state for proposal form toggler
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Cleanup");
  const [description, setDescription] = useState("");

  const handleDonate = async (projectId: string, projectTitle: string) => {
    const defaultDonation = 100;
    const input = prompt(
      `Donasikan Civic Points Anda untuk "${projectTitle}"\nSetiap 100 Points setara dengan Rp 10.000,00.\nPoints Anda saat ini: ${user?.points || 0} pts.\n\nMasukkan jumlah points yang ingin didonasikan:`,
      defaultDonation.toString()
    );

    if (input === null) return; // Cancelled

    const pointsAmount = parseInt(input, 10);
    if (isNaN(pointsAmount) || pointsAmount <= 0) {
      alert("Masukkan jumlah points yang valid.");
      return;
    }

    if ((user?.points || 0) < pointsAmount) {
      alert("Civic Points Anda tidak mencukupi untuk melakukan donasi sebesar ini.");
      return;
    }

    const success = await donateToProject(projectId, pointsAmount);
    if (success) {
      alert(
        `Terima kasih! Anda berhasil mendonasikan ${pointsAmount} Civic Points (setara dengan ${rupiah(
          pointsAmount * 100
        )}) untuk proyek "${projectTitle}".`
      );
    } else {
      alert("Terjadi kesalahan saat mendonasikan.");
    }
  };

  const handleJoin = async (projectId: string, projectTitle: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project?.joined) {
      alert(`Anda sudah terdaftar sebagai relawan dalam proyek "${projectTitle}"!`);
      return;
    }

    const success = await joinProject(projectId);
    if (success) {
      alert(
        `Selamat! Anda berhasil bergabung dalam aksi "${projectTitle}".\nAnda mendapatkan +50 Civic Points sebagai apresiasi!`
      );
    }
  };

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      alert("Silakan lengkapi semua field formulir.");
      return;
    }

    proposeProject(title, location, description, category);
    alert(
      `Usulan Proyek Aksi Warga berhasil diajukan!\n\nJudul: "${title}"\nUsulan Anda telah masuk ke antrean review Staff. Anda akan menerima notifikasi jika proyek ini disetujui untuk diterbitkan!`
    );

    // Clear form fields and close
    setTitle("");
    setLocation("");
    setCategory("Cleanup");
    setDescription("");
    setFormOpen(false);
  };

  return (
    <div className="space-y-4 bg-transparent text-stone-850">
      {/* Citizen Proposal Card Form */}
      <section className="bg-white rounded-[32px] border border-orange-100 shadow-[0_16px_40px_rgba(122,62,25,0.06)] overflow-hidden">
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="w-full flex items-center justify-between p-5 text-left font-bold text-stone-900 transition hover:bg-stone-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base">Usulkan Aksi Warga Baru</h3>
              <p className="text-xs text-stone-500 font-semibold mt-0.5">Propose new collective action projects</p>
            </div>
          </div>
          {formOpen ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
        </button>

        {formOpen && (
          <form onSubmit={handleProposeSubmit} className="p-5 border-t border-stone-100 bg-stone-50/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Nama Aksi Komunitas
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kerja Bakti Cat JPO Melati"
                  className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Kategori Aksi
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400"
                >
                  <option value="Cleanup">🌊 Bersih-Bersih (Cleanup)</option>
                  <option value="Greenery">🌳 Penghijauan (Greenery)</option>
                  <option value="Repair">🚧 Perbaikan Ringan (Repair)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Lokasi Pengerjaan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: JPO Jl. Melati Raya Depan SD"
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Tujuan & Deskripsi Aksi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan apa saja yang akan dibersihkan/dikerjakan, perkiraan durasi, dan peralatan yang perlu dibawa relawan..."
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition"
            >
              Kirim Usulan Aksi
            </button>
          </form>
        )}
      </section>

      {/* Main projects feed */}
      <SectionCard
        title="Forum Komunitas Warga"
        subtitle="Dukung aksi gotong royong warga melalui donasi points atau bergabung sebagai relawan."
        icon={<Heart className="h-5 w-5 text-orange-600" />}
      >
        <div className="grid gap-4">
          {projects.map((project) => {
            const progress = project.donated / project.target;
            return (
              <article
                key={project.id}
                className="rounded-[28px] bg-stone-50 p-4 border border-stone-150/50 hover:border-orange-100 transition text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm border border-stone-150 shrink-0">
                      {project.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{project.title}</h3>
                      <p className="text-sm text-stone-500">
                        {project.location} · {project.volunteers} relawan
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      alert(
                        `Proyek "${project.title}" berlokasi di ${project.location}. Aksi lapangan dikoordinir oleh warga sekitar.`
                      )
                    }
                    className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200 transition"
                  >
                    Buka
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-700">Dana Terkumpul</span>
                    <span className="text-stone-500">
                      {rupiah(project.donated)} dari {rupiah(project.target)}
                    </span>
                  </div>
                  <ProgressBar value={progress} />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleDonate(project.id, project.title)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] bg-orange-100 text-orange-850 hover:bg-orange-200"
                  >
                    ❤️ Donasi
                  </button>
                  <button
                    onClick={() => handleJoin(project.id, project.title)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] border ${
                      project.joined
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-transparent text-stone-750 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {project.joined ? "✓ Bergabung" : "Ikut Bantu"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
