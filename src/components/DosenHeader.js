"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DosenLogo } from "@/components/icons";
import { ROLE_LABELS } from "@/lib/roles";
import { usePortalSession } from "@/components/PortalSessionProvider";

export default function DosenHeader() {
  const router = useRouter();
  const { session } = usePortalSession();
  const nama = session?.nama || "Pengguna";
  const roleLabel = session?.roleLabel || ROLE_LABELS[session?.role] || "Dosen";
  const isAdmin = session?.role === "admin";

  async function handleLogout() {
    await fetch("/api/dosen/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="shadow-portal-lg">
      <div className="h-1 bg-accent" />
      <div className="bg-brand-darker text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 shadow-sm">
              <DosenLogo className="h-full w-full" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-portal-cyan">
                Politeknik Penerbangan Indonesia
              </p>
              <h1 className="text-base font-extrabold uppercase leading-tight tracking-wide sm:text-lg">
                Portal {isAdmin ? "Admin" : "Dosen"}
              </h1>
              <p className="text-[11px] text-white/70">Heliport Design Simulator — Penilaian Khusus</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <p className="font-medium text-white">{nama}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{roleLabel}</p>
            </div>
            <span
              className={`rounded px-2 py-1 text-[10px] font-bold uppercase sm:hidden ${
                isAdmin ? "bg-accent text-accent-foreground" : "bg-brand-light text-white"
              }`}
            >
              {roleLabel}
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent-dark"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
