"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteLogo } from "@/components/icons";

export default function PesertaLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/tugas";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/peserta/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }
      window.dispatchEvent(new Event("peserta-changed"));
      router.push(next);
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
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-portal-lg">
            <SiteLogo size={56} className="h-full w-full" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-portal-cyan">
              Politeknik Penerbangan Indonesia
            </p>
            <h1 className="mt-1 text-xl font-extrabold uppercase tracking-wide sm:text-2xl">
              Login Peserta
            </h1>
            <p className="mt-1 text-sm text-white/70">Heliport Design Simulator</p>
          </div>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="card p-6 shadow-portal-lg">
          <h2 className="mb-1 text-lg font-extrabold uppercase tracking-wide text-brand-dark">Masuk</h2>
          <p className="mb-5 text-sm text-slate-600">
            Masukkan email dan kata sandi yang diberikan dosen.
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
            placeholder="cth: nama@poltekbang.id"
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
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk sebagai Peserta"}
          </button>

          <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 ring-1 ring-sky-100">
            Akun demo: <b>peserta.demo@poltekbang.id</b> · sandi <b>peserta123</b>
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
