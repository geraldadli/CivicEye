import { PackageCheck, Upload, Trash2, CheckCircle2 } from "lucide-react";
import SectionCard from "@/components/common/SectionCard";
import { rupiah } from "@/utils/format";
import { useApp } from "@/context/AppContext";

export default function CommunityPage() {
  const {
    volunteerTask,
    acceptVolunteerTask,
    uploadVolunteerTaskPhoto,
    completeVolunteerTask,
    claimVolunteerTaskPayout,
  } = useApp();

  const handleAccept = () => {
    acceptVolunteerTask();
    alert(
      "Task Diterima!\n\nSilakan menuju lokasi dan bersihkan area yang dilaporkan. Setelah selesai, ambil foto paska-pembersihan dan unggah di sini."
    );
  };

  const handleUploadPhoto = () => {
    if (volunteerTask.status === "available") {
      alert("Silakan terima task terlebih dahulu.");
      return;
    }
    uploadVolunteerTaskPhoto();
    alert("Foto paska-pembersihan berhasil diunggah! Anda sekarang bisa menandai tugas ini selesai.");
  };

  const handleComplete = () => {
    if (volunteerTask.status === "accepted") {
      alert("Silakan unggah bukti foto paska-pembersihan terlebih dahulu.");
      return;
    }
    completeVolunteerTask();
    alert(
      "Tugas Selesai!\n\nLaporan pengerjaan Anda telah diverifikasi oleh pengawas wilayah secara otomatis. Silakan klaim upah Anda!"
    );
  };

  const handleClaimPayout = () => {
    claimVolunteerTaskPayout();
    alert(
      `Upah Berhasil Diklaim!\n\nSaldo sebesar ${rupiah(
        volunteerTask.payout
      )} telah dikirim ke Dompet Civic Anda, dan Anda mendapatkan +100 Civic Points!`
    );
  };

  return (
    <SectionCard
      title="Dashboard Operator Warga"
      subtitle="Terima task terdekat, unggah bukti pembersihan, dan dapatkan upah."
      icon={<PackageCheck className="h-5 w-5 text-orange-600" />}
    >
      <div className="rounded-[28px] bg-white p-5 shadow-sm border border-orange-100 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-stone-500 font-semibold">🚧 {volunteerTask.location}</p>
            <h3 className="mt-1.5 text-xl font-bold text-stone-900">{volunteerTask.issue}</h3>
            <span
              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-2 ${
                volunteerTask.status === "available"
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : volunteerTask.status === "accepted"
                  ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  : volunteerTask.status === "uploaded"
                  ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              Task: {volunteerTask.status}
            </span>
          </div>
          <div className="rounded-2xl bg-orange-100 px-3.5 py-2.5 text-right text-orange-850 border border-orange-200">
            <p className="text-[9px] font-bold uppercase tracking-wider">Upah Kerja</p>
            <p className="text-lg font-extrabold mt-0.5">{rupiah(volunteerTask.payout)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: `${volunteerTask.distanceKm} Km`, sub: "Jarak" },
            { label: `~${volunteerTask.etaMin} Menit`, sub: "Estimasi" },
            { label: volunteerTask.rating.toFixed(1), sub: `${volunteerTask.completedTasks} selesai` },
          ].map((item) => (
            <div key={item.sub} className="rounded-2xl bg-stone-50 p-3 text-center border border-stone-150">
              <p className="text-lg font-bold text-stone-900">{item.label}</p>
              <p className="text-[10px] text-stone-500 font-semibold">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Upload proof area */}
        <div className="mt-5 rounded-[24px] border border-dashed border-orange-200 bg-orange-50/40 p-5">
          <p className="font-semibold text-stone-900 text-sm">Bukti Pekerjaan (Foto Bersih)</p>
          <p className="text-xs text-stone-500 mt-0.5">Unggah foto setelah area selesai dibersihkan</p>

          {volunteerTask.status === "available" ? (
            <div className="mt-3.5 flex items-center justify-center rounded-2xl bg-stone-100 border border-stone-200 p-5 text-stone-400 text-xs font-semibold">
              Terima tugas terlebih dahulu untuk mengaktifkan upload bukti.
            </div>
          ) : volunteerTask.status === "accepted" ? (
            <div
              onClick={handleUploadPhoto}
              className="mt-3.5 flex items-center justify-center rounded-2xl bg-white border-2 border-dashed border-orange-200 p-5 text-orange-700 hover:bg-orange-50 cursor-pointer transition"
            >
              <Upload className="h-5 w-5" />
              <span className="ml-2 text-sm font-semibold">Klik untuk Unggah Foto Bukti</span>
            </div>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              <img
                src="/images/trash_debris.png"
                alt="Foto Bersih"
                className="w-full h-32 object-cover rounded-2xl border-2 border-emerald-300 filter saturate-50 contrast-125"
              />
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Bukti pembersihan terunggah dan terverifikasi
              </div>
            </div>
          )}
        </div>

        {/* Task state action buttons */}
        <div className="mt-5 space-y-3">
          {volunteerTask.status === "available" && (
            <div className="flex gap-3">
              <button
                onClick={() => alert("Anda menolak penugasan ini.")}
                className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 transition active:scale-[0.99]"
              >
                Tolak
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200 hover:shadow-orange-300 transition active:scale-[0.99]"
              >
                Terima Task
              </button>
            </div>
          )}

          {volunteerTask.status === "accepted" && (
            <button
              onClick={handleComplete}
              className="w-full py-3.5 bg-stone-100 text-stone-400 border border-stone-200 rounded-2xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              Tandai Selesai (Unggah Foto Terlebih Dahulu)
            </button>
          )}

          {volunteerTask.status === "uploaded" && (
            <button
              onClick={handleComplete}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-100 rounded-2xl text-sm font-bold hover:scale-[1.01] transition active:scale-[0.99]"
            >
              Tandai Selesai
            </button>
          )}

          {volunteerTask.status === "completed" && (
            <button
              onClick={handleClaimPayout}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200 rounded-2xl text-base font-extrabold hover:scale-[1.01] transition active:scale-[0.99] animate-bounce"
            >
              💰 Klaim Upah {rupiah(volunteerTask.payout)}
            </button>
          )}

          {volunteerTask.status === "claimed" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
              <p className="font-bold text-emerald-800 text-sm">✓ Tugas Terselesaikan & Dibayar</p>
              <p className="text-xs text-stone-500">
                Upah {rupiah(volunteerTask.payout)} telah ditambahkan ke Dompet Civic Anda. Terima kasih atas kontribusi Anda!
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
