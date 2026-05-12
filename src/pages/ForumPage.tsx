import { Heart } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import ProgressBar from '@/components/common/ProgressBar';
import SectionCard from '@/components/common/SectionCard';
import { CommunityProject } from '@/types/civiceye';
import { rupiah } from '@/utils/format';

export default function ForumPage() {
  const projects: CommunityProject[] = [
    { id: 'p1', title: 'Pembersihan Kali Ciliwung', location: 'Kec. Beji, Depok', volunteers: 47, donated: 13000000, target: 20000000, emoji: '🌊' },
    { id: 'p2', title: 'Pembersihan Kali Anggrek', location: 'Kec. Kemanggisan', volunteers: 50, donated: 15000000, target: 25000000, emoji: '🌊' },
  ];

  return (
    <SectionCard title="Forum Komunitas" subtitle="Aktif dan selesai — dukung aksi kolektif warga." icon={<Heart className="h-5 w-5 text-orange-600" />}>
      <div className="grid gap-4">
        {projects.map((project) => {
          const progress = project.donated / project.target;
          return (
            <article key={project.id} className="rounded-[28px] bg-stone-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{project.emoji}</div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{project.title}</h3>
                    <p className="text-sm text-stone-500">{project.location} · {project.volunteers} relawan</p>
                  </div>
                </div>
                <button className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Buka</button>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-700">Dana Terkumpul</span>
                  <span className="text-stone-500">{rupiah(project.donated)} dari {rupiah(project.target)}</span>
                </div>
                <ProgressBar value={progress} />
              </div>
              <div className="mt-4 flex gap-3">
                <AppButton variant="secondary" icon={<span>❤️</span>}>Donasi</AppButton>
                <AppButton variant="ghost">Ikut Bantu</AppButton>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
