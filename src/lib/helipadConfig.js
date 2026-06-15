import { round2 } from "@/lib/calc";

export const DEFAULT_HELIPAD_CONFIG = {
  totalArea: 22,
  tlofDiameter: 9,
  ringWidth: 0.5,
  hWidth: 1.8,
  hHeight: 3,
  hStroke: 0.6,
  ppjText: "PPJ",
  ppjOffsetX: 0,
  ppjOffsetY: -7.05,
  boxWidth: 2.67,
  boxHeight: 3.67,
  angkaAtas: "04t",
  angkaBawah: "14",
};

export function fatoDiameter(config) {
  return round2((Number(config.tlofDiameter) || 0) + 2 * (Number(config.ringWidth) || 0));
}

export function computeHelipadMetrics(config) {
  const area = Number(config.totalArea) || 0;
  const tlofD = Number(config.tlofDiameter) || 0;
  const ringW = Number(config.ringWidth) || 0;
  const fatoD = fatoDiameter(config);

  const rTlof = tlofD / 2;
  const rFato = fatoD / 2;

  const luasArea = round2(area * area);
  const luasTlof = round2(Math.PI * rTlof * rTlof);
  const luasKuning = round2(Math.PI * rFato * rFato);
  const luasRing = round2(luasKuning - luasTlof);
  const kelilingKuning = round2(Math.PI * fatoD);
  const rasioTlof = luasKuning > 0 ? round2((luasTlof / luasKuning) * 100) : 0;

  return {
    fatoD,
    luasArea,
    luasTlof,
    luasRing,
    kelilingKuning,
    rasioTlof,
  };
}

/** Map dimensi otomatis dari kalkulator helikopter ke config skema. */
export function dimsToHelipadConfig(dims, lokasi) {
  const tlofD = dims?.tlof || DEFAULT_HELIPAD_CONFIG.tlofDiameter;
  const fatoD = dims?.fato || DEFAULT_HELIPAD_CONFIG.tlofDiameter + 1;
  const ringW = round2(Math.max(0, (fatoD - tlofD) / 2));

  const d = Number(lokasi?.arahAngin ?? 270);
  const tens = Math.round(d / 10) % 36;
  const angkaAtas = `${String(tens).padStart(2, "0")}t`;

  return {
    ...DEFAULT_HELIPAD_CONFIG,
    totalArea: dims?.overall || DEFAULT_HELIPAD_CONFIG.totalArea,
    tlofDiameter: tlofD,
    ringWidth: ringW || DEFAULT_HELIPAD_CONFIG.ringWidth,
    hWidth: round2(tlofD * 0.2),
    hHeight: round2(tlofD / 3),
    angkaAtas,
    angkaBawah: String(Math.round(fatoD)),
  };
}
