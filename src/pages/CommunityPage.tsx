import { PackageCheck, Upload } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import SectionCard from '@/components/common/SectionCard';
import { Task } from '@/types/civiceye';
import { rupiah } from '@/utils/format';

export default function CommunityPage() {
  const task: Task = {
    id: 't1',
    location: 'Jl. Margonda Raya No.45, Depok',
    issue: 'Sampah Berserakan',
    distanceKm: 1.2,
    etaMin: 8,
    payout: 45000,
    rating: 4.8,
    completedTasks: 127,
  };

  return (
    <SectionCard title="Dashboard Operator" subtitle="Terima task, unggah bukti kerja, dan klaim upah." icon={<PackageCheck className="h-5 w-5 text-orange-600" />}>
      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-orange-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">🚧 {task.location}</p>
            <h3 className="mt-1 text-xl font-bold text-stone-900">{task.issue}</h3>
            <p className="mt-1 text-sm text-stone-500">Task Baru Masuk</p>
          </div>
          <div className="rounded-2xl bg-orange-100 px-3 py-2 text-right text-orange-800">
            <p className="text-xs font-medium">Upah</p>
            <p className="text-lg font-extrabold">{rupiah(task.payout)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: `${task.distanceKm} Km`, sub: 'Jarak' },
            { label: `~${task.etaMin} Menit`, sub: 'Estimasi' },
            { label: task.rating.toFixed(1), sub: `${task.completedTasks} selesai` },
          ].map((item) => (
            <div key={item.sub} className="rounded-2xl bg-stone-50 p-3 text-center">
              <p className="text-lg font-bold text-stone-900">{item.label}</p>
              <p className="text-xs text-stone-500">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[24px] border border-dashed border-orange-200 bg-orange-50 p-4">
          <p className="font-semibold text-stone-900">Bukti Pekerjaan</p>
          <p className="mt-1 text-sm text-stone-500">Before / After photo upload</p>
          <div className="mt-3 flex items-center justify-center rounded-2xl bg-white p-5 text-orange-700">
            <Upload className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Upload foto</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <AppButton variant="secondary">Tolak</AppButton>
          <AppButton>Terima Task</AppButton>
        </div>
        <div className="mt-3 flex gap-3">
          <AppButton variant="ghost">Tandai Selesai</AppButton>
          <AppButton variant="ghost">Klaim Upah</AppButton>
        </div>
      </div>
    </SectionCard>
  );
}
