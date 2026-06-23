"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import DosenHeader from "@/components/DosenHeader";

export default function DosenDashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dosenNama, setDosenNama] = useState("Dosen");
  const [filter, setFilter] = useState({ search: "", kelas: "", prodi: "" });

  useEffect(() => {
    async function load() {
      try {
        const [sessRes, subRes] = await Promise.all([
          fetch("/api/dosen/session"),
          fetch("/api/submissions"),
        ]);
        if (sessRes.ok) {
          const sess = await sessRes.json();
          setDosenNama(sess.nama || "Dosen");
        }
        if (subRes.ok) {
          const data = await subRes.json();
          setSubmissions(data.submissions || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kelasOptions = useMemo(() => {
    const set = new Set(submissions.map((s) => s.mahasiswa?.kelas).filter(Boolean));
    return [...set].sort();
  }, [submissions]);

  const prodiOptions = useMemo(() => {
    const set = new Set(submissions.map((s) => s.mahasiswa?.prodi).filter(Boolean));
    return [...set].sort();
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const q = filter.search.toLowerCase();
      const matchSearch =
        !q ||
        s.mahasiswa?.nama?.toLowerCase().includes(q) ||
        s.mahasiswa?.nim?.toLowerCase().includes(q);
      const matchKelas = !filter.kelas || s.mahasiswa?.kelas === filter.kelas;
      const matchProdi = !filter.prodi || s.mahasiswa?.prodi === filter.prodi;
      return matchSearch && matchKelas && matchProdi;
    });
  }, [submissions, filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DosenHeader nama={dosenNama} />

      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Penilaian Khusus</h2>
          <p className="mt-1 text-sm text-slate-500">
            Daftar hasil tugas mahasiswa yang telah dikirim dari Mode Tugas.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Pengumpulan" value={submissions.length} />
          <StatCard
            label="Rata-rata Skor A–O"
            value={
              submissions.length
                ? `${Math.round(
                    submissions.reduce((a, s) => a + (s.tugasSummary?.score || 0), 0) /
                      submissions.length
                  )}%`
                : "—"
            }
          />
          <StatCard
            label="Layout Lulus"
            value={
              submissions.length
                ? `${submissions.filter((s) => s.verdict?.passed).length} / ${submissions.length}`
                : "—"
            }
          />
        </div>

        {/* Filters */}
        <div className="card mb-6 flex flex-wrap gap-3 p-4">
          <input
            type="search"
            className="field-input min-w-[200px] flex-1"
            placeholder="Cari nama atau NIM…"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          />
          <select
            className="field-input w-auto"
            value={filter.kelas}
            onChange={(e) => setFilter((f) => ({ ...f, kelas: e.target.value }))}
          >
            <option value="">Semua Kelas</option>
            {kelasOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select
            className="field-input w-auto"
            value={filter.prodi}
            onChange={(e) => setFilter((f) => ({ ...f, prodi: e.target.value }))}
          >
            <option value="">Semua Prodi</option>
            {prodiOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="card-header bg-brand flex items-center justify-between">
            <span>HASIL PENILAIAN MAHASISWA</span>
            <span className="text-xs font-normal opacity-80">{filtered.length} entri</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Memuat data…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">Belum ada pengumpulan tugas.</p>
              <p className="mt-2 text-xs text-slate-400">
                Mahasiswa mengirim hasil melalui tombol &quot;Submit Tugas&quot; di Mode Tugas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Mahasiswa</th>
                    <th className="px-4 py-3">NIM</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Helikopter</th>
                    <th className="px-4 py-3">Skor A–O</th>
                    <th className="px-4 py-3">Layout</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(s.submittedAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {s.mahasiswa?.nama}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.mahasiswa?.nim}</td>
                      <td className="px-4 py-3 text-slate-600">{s.mahasiswa?.kelas || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{s.heliName}</td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={s.tugasSummary?.score ?? 0} />
                      </td>
                      <td className="px-4 py-3">
                        <VerdictBadge passed={s.verdict?.passed} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dosen/submissions/${s.id}`}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Lihat Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color =
    score >= 80 ? "bg-emerald-100 text-emerald-800" : score >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {score}%
    </span>
  );
}

function VerdictBadge({ passed }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
        passed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      {passed ? "Lulus" : "Belum"}
    </span>
  );
}
