import { useState } from "react";
import { ImagePlus, MapPin, Menu, Plus, ScanLine } from "lucide-react";
import { AppButton } from "@/components/common/AppButton";
import SectionCard from "../components/common/SectionCard";
import { useApp } from "../context/AppContext";

export default function ReportPage({
  setTab,
}: {
  setTab?: (tab: "home" | "forum" | "scan" | "community" | "store") => void;
}) {
  const { addReport } = useApp();
  const [issueType, setIssueType] = useState("Sampah Berserakan");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Kampus Bina Nusantara Kemanggisan");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Silakan masukkan deskripsi laporan.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      addReport(issueType, location, description);
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        if (setTab) {
          setTab("home");
        }
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-4 bg-transparent">
      <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_40px_rgba(122,62,25,0.12)] border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Report</p>
            <h1 className="text-2xl font-bold text-stone-900">Buat Laporan Baru</h1>
          </div>
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
            <ScanLine className="h-5 w-5" />
          </div>
        </div>

        {success ? (
          <div className="mt-6 p-8 text-center bg-orange-50 border border-orange-100 rounded-3xl space-y-3 animate-pulse">
            <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-stone-900">Laporan Berhasil Dikirim!</h3>
            <p className="text-sm text-stone-500">
              Anda mendapatkan +50 Civic Points! Mengalihkan ke halaman Home...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Step 1: Photo Bukti */}
            <div
              onClick={() => setHasPhoto(true)}
              className={`rounded-[28px] border-2 border-dashed p-5 text-center cursor-pointer transition ${
                hasPhoto
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-orange-200 bg-orange-50 hover:bg-orange-100/50"
              }`}
            >
              {hasPhoto ? (
                <div className="space-y-2">
                  <img
                    src="/images/trash_debris.png"
                    alt="Preview Laporan"
                    className="mx-auto h-32 w-48 object-cover rounded-2xl shadow-md border-2 border-white"
                  />
                  <p className="font-semibold text-emerald-800 text-sm">Foto Terunggah Berhasil</p>
                  <p className="text-xs text-stone-500">Ketuk untuk mengganti foto</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-stone-900">Step 1 · Membuat Bukti</p>
                  <p className="mt-1 text-sm text-stone-500">Ketuk untuk mengambil foto atau unggah gambar</p>
                  <p className="mt-2 text-xs text-stone-400">Maksimal ukuran 20MB</p>
                </>
              )}
            </div>

            {/* Step 2: Jenis & Detail */}
            <div className="rounded-[28px] bg-stone-50 p-5 space-y-3">
              <p className="font-semibold text-stone-900">Step 2 · Kategori & Detail</p>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Kategori Masalah
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-orange-300 text-sm text-stone-850"
                >
                  <option value="Sampah Berserakan">Sampah Berserakan</option>
                  <option value="Lampu Jalan Mati">Lampu Jalan Mati</option>
                  <option value="Saluran Air Tersumbat">Saluran Air Tersumbat</option>
                  <option value="Jalan Rusak / Berlubang">Jalan Rusak / Berlubang</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Deskripsi Kejadian
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none placeholder:text-stone-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  placeholder="Jelaskan secara spesifik agar petugas kami bisa menangani laporan Anda dengan cepat..."
                />
              </div>
            </div>

            {/* Step 3: Lokasi */}
            <div className="rounded-[28px] bg-stone-50 p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-900">Step 3 · Lokasi</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  GPS Terdeteksi
                </span>
              </div>
              <div className="mt-3 rounded-[24px] bg-gradient-to-br from-stone-200 to-stone-100 p-4">
                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-medium text-sm text-stone-800"
                  />
                </div>
                <div className="mt-4 h-36 rounded-[20px] bg-white/70 overflow-hidden relative border border-stone-200">
                  <img
                    src="/images/map_mockup.png"
                    alt="Map View"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-stone-850 shadow">
                      Kampus Binus Kemanggisan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Kirim Laporan
                </>
              )}
            </button>
          </form>
        )}
      </section>

      <SectionCard
        title="Alur Penanganan Laporan"
        subtitle="Proses transparan pemantauan laporan publik"
        icon={<Menu className="h-5 w-5 text-orange-600" />}
      >
        <div className="space-y-3">
          {[
            ["Laporan Diterima", "Sistem memverifikasi laporan awal warga."],
            ["Petugas Menuju Lokasi", "Tim dinas kebersihan/lapangan berangkat."],
            ["Selesai", "Laporan selesai ditangani, upah & poin disalurkan."],
          ].map(([label, desc], idx) => (
            <div key={label} className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4 border border-stone-100">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-xs mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900 text-sm">{label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
