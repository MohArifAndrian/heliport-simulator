import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HelipadSimulator from "@/components/HelipadSimulator";

export const metadata = { title: "Simulasi Heliport - Heliport Design Simulator" };

export default function SimulasiPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 py-6 pb-16">
        <HelipadSimulator />
      </main>
      <SiteFooter />
    </div>
  );
}
