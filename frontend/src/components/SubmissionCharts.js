"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bar, Doughnut } from "react-chartjs-2";
import { CHART_BLUE, baseChartOptions, ensureChartJsRegistered } from "@/lib/chartTheme";
import { formatDateTimeId, formatWeekdayShortId } from "@/lib/formatDate";
import { useMounted } from "@/lib/useMounted";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function DashboardCard({ title, subtitle, children, className = "", headerRight = null }) {
  return (
    <div className={`dash-card ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="dash-card-title">{title}</h3>
          {subtitle && <p className="dash-card-subtitle">{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function MonthlySubmissionsChart({ submissions }) {
  const { labels, counts, highlightIndex } = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 7; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] });
    }
    const counts = months.map(({ year, month }) =>
      submissions.filter((s) => {
        const d = new Date(s.submittedAt);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length
    );
    const highlightIndex = counts.length - 1;
    return { labels: months.map((m) => m.label), counts, highlightIndex };
  }, [submissions]);

  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: counts.map((_, i) =>
          i === highlightIndex ? CHART_BLUE.primary : CHART_BLUE.pale
        ),
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  };

  const options = baseChartOptions({
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: CHART_BLUE.muted, font: { size: 10 } },
        border: { display: false },
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  });

  const current = counts[highlightIndex] ?? 0;
  const prev = counts[highlightIndex - 1] ?? 0;
  const trend = prev > 0 ? Math.round(((current - prev) / prev) * 100) : current > 0 ? 100 : 0;

  return (
    <DashboardCard
      title="Pengumpulan Bulan Ini"
      subtitle={`${labels[highlightIndex]} · ${current} tugas`}
      headerRight={
        trend !== 0 ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend >= 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        ) : null
      }
    >
      <div className="h-[180px]">
        <Bar data={data} options={options} />
      </div>
    </DashboardCard>
  );
}

function PassRateChart({ passed, failed, weeklyCounts }) {
  const total = passed + failed;
  const rate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const doughnutData = {
    labels: ["Lulus", "Belum"],
    datasets: [
      {
        data: total > 0 ? [passed, failed] : [1, 0],
        backgroundColor: [CHART_BLUE.primary, CHART_BLUE.surface],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const doughnutOptions = baseChartOptions({
    cutout: "72%",
    plugins: { tooltip: { enabled: total > 0 } },
  });

  const weekData = {
    labels: weeklyCounts.map((w) => w.label),
    datasets: [
      {
        data: weeklyCounts.map((w) => w.count),
        backgroundColor: CHART_BLUE.primary,
        borderRadius: 4,
        maxBarThickness: 14,
      },
    ],
  };

  const weekOptions = baseChartOptions({
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
  });

  return (
    <DashboardCard title="Tingkat Kelulusan Layout" subtitle="Proporsi desain yang memenuhi syarat">
      <div className="flex items-end gap-4">
        <div className="relative h-[120px] w-[140px] shrink-0">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
            <p className="text-2xl font-extrabold text-brand-dark">{rate}%</p>
            {total > 0 && (
              <p className="text-[10px] font-semibold text-emerald-600">+{passed} lulus</p>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Lulus <strong className="text-slate-800">{passed}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Belum <strong className="text-slate-800">{failed}</strong>
            </span>
          </div>
          <div className="h-[80px]">
            <Bar data={weekData} options={weekOptions} />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">7 hari terakhir</p>
        </div>
      </div>
    </DashboardCard>
  );
}

function KelasCapacityChart({ rows }) {
  const data = {
    labels: rows.map((r) => r.kelas),
    datasets: [
      {
        label: "Lulus",
        data: rows.map((r) => r.passed),
        backgroundColor: CHART_BLUE.primary,
        borderRadius: 4,
        barThickness: 14,
      },
      {
        label: "Belum",
        data: rows.map((r) => r.failed),
        backgroundColor: CHART_BLUE.surface,
        borderRadius: 4,
        barThickness: 14,
      },
    ],
  };

  const options = baseChartOptions({
    indexAxis: "y",
    scales: {
      x: {
        stacked: true,
        display: false,
        max: Math.max(...rows.map((r) => r.total), 1),
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { color: CHART_BLUE.muted, font: { size: 11, weight: "500" } },
        border: { display: false },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          afterBody: (items) => {
            const idx = items[0]?.dataIndex;
            if (idx == null) return "";
            const row = rows[idx];
            return `Total: ${row.total} · ${row.pct}% lulus`;
          },
        },
      },
    },
  });

  return (
    <DashboardCard title="Kapasitas per Kelas" subtitle="Distribusi kelulusan layout">
      <div className="mb-3 flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Lulus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          Belum
        </span>
      </div>
      <div className="h-[200px]">
        {rows.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">Belum ada data kelas.</p>
        )}
      </div>
      {rows.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {rows.map((r) => (
            <div key={r.kelas} className="flex items-center justify-between text-xs text-slate-500">
              <span>{r.kelas}</span>
              <span className="font-bold text-brand">{r.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function RecentSubmissionsPanel({ submissions, total }) {
  const passed = submissions.filter((s) => s.verdict?.passed).length;
  const failed = submissions.length - passed;
  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((a, s) => a + (s.tugasSummary?.score ?? 0), 0) / submissions.length
        )
      : 0;

  return (
    <DashboardCard
      title="Pengumpulan Tugas"
      subtitle="Daftar pengumpulan terbaru"
      className="lg:col-span-2"
      headerRight={
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-3xl font-extrabold text-brand-dark">{total}</span>
          <div className="text-right text-[10px] text-slate-500">
            <p>rata skor</p>
            <p className="font-bold text-brand">{avgScore}%</p>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <StatusPill color="bg-brand" label="Lulus" value={passed} />
        <StatusPill color="bg-amber-400" label="Belum" value={failed} />
        <StatusPill color="bg-portal-cyan" label="Total" value={total} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Mahasiswa</th>
              <th className="px-4 py-2.5">NIM</th>
              <th className="px-4 py-2.5">Helikopter</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Skor</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada pengumpulan.
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.mahasiswa?.nama}</td>
                  <td className="px-4 py-3 text-slate-500">{s.mahasiswa?.nim}</td>
                  <td className="px-4 py-3 text-slate-600">{s.heliName || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge passed={s.verdict?.passed} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={s.tugasSummary?.score ?? 0} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/submissions/${s.id}`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

function ActivityTimeline({ items }) {
  return (
    <DashboardCard title="Aktivitas Terbaru" subtitle="Timeline pengumpulan tugas">
      <div className="mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Pengumpulan aktif
            </p>
            <p className="text-sm font-bold text-brand-dark">
              {items.length > 0 ? items[0].mahasiswa?.nama : "—"}
            </p>
          </div>
          {items.length > 0 && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white">
              {items[0].verdict?.passed ? "Lulus" : "Dinilai"}
            </span>
          )}
        </div>
        <div className="mt-3 flex h-16 items-center justify-center rounded-md border border-dashed border-blue-200 bg-white/60">
          <svg viewBox="0 0 200 60" className="h-12 w-full max-w-[240px] text-brand/30">
            <path
              d="M20 40 Q60 10 100 30 T180 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle cx="20" cy="40" r="6" fill="#004080" />
            <circle cx="180" cy="20" r="6" fill="#00CCFF" />
          </svg>
        </div>
      </div>

      <ol className="space-y-0">
        {items.length === 0 ? (
          <li className="py-4 text-center text-sm text-slate-400">Belum ada aktivitas.</li>
        ) : (
          items.map((item, i) => (
            <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < items.length - 1 && (
                <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
              )}
              <span
                className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${
                  item.verdict?.passed
                    ? "bg-emerald-500"
                    : i === 0
                      ? "bg-brand"
                      : "bg-amber-400"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.mahasiswa?.nama}</p>
                    <p className="text-xs text-slate-500">
                      {item.verdict?.passed ? "Layout lulus" : "Menunggu perbaikan"} · Skor{" "}
                      {item.tugasSummary?.score ?? 0}%
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-slate-400" suppressHydrationWarning>
                    {formatDateTimeId(item.submittedAt)}
                  </time>
                </div>
              </div>
            </li>
          ))
        )}
      </ol>
    </DashboardCard>
  );
}

function StatusPill({ color, label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-slate-600">{label}</span>
      <strong className="text-slate-800">{value}</strong>
    </span>
  );
}

function StatusBadge({ passed }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        passed ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {passed ? "Lulus" : "Belum"}
    </span>
  );
}

function ScoreBadge({ score }) {
  const color =
    score >= 80
      ? "bg-emerald-100 text-emerald-800"
      : score >= 50
        ? "bg-blue-100 text-blue-800"
        : "bg-red-100 text-red-800";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${color}`}>{score}%</span>;
}

export default function SubmissionCharts({ submissions }) {
  const mounted = useMounted();

  if (mounted) {
    ensureChartJsRegistered();
  }

  const verdict = useMemo(() => {
    let passed = 0;
    let failed = 0;
    submissions.forEach((s) => {
      if (s.verdict?.passed) passed += 1;
      else failed += 1;
    });
    return { passed, failed };
  }, [submissions]);

  const weeklyCounts = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = submissions.filter((s) => {
        const t = new Date(s.submittedAt);
        return t >= d && t < next;
      }).length;
      days.push({
        label: formatWeekdayShortId(d),
        count,
      });
    }
    return days;
  }, [submissions]);

  const kelasRows = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      const kelas = s.mahasiswa?.kelas || "Tanpa Kelas";
      if (!map.has(kelas)) map.set(kelas, { passed: 0, failed: 0, total: 0 });
      const row = map.get(kelas);
      row.total += 1;
      if (s.verdict?.passed) row.passed += 1;
      else row.failed += 1;
    });
    return [...map.entries()]
      .map(([kelas, { passed, failed, total }]) => ({
        kelas,
        passed,
        failed,
        total,
        pct: total > 0 ? Math.round((passed / total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [submissions]);

  const recent = useMemo(
    () =>
      [...submissions]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5),
    [submissions]
  );

  const timeline = useMemo(
    () =>
      [...submissions]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 4),
    [submissions]
  );

  if (!mounted) {
    return (
      <div className="dash-card p-8 text-center text-sm text-slate-400">Memuat grafik…</div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="dash-card p-8 text-center">
        <p className="text-sm text-slate-500">Belum ada data untuk grafik.</p>
        <p className="mt-1 text-xs text-slate-400">
          Grafik akan muncul setelah mahasiswa mengirim tugas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlySubmissionsChart submissions={submissions} />
        <PassRateChart
          passed={verdict.passed}
          failed={verdict.failed}
          weeklyCounts={weeklyCounts}
        />
        <KelasCapacityChart rows={kelasRows} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <RecentSubmissionsPanel submissions={recent} total={submissions.length} />
        <ActivityTimeline items={timeline} />
      </div>
    </div>
  );
}
