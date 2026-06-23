"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconH } from "@/components/icons";

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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white shadow-lg">
              <IconH />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Portal Dosen</h1>
          <p className="mt-1 text-sm text-slate-500">
            Penilaian Khusus — Mode Tugas Heliport
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 shadow-md">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Masuk</h2>

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
            placeholder="dosen@heliport.id"
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
            {loading ? "Memproses…" : "Masuk ke Dashboard"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Hanya dosen yang dapat mengakses hasil penilaian mahasiswa.
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="text-brand hover:underline">
            ← Kembali ke Simulator
          </Link>
        </p>
      </div>
    </div>
  );
}
