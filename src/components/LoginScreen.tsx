import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  ShieldAlert,
  User,
  Phone,
  MapPin,
  ClipboardList,
  FileDigit,
  Building2,
} from "lucide-react";

export default function LoginScreen() {
  const { login, registerUser } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"volunteer" | "staff">("volunteer");

  // Shared inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Volunteer specific
  const [nik, setNik] = useState("");
  const [address, setAddress] = useState("");

  // Staff specific
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("Dinas Lingkungan Hidup");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setConfirmPassword("");
    setNik("");
    setAddress("");
    setStaffId("");
    setDepartment("Dinas Lingkungan Hidup");
    setError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email tidak boleh kosong.");
      return;
    }
    if (!password) {
      setError("Password tidak boleh kosong.");
      return;
    }
    if (password.length < 6) {
      setError("Password harus minimal 6 karakter.");
      return;
    }

    setLoading(true);
    login(email, activeTab, password).then((res) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Gagal masuk.");
      }
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Common validations
    if (!fullName.trim()) {
      setError("Nama Lengkap wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    if (!phone.trim() || !/^\d{10,13}$/.test(phone)) {
      setError("Nomor telepon harus angka sepanjang 10-13 digit.");
      return;
    }

    // Role-specific validations
    if (activeTab === "volunteer") {
      if (!nik.trim() || !/^\d{16}$/.test(nik)) {
        setError("NIK wajib diisi dan harus berupa 16 digit angka.");
        return;
      }
      if (!address.trim()) {
        setError("Alamat lengkap wajib diisi.");
        return;
      }
    } else {
      if (!staffId.trim()) {
        setError("ID Petugas / NIP wajib diisi.");
        return;
      }
      if (!department) {
        setError("Pilih Instansi / Dinas penugasan Anda.");
        return;
      }
    }

    if (!password || password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    registerUser({
      fullName,
      email,
      phone,
      role: activeTab,
      password,
      nik: activeTab === "volunteer" ? nik : undefined,
      address: activeTab === "volunteer" ? address : undefined,
      staffId: activeTab === "staff" ? staffId : undefined,
      department: activeTab === "staff" ? department : undefined,
    }).then((res) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Gagal mendaftar.");
      } else {
        alert(
          `Registrasi Berhasil!\nSelamat datang ${fullName}, akun ${activeTab} Anda telah aktif di CivicEye.`
        );
      }
    });
  };

  const handleQuickLogin = (role: "volunteer" | "staff") => {
    setError("");
    const mockEmail =
      role === "volunteer" ? "david@civiceye.id" : "david.staff@civiceye.id";
    setEmail(mockEmail);
    setPassword("password123");
    setActiveTab(role);
    setLoading(true);
    login(mockEmail, role, "password123").then((res) => {
      setLoading(false);
      if (!res.success) {
        setError(res.error || "Gagal masuk demo.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-stone-50">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-200/40 blur-3xl" />

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
            CivicEye Platform
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">
            {isRegistering ? "Daftar Akun Baru" : "Selamat Datang Kembali"}
          </h1>
          <p className="mt-2 text-stone-500 text-sm max-w-sm mx-auto">
            {isRegistering
              ? "Lengkapi formulir pendaftaran di bawah ini untuk bergabung dengan platform CivicEye."
              : "Masuk untuk melaporkan masalah atau mengelola tugas lapangan."}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-8 shadow-[0_20px_50px_rgba(122,62,25,0.1)] border border-orange-100 transition-all duration-300">
          {/* Tab Selector */}
          <div className="flex p-1 bg-stone-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("volunteer");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition ${
                activeTab === "volunteer"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Users className="w-4 h-4" />
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("staff");
                setError("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition ${
                activeTab === "staff"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Staff Portal
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 text-left">
              <span className="mt-0.5">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form Area */}
          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeTab === "volunteer"
                        ? "nama@email.com"
                        : "staff.nama@civiceye.id"
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                    defaultChecked
                  />
                  Ingat saya
                </label>
                <a href="#" className="text-orange-600 font-semibold hover:underline">
                  Lupa Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.99] transition flex items-center justify-center gap-2 ${
                  loading ? "opacity-90" : ""
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : activeTab === "volunteer" ? (
                  "Masuk sebagai Volunteer"
                ) : (
                  "Masuk ke Operations Portal"
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: David Johnson"
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812XXXXXXXX"
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* Volunteer Specific Fields */}
              {activeTab === "volunteer" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      NIK (Nomor Induk Kependudukan)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                        <FileDigit className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={nik}
                        maxLength={16}
                        onChange={(e) => setNik(e.target.value)}
                        placeholder="16-digit nomor KTP Anda"
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Alamat Lengkap (Domisili)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 pt-3 flex items-start text-stone-400">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap rumah tinggal Anda saat ini..."
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Specific Fields */}
              {activeTab === "staff" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      ID Petugas / NIP
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                        <ClipboardList className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        placeholder="Contoh: STF-90210"
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Instansi / Dinas
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800 cursor-pointer"
                      >
                        <option value="Dinas Lingkungan Hidup">Dinas Lingkungan Hidup</option>
                        <option value="Dinas Pekerjaan Umum">Dinas Pekerjaan Umum</option>
                        <option value="Dinas Perhubungan">Dinas Perhubungan</option>
                        <option value="Satpol PP">Satpol PP</option>
                        <option value="Dinas Kebakaran">Dinas Kebakaran</option>
                        <option value="Lainnya">Lainnya / Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Konfirmasi Sandi
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang sandi"
                      className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-100/50 border border-stone-200 rounded-2xl outline-none focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition text-sm text-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.99] transition flex items-center justify-center gap-2 ${
                  loading ? "opacity-90" : ""
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Daftar Akun Baru"
                )}
              </button>
            </form>
          )}

          {/* Toggle Login/Register Mode */}
          <div className="mt-6 text-center text-xs text-stone-500">
            {isRegistering ? (
              <p>
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    resetForm();
                  }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Masuk Di Sini
                </button>
              </p>
            ) : (
              <p>
                Belum memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    resetForm();
                  }}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            )}
          </div>

          {/* Demo Quick Access (Only in Login Mode) */}
          {!isRegistering && (
            <>
              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-150"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-stone-400 font-medium">
                  Demo Quick Access
                </span>
              </div>

              {/* Quick login helpers */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleQuickLogin("volunteer")}
                  className="py-2.5 px-3 border border-orange-100 hover:border-orange-200 bg-orange-50/50 hover:bg-orange-50 rounded-xl text-left transition"
                >
                  <p className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                    Role: Volunteer
                  </p>
                  <p className="text-xs font-semibold text-stone-700 mt-0.5 truncate">
                    David (Warga)
                  </p>
                </button>
                <button
                  onClick={() => handleQuickLogin("staff")}
                  className="py-2.5 px-3 border border-amber-100 hover:border-amber-200 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-left transition"
                >
                  <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    Role: Staff
                  </p>
                  <p className="text-xs font-semibold text-stone-700 mt-0.5 truncate">
                    David (Staff)
                  </p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
