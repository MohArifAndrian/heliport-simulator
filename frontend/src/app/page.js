import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HomeModeCards from "@/components/HomeModeCards";

export const metadata = {
  title: "Heliport Design Simulator",
  description: "Simulator desain heliport untuk pembelajaran — pilih Mode Latihan atau Mode Tugas.",
};

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

        <HomeModeCards />

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
