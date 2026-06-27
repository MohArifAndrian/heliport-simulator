"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_MAHASISWA_STATUS } from "@/lib/mahasiswaStatus";
import { useMahasiswa } from "@/lib/session";
import { SiteLogo } from "@/components/icons";
import NavTugasLink from "@/components/NavTugasLink";

export default function SiteHeader() {
  const router = useRouter();
  const { mahasiswa, clear, authenticated, loading } = useMahasiswa();
  const [userOpen, setUserOpen] = useState(false);

  const name = mahasiswa?.nama || "Peserta";

  async function handleLogout() {
    await clear();
    setUserOpen(false);
    router.refresh();
  }

  return (
    <header className="relative z-40 shadow-portal">
      <div className="h-1 bg-accent" />
      <div className="bg-brand-darker text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-0.5">
            <SiteLogo size={32} className="h-full w-full" />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-portal-cyan">
              Politeknik Penerbangan Indonesia
            </p>
            <h1 className="text-base font-extrabold uppercase leading-none tracking-wide sm:text-lg">
              Heliport Design Simulator
            </h1>
            <p className="text-[11px] text-white/70">Versi Pemula</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 text-sm text-white/90 md:flex">
          <Link href="/latihan" className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3z" /><path d="M12 12l9-4.5M12 12v9M12 12L3 7.5" /></svg>
            Latihan
          </Link>
          <NavTugasLink className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10" />
          <Link href="/simulasi" className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12h8M12 8v8" strokeLinecap="round" /></svg>
            Simulasi
          </Link>
          <Link href="/panduan" className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2zM12 3h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /></svg>
            Panduan
          </Link>
          <Link href="/tentang" className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17v.5" strokeLinecap="round" /></svg>
            Tentang
          </Link>
          <div className="relative">
            <button onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-white/10">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" /></svg>
              <span className="max-w-[140px] truncate">{loading ? "…" : name}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className={userOpen ? "rotate-180 transition" : "transition"}><path d="M6 9l6 6 6-6" strokeLinecap="round" /></svg>
            </button>
            {userOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg bg-white py-1 text-sm text-slate-700 shadow-lg ring-1 ring-slate-200">
                {authenticated && mahasiswa && (
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="font-semibold text-slate-800">{mahasiswa.nama}</p>
                    <p className="text-xs text-slate-500">
                      {mahasiswa.status || DEFAULT_MAHASISWA_STATUS}
                      {mahasiswa.nim ? ` · NIM ${mahasiswa.nim}` : ""}
                      {mahasiswa.nip ? ` · NIP ${mahasiswa.nip}` : ""}
                    </p>
                  </div>
                )}
                {!authenticated ? (
                  <Link
                    href="/peserta/login"
                    className="block px-4 py-2 font-semibold text-brand hover:bg-slate-50"
                    onClick={() => setUserOpen(false)}
                  >
                    Masuk
                  </Link>
                ) : (
                  <button
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Keluar
                  </button>
                )}
                <Link href="/panduan" className="block px-4 py-2 hover:bg-slate-50" onClick={() => setUserOpen(false)}>
                  Bantuan
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
      </div>
    </header>
  );
}
