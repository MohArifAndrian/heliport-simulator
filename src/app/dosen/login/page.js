"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DosenLogo } from "@/components/icons";

export default function DosenLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/dosen/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      router.push("/dosen");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <div className="h-1 bg-accent" />
      <div className="bg-brand-darker px-4 py-8 text-center text-white">
        <Link href="/" className="inline-flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-portal-lg">
            <DosenLogo className="h-full w-full" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-portal-cyan">
              Politeknik Penerbangan Indonesia
            </p>
            <h1 className="mt-1 text-xl font-extrabold uppercase tracking-wide sm:text-2xl">
              Portal Penilaian
            </h1>
            <p className="mt-1 text-sm text-white/70">Heliport Design Simulator</p>
          </div>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="card p-6 shadow-portal-lg">
          <h2 className="mb-1 text-lg font-extrabold uppercase tracking-wide text-brand-dark">Masuk</h2>
          <p className="mb-5 text-sm text-slate-600">
            Admin atau Dosen — akses dashboard penilaian Mode Tugas.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <label className="field-label">Email</label>
          <input
            type="email"
            className="field-input mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@heliport.id atau dosen@heliport.id"
            required
            autoComplete="username"
          />

          <label className="field-label">Kata Sandi</label>
          <input
            type="password"
            className="field-input mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full justify-center disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk ke Dashboard"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Hanya admin dan dosen yang dapat mengakses portal penilaian.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="font-semibold text-brand hover:underline">
            ← Kembali ke Simulator
          </Link>
        </p>
      </div>

      <footer className="border-t border-slate-200 bg-brand-dark py-4 text-center text-xs text-white/60">
        © Heliport Design Simulator — Politeknik Penerbangan Indonesia
      </footer>
    </div>
  );
}
