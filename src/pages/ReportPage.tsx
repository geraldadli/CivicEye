import { ImagePlus, MapPin, Menu, Plus, ScanLine, Upload } from 'lucide-react';
import { AppButton } from '@/components/common/AppButton';
import SectionCard from "../components/common/SectionCard";

export default function ReportPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_40px_rgba(122,62,25,0.12)] ring-1 ring-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Report</p>
            <h1 className="text-2xl font-bold text-stone-900">Buat Laporan Baru</h1>
          </div>
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
            <ScanLine className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-[28px] border-2 border-dashed border-orange-200 bg-orange-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="font-semibold text-stone-900">Step 1 · Membuat Bukti</p>
            <p className="mt-1 text-sm text-stone-500">Tap to upload photo or video</p>
            <p className="mt-2 text-xs text-stone-400">Max size 20MB</p>
          </div>

          <div className="rounded-[28px] bg-stone-50 p-4">
            <p className="mb-2 font-semibold text-stone-900">Step 2 · Detail</p>
            <textarea rows={5} className="w-full resize-none rounded-2xl border border-orange-100 bg-white p-4 text-sm outline-none ring-0 placeholder:text-stone-400 focus:border-orange-300" placeholder="Deskripsikan laporan anda: Describe the issue in detail to help our team resolve it faster..." />
          </div>

          <div className="rounded-[28px] bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-stone-900">Step 3 · Lokasi</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Lokasi Terdeteksi</span>
            </div>
            <div className="mt-3 rounded-[24px] bg-gradient-to-br from-stone-200 to-stone-100 p-4">
              <div className="flex items-center gap-2 text-stone-700">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Kampus Bina Nusantara Kemanggisan</span>
              </div>
              <div className="mt-4 h-36 rounded-[20px] bg-white/70">
                <div className="flex h-full items-center justify-center text-center text-sm text-stone-500">Map view placeholder</div>
              </div>
            </div>
          </div>

          <AppButton icon={<Plus className="h-4 w-4" />}>Submit</AppButton>
        </div>
      </section>

      <SectionCard title="Status Management" subtitle="Alur: Laporan Diterima → Petugas Menuju Lokasi → Selesai" icon={<Menu className="h-5 w-5 text-orange-600" />}>
        <div className="space-y-3">
          {[
            ['Laporan Diterima', true],
            ['Petugas Menuju Lokasi', true],
            ['Selesai', false],
          ].map(([label, active], idx) => (
            <div key={label as string} className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{label as string}</p>
                <p className="text-sm text-stone-500">Track progress of the report in real time.</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
