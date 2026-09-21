import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture, onClose }: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | undefined;
    active.current = true;

    async function openCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Kamera tidak tersedia. Gunakan HTTPS atau unggah gambar.");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error && err.name === "NotAllowedError"
            ? "Izin kamera ditolak. Izinkan akses kamera di browser atau unggah gambar."
            : "Kamera tidak tersedia. Pastikan kamera terhubung, tidak digunakan aplikasi lain, dan halaman dibuka melalui HTTPS. Anda juga dapat mengunggah gambar.");
        }
      }
    }

    void openCamera();
    return () => {
      cancelled = true;
      active.current = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function takePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight || capturing) return;
    setCapturing(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (!active.current) return;
        setCapturing(false);
        if (blob) onCapture(new File([blob], `laporan-${Date.now()}.jpg`, { type: "image/jpeg" }));
        else setError("Gagal mengambil foto. Silakan coba lagi.");
      }, "image/jpeg", 0.9);
    } catch {
      setCapturing(false);
      setError("Gagal mengambil foto. Silakan coba lagi.");
    }
  }

  return (
    <div className="space-y-3">
      <video ref={videoRef} autoPlay playsInline muted aria-label="Pratinjau kamera"
        onCanPlay={() => setReady(true)}
        className="mx-auto max-h-80 w-full rounded-2xl bg-black object-contain" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={takePhoto} disabled={!ready || capturing}
          className="rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50">
          {capturing ? "Mengambil Foto..." : "Ambil Foto"}
        </button>
        <button type="button" onClick={onClose} className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
          Batal
        </button>
      </div>
    </div>
  );
}
