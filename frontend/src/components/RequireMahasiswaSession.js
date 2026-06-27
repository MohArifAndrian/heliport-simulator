"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useMahasiswa } from "@/lib/session";

export default function RequireMahasiswaSession({ children }) {
  const router = useRouter();
  const { authenticated, loading } = useMahasiswa();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !loading && !authenticated) {
      router.replace("/peserta/login?next=/tugas");
    }
  }, [hydrated, loading, authenticated, router]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          Memuat…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
          Mengalihkan ke login…
        </div>
        <SiteFooter />
      </div>
    );
  }

  return children;
}
