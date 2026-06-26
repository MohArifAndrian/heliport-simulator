"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { formatDateTimeId } from "@/lib/formatDate";

const SubmissionCharts = dynamic(() => import("@/components/SubmissionCharts"), {
  ssr: false,
  loading: () => (
    <div className="dash-card p-12 text-center text-sm text-slate-400">Memuat grafik…</div>
  ),
});

export default function DosenDashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: "", kelas: "", prodi: "" });

  useEffect(() => {
    async function load() {
      try {
        const subRes = await fetch("/api/submissions");
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

  const stats = useMemo(() => {
    const total = filtered.length;
    const avg =
      total > 0
        ? Math.round(
            filtered.reduce((a, s) => a + (s.tugasSummary?.score || 0), 0) / total
          )
        : 0;
    const passed = filtered.filter((s) => s.verdict?.passed).length;
    return { total, avg, passed };
  }, [filtered]);

  const handleExport = useCallback(() => {
    const rows = [
      ["Waktu", "Nama", "Status", "NIM", "Kelas", "Prodi", "Helikopter", "Skor", "Layout", "PDF"],
      ...filtered.map((s) => [
        new Date(s.submittedAt).toISOString(),
        s.mahasiswa?.nama || "",
        s.mahasiswa?.status || "Mahasiswa",
        s.mahasiswa?.nim || "",
        s.mahasiswa?.kelas || "",
        s.mahasiswa?.prodi || "",
        s.heliName || "",
        String(s.tugasSummary?.score ?? 0),
        s.verdict?.passed ? "Lulus" : "Belum",
        s.hasPdf ? "Ya" : "Tidak",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `penilaian-heliport-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Page header — FleetYu style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Dashboard Penilaian
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Monitor performa pengumpulan tugas mahasiswa
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStat
          label="Total Pengumpulan"
          value={loading ? "—" : stats.total}
          icon="inbox"
          trend={null}
        />
        <QuickStat
          label="Rata-rata Skor A–O"
          value={loading ? "—" : stats.total ? `${stats.avg}%` : "—"}
          icon="chart"
          trend={stats.avg >= 70 ? "up" : stats.avg > 0 ? "down" : null}
        />
        <QuickStat
          label="Layout Lulus"
          value={loading ? "—" : stats.total ? `${stats.passed}/${stats.total}` : "—"}
          icon="check"
          trend={stats.total > 0 && stats.passed / stats.total >= 0.65 ? "up" : null}
        />
      </div>

      {/* Search & filters */}
      <div className="dash-card flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[200px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
            placeholder="Cari nama atau NIM…"
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
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
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
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

      {/* Charts — Chart.js (client-only, no SSR) */}
      {!loading && <SubmissionCharts submissions={filtered} />}

      {/* Full table */}
      <div className="dash-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-900">Semua Pengumpulan</h3>
            <p className="text-xs text-slate-500">{filtered.length} entri</p>
          </div>
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
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3">Mahasiswa</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">NIM</th>
                  <th className="px-5 py-3">Kelas</th>
                  <th className="px-5 py-3">Helikopter</th>
                  <th className="px-5 py-3">Skor A–O</th>
                  <th className="px-5 py-3">Layout</th>
                  <th className="px-5 py-3">PDF</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-blue-50/30">
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDateTimeId(s.submittedAt)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{s.mahasiswa?.nama}</td>
                    <td className="px-5 py-3 text-slate-600">{s.mahasiswa?.status || "Mahasiswa"}</td>
                    <td className="px-5 py-3 text-slate-600">{s.mahasiswa?.nim}</td>
                    <td className="px-5 py-3 text-slate-600">{s.mahasiswa?.kelas || "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{s.heliName}</td>
                    <td className="px-5 py-3">
                      <ScoreBadge score={s.tugasSummary?.score ?? 0} />
                    </td>
                    <td className="px-5 py-3">
                      <VerdictBadge passed={s.verdict?.passed} />
                    </td>
                    <td className="px-5 py-3">
                      {s.hasPdf ? (
                        <a
                          href={`/api/submissions/${s.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/submissions/${s.id}`}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon, trend }) {
  return (
    <div className="dash-card flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand">
        <QuickStatIcon name={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-slate-900">{value}</p>
          {trend === "up" && (
            <span className="text-[10px] font-bold text-emerald-600">▲ baik</span>
          )}
          {trend === "down" && (
            <span className="text-[10px] font-bold text-amber-600">▼ perlu perhatian</span>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStatIcon({ name }) {
  const props = { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 2 };
  if (name === "inbox") {
    return (
      <svg {...props}>
        <path d="M4 4h16v16H4z" />
        <path d="M4 9h16M9 9v11" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg {...props}>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreBadge({ score }) {
  const color =
    score >= 80
      ? "bg-emerald-100 text-emerald-800"
      : score >= 50
        ? "bg-blue-100 text-blue-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>{score}%</span>
  );
}

function VerdictBadge({ passed }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
        passed ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {passed ? "Lulus" : "Belum"}
    </span>
  );
}
