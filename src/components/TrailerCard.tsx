import { useState } from "react";
import { Film, Repeat } from "lucide-react";
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
      <div className="relative">
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
        <button
          type="button"
          onClick={() => setLoop(!loop)}
          aria-label="Ulangi video"
          aria-pressed={loop}
          title={loop ? "Nonaktifkan pengulangan" : "Ulangi video"}
          className={`absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${loop ? "bg-orange-600" : "bg-black/60 hover:bg-black/80"}`}
        >
          <Repeat className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <p id="trailer-description" hidden>
        Warga melaporkan sampah, petugas menyelesaikan tugas, dan warga mendapat
        Civic Points untuk ditukar dengan rewards serta mendukung aksi komunitas.
      </p>
    </SectionCard>
  );
}
