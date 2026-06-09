import { Heart } from "lucide-react";
import ProgressBar from "@/components/common/ProgressBar";
import SectionCard from "@/components/common/SectionCard";
import { rupiah } from "@/utils/format";
import { useApp } from "@/context/AppContext";

export default function ForumPage() {
  const { projects, donateToProject, joinProject, user } = useApp();

  const handleDonate = (projectId: string, title: string) => {
    const defaultDonation = 100;
    const input = prompt(
      `Donasikan Civic Points Anda untuk "${title}"\nSetiap 100 Points setara dengan Rp 10.000,00.\nPoints Anda saat ini: ${user?.points || 0} pts.\n\nMasukkan jumlah points yang ingin didonasikan:`,
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

    const success = donateToProject(projectId, pointsAmount);
    if (success) {
      alert(
        `Terima kasih! Anda berhasil mendonasikan ${pointsAmount} Civic Points (setara dengan ${rupiah(
          pointsAmount * 100
        )}) untuk proyek "${title}".`
      );
    } else {
      alert("Terjadi kesalahan saat mendonasikan.");
    }
  };

  const handleJoin = (projectId: string, title: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project?.joined) {
      alert(`Anda sudah terdaftar sebagai relawan dalam proyek "${title}"!`);
      return;
    }

    const success = joinProject(projectId);
    if (success) {
      alert(
        `Selamat! Anda berhasil bergabung dalam aksi "${title}".\nAnda mendapatkan +50 Civic Points sebagai apresiasi!`
      );
    }
  };

  return (
    <SectionCard
      title="Forum Komunitas"
      subtitle="Aktif dan selesai — dukung aksi kolektif warga."
      icon={<Heart className="h-5 w-5 text-orange-600" />}
    >
      <div className="grid gap-4">
        {projects.map((project) => {
          const progress = project.donated / project.target;
          return (
            <article
              key={project.id}
              className="rounded-[28px] bg-stone-50 p-4 border border-stone-150/50 hover:border-orange-100 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm border border-stone-150">
                    {project.emoji}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-stone-900">{project.title}</h3>
                    <p className="text-sm text-stone-500">
                      {project.location} · {project.volunteers} relawan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Proyek "${project.title}" berlokasi di ${project.location}. Aksi lapangan dikoordinir oleh RT/RW setempat.`)}
                  className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200 transition"
                >
                  Buka
                </button>
              </div>
              <div className="mt-4 text-left">
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
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] border ${
                    project.joined
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-transparent text-stone-700 border-stone-200 hover:bg-stone-100"
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
  );
}
