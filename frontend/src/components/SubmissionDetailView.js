"use client";

import Link from "next/link";
import { TUGAS_LETTER_DEFS } from "@/lib/tugasDimensions";
import { checkStatus } from "@/lib/calc";
import { formatDateLongId } from "@/lib/formatDate";

function StatusBadge({ status }) {
  const map = {
    ok: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    fail: "bg-red-100 text-red-800 ring-red-200",
    empty: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const label = { ok: "Benar", fail: "Salah", empty: "Kosong" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${map[status] || map.empty}`}>
      {label[status] || status}
    </span>
  );
}

function ValidationBadge({ status }) {
  const map = {
    ok: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    fail: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status?.toUpperCase() || "-"}
    </span>
  );
}

export default function SubmissionDetailView({ data }) {
  if (!data) return null;

  const {
    mahasiswa,
    heliName,
    spec,
    lokasi,
    windLabel,
    dims,
    checks,
    tugasCheck,
    tugasSummary,
    validation,
    verdict,
    steps,
    recs,
    layoutPng,
    schematicPng,
    tugasSchematicPng,
    submittedAt,
    id,
    pdfFile,
  } = data;

  const submittedDate = formatDateLongId(submittedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="portal-page-title">Detail Penilaian Khusus</h2>
          <p className="mt-1 text-sm text-slate-500" suppressHydrationWarning>
            Dikirim: {submittedDate}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(pdfFile || id) && (
            <a
              href={`/api/submissions/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              Lihat PDF Laporan
            </a>
          )}
          <Link href="/dashboard" className="btn-outline text-sm">
            ← Kembali ke Daftar
          </Link>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500">Skor Dimensi A–O</p>
          <p className="mt-1 text-3xl font-extrabold text-brand">
            {tugasSummary?.score ?? 0}%
          </p>
          <p className="text-xs text-slate-500">
            {tugasSummary?.ok ?? 0} benar · {tugasSummary?.fail ?? 0} salah ·{" "}
            {tugasSummary?.empty ?? 0} kosong
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500">Verdict Layout</p>
          <p
            className={`mt-1 text-lg font-bold ${
              verdict?.passed ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {verdict?.passed ? "LULUS" : "BELUM LULUS"}
          </p>
          <p className="text-xs text-slate-500">{verdict?.message}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-500">Helikopter</p>
          <p className="mt-1 text-lg font-bold text-slate-800">{heliName}</p>
          <p className="text-xs text-slate-500">D = {spec?.D} m · MTOM = {spec?.MTOM} kg</p>
        </div>
      </div>

      {/* Data Mahasiswa */}
      <div className="card overflow-hidden">
        <div className="card-header-portal">1. DATA PESERTA</div>
        <div className="grid gap-0 p-4 sm:grid-cols-2">
          <InfoRow label="Nama" value={mahasiswa?.nama} />
          <InfoRow label="Status" value={mahasiswa?.status || "Mahasiswa"} />
          <InfoRow label="NIM" value={mahasiswa?.nim} />
          <InfoRow label="Program Studi" value={mahasiswa?.prodi} />
          <InfoRow label="Kelas" value={mahasiswa?.kelas} />
          <InfoRow label="Institusi" value={mahasiswa?.institusi} className="sm:col-span-2" />
        </div>
      </div>

      {/* Spesifikasi */}
      <div className="card overflow-hidden">
        <div className="card-header-portal">2. SPESIFIKASI HELIKOPTER & LOKASI</div>
        <div className="grid gap-0 p-4 sm:grid-cols-2">
          <InfoRow label="D (rotor)" value={`${spec?.D} m`} />
          <InfoRow label="OL" value={`${spec?.OL} m`} />
          <InfoRow label="UCW" value={`${spec?.UCW} m`} />
          <InfoRow label="MTOM" value={`${spec?.MTOM} kg`} />
          <InfoRow label="VMC" value={spec?.vmc ? "Ya" : "Tidak"} />
          <InfoRow label="Arah Angin" value={windLabel} />
          <InfoRow label="Area Lokasi" value={`${lokasi?.panjang} × ${lokasi?.lebar} m`} />
          <InfoRow label="Ada Obstacle" value={lokasi?.adaObstacle ? "Ya" : "Tidak"} />
        </div>
      </div>

      {/* Tabel A-O */}
      <div className="card overflow-hidden">
        <div className="card-header-portal">3. PENILAIAN DIMENSI A–O (KP 215)</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-3">Huruf</th>
                <th className="pb-2 pr-3">Parameter</th>
                <th className="pb-2 pr-3">Jawaban Mhs</th>
                <th className="pb-2 pr-3">Kunci</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(tugasCheck || []).map((row) => (
                <tr key={row.letter} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-bold text-brand">{row.letter}</td>
                  <td className="py-2 pr-3 text-slate-700">
                    {row.label || TUGAS_LETTER_DEFS[row.letter]?.label}
                    <div className="text-[10px] text-slate-400">
                      {TUGAS_LETTER_DEFS[row.letter]?.reference}
                    </div>
                  </td>
                  <td className="py-2 pr-3 font-mono">
                    {row.entered != null ? `${row.entered} m` : "—"}
                  </td>
                  <td className="py-2 pr-3 font-mono text-slate-500">{row.expected} m</td>
                  <td className="py-2">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cek Layout */}
      <div className="card overflow-hidden">
        <div className="card-header-portal">4. CEK DESAIN LAYOUT</div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-3">Komponen</th>
                <th className="pb-2 pr-3">Minimum</th>
                <th className="pb-2 pr-3">Desain</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(checks || []).map((c) => {
                const st =
                  c.minVal == null
                    ? c.design != null
                      ? "ok"
                      : "na"
                    : checkStatus(c.design, c.minVal);
                return (
                  <tr key={c.name} className="border-t border-slate-100">
                    <td className="py-2 pr-3 font-medium">{c.name}</td>
                    <td className="py-2 pr-3 text-slate-500">{c.min}</td>
                    <td className="py-2 pr-3">
                      {c.design != null ? `${c.design}${c.unit ? ` ${c.unit}` : ""}` : "—"}
                    </td>
                    <td className="py-2">
                      <ValidationBadge status={st} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validasi detail */}
      {validation?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header-portal">5. VALIDASI DETAIL</div>
          <div className="space-y-2 p-4">
            {validation.map((v) => (
              <div
                key={v.id}
                className={`rounded-lg px-3 py-2 text-xs ring-1 ${
                  v.status === "ok"
                    ? "bg-emerald-50 text-emerald-900 ring-emerald-100"
                    : v.status === "warn"
                      ? "bg-amber-50 text-amber-900 ring-amber-100"
                      : "bg-red-50 text-red-900 ring-red-100"
                }`}
              >
                <span className="font-bold">{v.label}</span>
                <span className="ml-2 text-slate-600">— {v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gambar */}
      {(layoutPng || schematicPng || tugasSchematicPng) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {tugasSchematicPng && (
            <div className="card overflow-hidden lg:col-span-2">
              <div className="card-header-portal">DIAGRAM TUGAS A–O & JAWABAN</div>
              <div className="p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tugasSchematicPng}
                  alt="Diagram tugas dimensi A-O"
                  className="mx-auto max-w-full rounded-lg ring-1 ring-slate-200"
                />
              </div>
            </div>
          )}
          {layoutPng && (
            <div className="card overflow-hidden">
              <div className="card-header-portal">LAYOUT DESAIN</div>
              <div className="p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={layoutPng} alt="Layout desain" className="w-full rounded-lg ring-1 ring-slate-200" />
              </div>
            </div>
          )}
          {schematicPng && (
            <div className="card overflow-hidden">
              <div className="card-header-portal">SKEMA DIMENSI</div>
              <div className="p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={schematicPng} alt="Skema dimensi" className="w-full rounded-lg ring-1 ring-slate-200" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dimensi minimum */}
      {dims && (
        <div className="card overflow-hidden">
          <div className="card-header-portal">DIMENSI MINIMUM TERHITUNG</div>
          <div className="grid gap-0 p-4 sm:grid-cols-2">
            <InfoRow label="TLOF (min)" value={`${dims.tlof} m`} />
            <InfoRow label="FATO (min)" value={`${dims.fato} m`} />
            <InfoRow label="Safety Area" value={`${dims.safety} m`} />
            <InfoRow label="Total Extent" value={`${dims.overall} m`} />
          </div>
        </div>
      )}

      {/* Rekomendasi */}
      {recs?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header-portal">REKOMENDASI</div>
          <ul className="list-disc space-y-1 p-4 pl-8 text-sm text-slate-700">
            {recs.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Langkah perhitungan */}
      {steps?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header-portal">LANGKAH PERHITUNGAN</div>
          <div className="space-y-3 p-4 text-xs">
            {steps.map((s, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <p className="font-bold text-slate-800">{s.title}</p>
                <p className="mt-1 text-slate-600">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, className = "" }) {
  return (
    <div className={`flex justify-between border-b border-slate-100 py-2 ${className}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}
