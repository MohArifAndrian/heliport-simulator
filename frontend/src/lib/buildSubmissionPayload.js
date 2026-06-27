import { WIND_DIRECTIONS } from "@/lib/helicopters";
import { computeSteps, recommendations, validateDesign, designVerdict } from "@/lib/calc";
import { checkTugasAnswers } from "@/lib/tugasDimensions";
import { DEFAULT_MAHASISWA_STATUS } from "@/lib/mahasiswaStatus";

export function summarizeTugasCheck(tugasCheck) {
  if (!tugasCheck?.length) return { ok: 0, fail: 0, empty: 0, total: 0, score: 0 };
  const ok = tugasCheck.filter((r) => r.status === "ok").length;
  const fail = tugasCheck.filter((r) => r.status === "fail").length;
  const empty = tugasCheck.filter((r) => r.status === "empty").length;
  const total = tugasCheck.length;
  const score = total > 0 ? Math.round((ok / total) * 100) : 0;
  return { ok, fail, empty, total, score };
}

export function buildSubmissionPayload({
  mahasiswa,
  helicopterName,
  spec,
  lokasi,
  dims,
  checks,
  tugasAnswers,
  validation,
  layoutPng,
  schematicPng,
  mode,
  geo,
}) {
  const heliName = helicopterName?.trim() || "-";
  const windLabel =
    WIND_DIRECTIONS.find((w) => w.value === Number(lokasi?.arahAngin ?? 270))?.label ?? "-";

  const validationResult = validation ?? (geo ? validateDesign(dims, geo, lokasi) : []);
  const verdict = designVerdict(validationResult);
  const tugasCheck = checkTugasAnswers(tugasAnswers, spec);
  const tugasSummary = summarizeTugasCheck(tugasCheck);

  return {
    mahasiswa: {
      nama: mahasiswa?.nama || "-",
      status: mahasiswa?.status || DEFAULT_MAHASISWA_STATUS,
      nim: mahasiswa?.nim || "-",
      prodi: mahasiswa?.prodi || "-",
      kelas: mahasiswa?.kelas || "-",
      institusi: mahasiswa?.institusi || "-",
    },
    heliName,
    spec,
    lokasi,
    windLabel,
    dims,
    checks,
    tugasAnswers,
    tugasCheck,
    tugasSummary,
    validation: validationResult,
    verdict,
    steps: computeSteps(spec),
    recs: recommendations(spec, lokasi, validationResult),
    layoutPng: layoutPng || null,
    schematicPng: schematicPng || null,
    mode: mode || "tugas",
  };
}
