"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconH } from "@/components/icons";

export default function DosenHeader({ nama = "Dosen" }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/dosen/logout", { method: "POST" });
    router.push("/dosen/login");
    router.refresh();
  }

  return (
    <header className="bg-brand-dark text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
        <Link href="/dosen" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-white/15">
            <IconH className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none tracking-wide">
              PORTAL DOSEN
            </h1>
            <p className="text-[11px] text-sky-200">Penilaian Khusus — Mode Tugas</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-sky-100 sm:inline">{nama}</span>
          <Link
            href="/"
            className="rounded px-2 py-1 text-sky-100 hover:bg-white/10"
          >
            Simulator
          </Link>
          <button
            onClick={handleLogout}
            className="rounded bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
