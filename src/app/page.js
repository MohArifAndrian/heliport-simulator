import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Heliport Design Simulator",
  description: "Simulator desain heliport untuk pembelajaran — pilih Mode Latihan atau Mode Tugas.",
};

const MODES = [
  {
    href: "/latihan",
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
  },
  {
    href: "/tugas",
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
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 pb-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-brand">Heliport Design Simulator</h1>
          <p className="mt-3 text-sm text-slate-600">
            Pilih mode sesuai tujuan Anda — latihan mandiri atau pengerjaan tugas.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {MODES.map((m) => (
            <div key={m.href} className="card flex flex-col p-6">
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${m.badgeClass}`}
              >
                {m.badge}
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-slate-800">{m.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{m.description}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={m.href} className={`${m.ctaClass} mt-6 justify-center`}>
                {m.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/panduan" className="text-sm font-semibold text-brand hover:underline">
            Baca panduan penggunaan →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
