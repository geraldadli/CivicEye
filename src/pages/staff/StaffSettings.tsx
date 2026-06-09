import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Settings, User, Bell, Shield } from "lucide-react";

export default function StaffSettings() {
  const { user } = useApp();
  const [profileName, setProfileName] = useState(user?.name || "David");
  const [autoAssign, setAutoAssign] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Konfigurasi staf berhasil disimpan!");
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 text-stone-100 bg-[#0F354D]">
      <div>
        <p className="text-xs uppercase font-semibold text-orange-400 tracking-wider">
          System Preferences
        </p>
        <h2 className="text-2xl font-bold mt-1 text-white">Staff Settings & Profile</h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-white text-base">Profil Staf Operasional</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#1E4D6B] border border-white/5 rounded-2xl p-3.5 text-sm text-white outline-none focus:border-orange-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Alamat Email (Akun)
                </label>
                <input
                  type="email"
                  value={user?.email || "david.staff@civiceye.id"}
                  disabled
                  className="w-full bg-[#1E4D6B]/50 border border-white/5 rounded-2xl p-3.5 text-sm text-stone-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Jabatan / Tingkat Akses
                </label>
                <input
                  type="text"
                  value="Supervising Operator & Dispatcher"
                  disabled
                  className="w-full bg-[#1E4D6B]/50 border border-white/5 rounded-2xl p-3.5 text-sm text-stone-400 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  ID Operator Staf
                </label>
                <input
                  type="text"
                  value="STF-90245"
                  disabled
                  className="w-full bg-[#1E4D6B]/50 border border-white/5 rounded-2xl p-3.5 text-sm text-stone-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configurations column */}
        <div className="space-y-6">
          {/* Notification settings */}
          <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-white text-base">Notifikasi</h3>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-stone-300 font-semibold">Push Notifikasi Baru</span>
                <button
                  type="button"
                  onClick={() => setPushNotif(!pushNotif)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    pushNotif ? "bg-orange-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      pushNotif ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-stone-300 font-semibold">Suara Notifikasi Laporan</span>
                <button
                  type="button"
                  onClick={() => setSoundNotif(!soundNotif)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    soundNotif ? "bg-orange-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      soundNotif ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* System rules settings */}
          <div className="bg-[#17415B] rounded-[32px] p-6 border border-white/5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-white text-base">Aturan Sistem</h3>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs text-stone-300 font-semibold block">Auto-Assign Task</span>
                  <span className="text-[9px] text-stone-400 block">Kirim langsung ke tim terdekat</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoAssign(!autoAssign)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    autoAssign ? "bg-orange-500" : "bg-stone-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      autoAssign ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-900/10 hover:shadow-orange-900/25 active:scale-[0.99] transition"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
}
