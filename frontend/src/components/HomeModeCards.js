"use client";

import Link from "next/link";
import TugasModeEntry from "@/components/TugasModeEntry";
import { useMahasiswa } from "@/lib/session";

const LATIHAN = {
  title: "Mode Latihan",
  badge: "Latihan",
  badgeClass: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  description:
    "Dimensi minimum dan cek hasil ditampilkan langsung saat mendesain. Cocok untuk belajar dan eksplorasi.",
  points: [
    "Panel dimensi minimum otomatis",
    "Cek desain & hasil perhitungan langsung",
    "Empat langkah lengkap termasuk CEK & HASIL",
  ],
  cta: "Mulai Latihan",
  ctaClass: "btn-primary",
};

const TUGAS = {
  title: "Mode Tugas",
  badge: "Tugas",
  badgeClass: "bg-amber-100 text-amber-800 ring-amber-200",
  description:
    "Dimensi minimum dan cek hasil disembunyikan saat mendesain. Hasil muncul setelah submit PDF.",
  points: [
    "Tanpa panel dimensi minimum",
    "Kanvas lebih lebar untuk fokus desain",
    "Submit tugas via PDF dengan pemeriksaan otomatis",
  ],
  cta: "Mulai Tugas",
  ctaClass: "btn-primary bg-amber-600 hover:bg-amber-700",
};

function ModeCard({ mode, children }) {
  return (
    <div className="card flex flex-col p-6">
      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${mode.badgeClass}`}
      >
        {mode.badge}
      </span>
      <h2 className="mt-3 text-xl font-extrabold text-slate-800">{mode.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{mode.description}</p>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
        {mode.points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-0.5 text-brand">✓</span>
            {p}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

export default function HomeModeCards() {
  const { authenticated, loading } = useMahasiswa();
  const showTugas = !loading && authenticated;

  return (
    <div
      className={`mt-10 grid gap-6 ${showTugas ? "md:grid-cols-2" : "mx-auto max-w-lg md:max-w-xl"}`}
    >
      <ModeCard mode={LATIHAN}>
        <Link href="/latihan" className={`${LATIHAN.ctaClass} mt-6 justify-center`}>
          {LATIHAN.cta}
        </Link>
      </ModeCard>
      {showTugas && (
        <ModeCard mode={TUGAS}>
          <TugasModeEntry className={`${TUGAS.ctaClass} mt-6 justify-center`}>
            {TUGAS.cta}
          </TugasModeEntry>
        </ModeCard>
      )}
    </div>
  );
}
