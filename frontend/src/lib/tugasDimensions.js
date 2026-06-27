import { round2, safetyAreaWidth } from "@/lib/calc";

/** Huruf A–O sesuai KP 215 Tahun 2019 (Mode Tugas). */
export const TUGAS_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O"];

export const TUGAS_LETTER_DEFS = {
  A: {
    label: "Lebar Safety Area (VMC)",
    reference: "≥ 3,0 m atau 0,25 D (mana yang lebih besar)",
    formula: "max(3, 0.25 × D)",
  },
  B: {
    label: "Sisi FATO",
    reference: "≥ 1 D jika MTOM > 3.175 kg; ≥ 0,83 D jika MTOM ≤ 3.175 kg",
    formula: "MTOM > 3175 ? 1.0×D : 0.83×D",
  },
  C: {
    label: "Lebar total fasilitas (FATO + 2×Safety)",
    reference: "B + 2A",
    formula: "B + 2A",
  },
  D: {
    label: "Sisi TLOF",
    reference: "Ukuran minimum = 0,83 D × 0,83 D",
    formula: "0.83 × D",
  },
  E: {
    label: "Jarak tepi luar lingkaran ke tepi dalam kotak kuning",
    reference: "(D − Ø lingkaran) / 2",
    formula: "(D − 0,5×D) / 2",
  },
  F: {
    label: "Tinggi total huruf H",
    reference: "3,0 m",
    formula: "3.0",
  },
  G: {
    label: "Lebar batang vertikal huruf H",
    reference: "0,4 m",
    formula: "0.4",
  },
  H: {
    label: "Tebal batang horizontal huruf H",
    reference: "0,4 m",
    formula: "0.4",
  },
  I: {
    label: "Tinggi kepala panah alignment",
    reference: "1,6 m",
    formula: "1.6",
  },
  K: {
    label: "Lebar batang panah alignment",
    reference: "0,53 m",
    formula: "0.53",
  },
  L: {
    label: "Panjang total panah alignment",
    reference: "Dari tepi atas TLOF ke perimeter FATO",
    formula: "(B − D) / 2 + panah",
  },
  M: {
    label: "Panjang segmen garis putus-putus FATO",
    reference: "1,50 m",
    formula: "1.5",
  },
  N: {
    label: "Jarak antar segmen garis FATO",
    reference: "1,50 m",
    formula: "1.5",
  },
  O: {
    label: "Lebar garis putus-putus FATO",
    reference: "0,30 m",
    formula: "0.3",
  },
};

export function fatoMinByMtom(spec) {
  const D = Number(spec.D) || 0;
  const mtom = Number(spec.MTOM) || 0;
  return round2(mtom > 3175 ? 1.0 * D : 0.83 * D);
}

/** Hitung jawaban benar untuk setiap huruf berdasarkan data helikopter. */
export function computeTugasAnswers(spec) {
  const D = Number(spec.D) || 0;
  const A = safetyAreaWidth(spec);
  const B = fatoMinByMtom(spec);
  const C = round2(B + 2 * A);
  const tlof = round2(0.83 * D);
  const touchdown = round2(0.5 * D);
  const hBarW = 0.4;
  const arrowHeadLen = 1.6;
  const L = round2((B - tlof) / 2 + arrowHeadLen);

  return {
    A,
    B,
    C,
    D: tlof,
    E: round2((tlof - touchdown) / 2),
    F: 3.0,
    G: hBarW,
    H: hBarW,
    I: arrowHeadLen,
    K: 0.53,
    L,
    M: 1.5,
    N: 1.5,
    O: 0.3,
  };
}

/** Geometri proporsional untuk menggambar skema (dalam meter). */
export function tugasSchematicGeometry(spec) {
  const D = Number(spec.D) || 13.8;
  const answers = computeTugasAnswers(spec);
  return {
    D,
    safety: answers.A,
    fato: answers.B,
    overall: answers.C,
    tlof: answers.D,
    circleDisplay: answers.D,
    touchdown: round2(0.5 * D),
    hHeight: answers.F,
    hBarW: answers.G,
    hWidth: 1.8,
    arrowHeadLen: answers.I,
    arrowHeadW: 1.5,
    arrowShaftW: answers.K,
    arrowShaftLen: 3.0,
    dashSeg: answers.M,
    dashGap: answers.N,
    dashWidth: answers.O,
  };
}

export function emptyTugasAnswers() {
  return Object.fromEntries(TUGAS_LETTERS.map((l) => [l, ""]));
}

export function hasFilledTugasAnswers(answers) {
  if (!answers) return false;
  return TUGAS_LETTERS.some((letter) => {
    const value = answers[letter];
    return value !== "" && value != null && String(value).trim() !== "";
  });
}

export function isAllTugasAnswersFilled(answers) {
  if (!answers) return false;
  return TUGAS_LETTERS.every((letter) => parseTugasAnswer(answers[letter]) != null);
}

function isPositiveSpecValue(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function isHeliInputComplete(helicopterName, spec) {
  if (!helicopterName?.trim()) return false;
  if (!isPositiveSpecValue(spec?.D)) return false;
  if (!isPositiveSpecValue(spec?.OL)) return false;
  if (!isPositiveSpecValue(spec?.UCW)) return false;
  if (!isPositiveSpecValue(spec?.MTOM)) return false;
  if (spec?.vmc === "" || spec?.vmc == null) return false;
  return true;
}

export function isCanvasLayoutComplete(present) {
  return (
    present.includes("tlof") &&
    present.includes("fato") &&
    present.includes("safety")
  );
}

/** Cek kesiapan submit Mode Tugas — input helikopter, kanvas, dan jawaban A–O. */
export function getTugasSubmitReadiness({ helicopterName, spec, present, tugasAnswers }) {
  const missing = [];

  if (!helicopterName?.trim()) missing.push("nama/tipe helikopter");
  if (!isPositiveSpecValue(spec?.D)) missing.push("rotor diameter (D)");
  if (!isPositiveSpecValue(spec?.OL)) missing.push("overall length (OL)");
  if (!isPositiveSpecValue(spec?.UCW)) missing.push("undercarriage width (UCW)");
  if (!isPositiveSpecValue(spec?.MTOM)) missing.push("MTOM");
  if (spec?.vmc === "" || spec?.vmc == null) missing.push("performance class (VMC)");

  if (!isCanvasLayoutComplete(present)) {
    missing.push("layout kanvas (TLOF, FATO, Safety Area)");
  }

  if (!isAllTugasAnswersFilled(tugasAnswers)) {
    missing.push("semua dimensi huruf A–O");
  }

  return { ready: missing.length === 0, missing };
}

export function parseTugasAnswer(value) {
  if (value === "" || value == null) return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Bandingkan jawaban mahasiswa dengan kunci (toleransi 0.05 m). */
export function checkTugasAnswers(studentAnswers, spec, tolerance = 0.05) {
  const key = computeTugasAnswers(spec);
  return TUGAS_LETTERS.map((letter) => {
    const entered = parseTugasAnswer(studentAnswers[letter]);
    const expected = key[letter];
    if (entered == null) {
      return { letter, status: "empty", entered: null, expected, label: TUGAS_LETTER_DEFS[letter].label };
    }
    const ok = Math.abs(entered - expected) <= tolerance;
    return {
      letter,
      status: ok ? "ok" : "fail",
      entered,
      expected,
      label: TUGAS_LETTER_DEFS[letter].label,
    };
  });
}
