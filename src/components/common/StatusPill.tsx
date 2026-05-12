import { ReportStatus } from '@/types/civiceye';

const classes: Record<ReportStatus, string> = {
  Diterima: 'bg-amber-100 text-amber-800',
  'Menuju Lokasi': 'bg-orange-100 text-orange-800',
  Proses: 'bg-blue-100 text-blue-800',
  Selesai: 'bg-emerald-100 text-emerald-800',
};

export default function StatusPill({ status }: { status: ReportStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>;
}
