import { Heart, Flame, Trophy, MessageCircle } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import ProgressBar from '@/components/common/ProgressBar';
import SectionCard from '@/components/common/SectionCard';
import { CommunityProject } from '@/types/civiceye';
import { rupiah } from '@/utils/format';

export default function ForumPage() {
  const projects: CommunityProject[] = [
    {
      id: 'p1',
      title: 'Pembersihan Kali Ciliwung',
      location: 'Kec. Beji, Depok',
      volunteers: 47,
      donated: 13000000,
      target: 20000000,
      emoji: '🌊',
    },
    {
      id: 'p2',
      title: 'Pembersihan Kali Anggrek',
      location: 'Kec. Kemanggisan',
      volunteers: 50,
      donated: 15000000,
      target: 25000000,
      emoji: '🌊',
    },
  ];

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
              className="rounded-[28px] bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {project.emoji}
                  </div>

                  <div>
                    <h3 className="font-semibold text-stone-900">
                      {project.title}
                    </h3>

                    <p className="text-sm text-stone-500">
                      {project.location} · {project.volunteers} relawan
                    </p>
                  </div>
                </div>

                <button className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Buka
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-700">
                    Dana Terkumpul
                  </span>

                  <span className="text-stone-500">
                    {rupiah(project.donated)} dari{' '}
                    {rupiah(project.target)}
                  </span>
                </div>

                <ProgressBar value={progress} />
              </div>

              <div className="mt-4 flex gap-3">
                <AppButton
                  variant="secondary"
                  icon={<span>❤️</span>}
                >
                  Donasi
                </AppButton>

                <AppButton variant="ghost">
                  Ikut Bantu
                </AppButton>
              </div>
            </article>
          );
        })}
      </div>

      {/* TRENDING CHALLENGE */}
      <div className="mt-6 rounded-[28px] bg-gradient-to-r from-orange-500 to-amber-400 p-5 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5" />

          <h3 className="text-lg font-bold">
            Trending Challenge
          </h3>
        </div>

        <p className="mt-2 text-sm text-orange-50">
          Bersihkan area lingkungan sekitar dan upload laporan
          untuk mendapatkan bonus +100 points minggu ini!
        </p>

        <div className="mt-4 flex gap-3">
          <AppButton variant="secondary">
            Ikut Challenge
          </AppButton>

          <AppButton variant="ghost">
            Lihat Detail
          </AppButton>
        </div>
      </div>

      {/* COMMUNITY STATS */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[24px] bg-stone-50 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />

            <p className="font-semibold">
              Top Volunteer
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-stone-900">
            David
          </p>

          <p className="text-sm text-stone-500">
            120 laporan selesai
          </p>
        </div>

        <div className="rounded-[24px] bg-stone-50 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-500" />

            <p className="font-semibold">
              Community Chat
            </p>
          </div>

          <p className="mt-3 text-sm text-stone-500">
            32 warga sedang berdiskusi hari ini
          </p>

          <div className="mt-3 rounded-2xl bg-orange-100 px-3 py-2 text-center text-sm font-semibold text-orange-700">
            Live Discussion
          </div>
        </div>
      </div>

      {/* DAILY MISSION */}
      <div className="mt-4 rounded-[28px] border border-dashed border-orange-200 bg-orange-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">
              Daily Mission
            </p>

            <h3 className="mt-1 text-lg font-bold text-stone-900">
              Upload 3 laporan hari ini
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Reward: +75 Civic Points
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs text-stone-500">
              Progress
            </p>

            <p className="text-xl font-bold text-orange-600">
              1/3
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={0.33} />
        </div>
      </div>
    </SectionCard>
  );
}