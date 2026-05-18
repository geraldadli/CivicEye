import React, { useMemo } from "react";
import {
  Bell,
  ClipboardList,
  ChevronRight,
  Medal,
  MessageSquareText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getRank } from "../utils/ranks";
import ProgressBar from "../components/common/ProgressBar";
import SectionCard from "../components/common/SectionCard";
import StatusPill from "../components/common/StatusPill";

type ReportStatus = "Diterima" | "Menuju Lokasi" | "Proses" | "Selesai";

type ReportItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  status: ReportStatus;
};

export default function HomePage() {
  const points = 1250;
  const rank = useMemo(() => getRank(points), [points]);

  const reports: ReportItem[] = [
    {
      id: "r1",
      title: "Sampah Berserakan",
      location: "Jl. Anggrek",
      time: "2 jam lalu",
      status: "Proses",
    },
    {
      id: "r2",
      title: "Daun Berserakan",
      location: "Taman Anggrek",
      time: "Kemarin",
      status: "Selesai",
    },
    {
      id: "r3",
      title: "Lampu Jalan Mati",
      location: "Jl. Melati",
      time: "5 jam lalu",
      status: "Diterima",
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-[32px] bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-5 text-white shadow-[0_20px_50px_rgba(234,88,12,0.24)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm/6 font-medium text-orange-50/90">
              Selamat Datang!
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Halo, David</h1>
          </div>
          <button className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-[28px] bg-white/15 p-4 backdrop-blur-sm ring-1 ring-white/20">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-50/80">
                Civic Points Kamu
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-extrabold">
                  {points.toLocaleString("id-ID")}
                </span>
                <span className="pb-1 text-sm text-orange-50/90">points</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-right">
              <p className="text-xs text-orange-50/80">Status</p>
              <p className="font-semibold">{rank.current}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-orange-50/85">
              <span>{rank.current}</span>
              <span>{rank.next}</span>
            </div>
            <ProgressBar value={rank.progress} />
            <p className="mt-2 text-xs text-orange-50/90">
              {rank.nextPointsNeeded} poin lagi menuju {rank.next}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { icon: <ClipboardList className="h-5 w-5" />, label: "Laporan" },
          { icon: <MessageSquareText className="h-5 w-5" />, label: "Forum" },
          { icon: <Medal className="h-5 w-5" />, label: "Rewards" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-[24px] bg-white p-4 text-stone-800 shadow-[0_14px_30px_rgba(122,62,25,0.08)] ring-1 ring-orange-100 transition hover:-translate-y-0.5"
          >
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
              {item.icon}
            </div>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </section>

      <SectionCard
        title="Laporan Terakhir"
        subtitle="Pantau status laporan publik dan progress penanganannya."
        icon={<ShieldCheck className="h-5 w-5 text-orange-600" />}
      >
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-2xl bg-stone-50 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900">{report.title}</p>
                  <StatusPill status={report.status} />
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  {report.location} • {report.time}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-400" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}