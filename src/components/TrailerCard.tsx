import { useState } from "react";
import { Film } from "lucide-react";
import SectionCard from "./common/SectionCard";

const trailerUrl = `${import.meta.env.BASE_URL}videos/civiceye-trailer.mp4`;

export default function TrailerCard() {
  const [loop, setLoop] = useState(false);

  return (
    <SectionCard
      title="Kenali CivicEye"
      subtitle="Dari laporan warga hingga aksi nyata. Tonton trailer CivicEye."
      icon={<Film className="h-5 w-5 text-orange-600" aria-hidden="true" />}
    >
      <video
        className="block aspect-video w-full rounded-2xl bg-stone-950 object-contain"
        src={trailerUrl}
        poster={`${import.meta.env.BASE_URL}videos/civiceye-trailer-poster.jpg`}
        controls
        loop={loop}
        playsInline
        preload="none"
        aria-label="Trailer CivicEye: dari laporan warga hingga lingkungan bersih"
        aria-describedby="trailer-description"
      >
        Browser Anda tidak mendukung pemutaran video.
      </video>
      <p id="trailer-description" className="mt-3 text-sm text-stone-500">
        Warga melaporkan sampah, petugas menyelesaikan tugas, dan warga mendapat
        Civic Points untuk ditukar dengan rewards serta mendukung aksi komunitas.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-stone-500">1 menit · Video tanpa audio</span>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-stone-700">
          <input
            type="checkbox"
            checked={loop}
            onChange={(event) => setLoop(event.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          Ulangi video
        </label>
        <a
          href={trailerUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
        >
          Buka video di tab baru
        </a>
      </div>
    </SectionCard>
  );
}
