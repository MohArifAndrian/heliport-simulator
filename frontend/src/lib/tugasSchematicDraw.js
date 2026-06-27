import { TUGAS_LETTERS } from "@/lib/tugasDimensions";

/**
 * Layout tetap (px) — proporsi disesuaikan dengan diagram referensi KP 215.
 */
const SCALE = 1.65;

const LAYOUT = {
  C: Math.round(300 * SCALE),
  A: Math.round(36 * SCALE),
  get B() {
    return this.C - 2 * this.A;
  },
  tlofRatio: 0.56,
  circleRatio: 0.68,
  hHeightRatio: 0.33,
  hWidthRatio: 0.4,
  hBarRatio: 0.1,
  arrowHeadRatio: 0.22,
  arrowShaftWRatio: 0.07,
  dashSegRatio: 0.065,
  dashGapRatio: 0.065,
  dashWRatio: 0.013,
};

const COLORS = {
  safety: "#3d5a25",
  fato: "#333333",
  tlof: "#ffcc00",
  white: "#ffffff",
  dim: "#ffffff",
};

const PAD = {
  top: Math.round(32 * SCALE),
  right: Math.round(46 * SCALE),
  bottom: Math.round(58 * SCALE),
  left: Math.round(46 * SCALE),
};

function px(layout) {
  const B = layout.B;
  const D = B * LAYOUT.tlofRatio;
  const circle = D * LAYOUT.circleRatio;
  const E = (D - circle) / 2;
  const hH = circle * LAYOUT.hHeightRatio;
  const hW = circle * LAYOUT.hWidthRatio;
  const bar = hW * LAYOUT.hBarRatio;
  const arrowHeadH = (D / 2 - E) * LAYOUT.arrowHeadRatio;
  const arrowShaftW = circle * LAYOUT.arrowShaftWRatio;
  const dashSeg = B * LAYOUT.dashSegRatio;
  const dashGap = B * LAYOUT.dashGapRatio;
  const dashW = B * LAYOUT.dashWRatio;
  return { B, D, circle, E, hH, hW, bar, arrowHeadH, arrowShaftW, dashSeg, dashGap, dashW };
}

function drawArrowHead(ctx, x, y, dir) {
  const s = Math.round(4 * SCALE);
  ctx.fillStyle = COLORS.dim;
  ctx.beginPath();
  if (dir === "left") {
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y - s);
    ctx.lineTo(x + s, y + s);
  } else if (dir === "right") {
    ctx.moveTo(x, y);
    ctx.lineTo(x - s, y - s);
    ctx.lineTo(x - s, y + s);
  } else if (dir === "up") {
    ctx.moveTo(x, y);
    ctx.lineTo(x - s, y + s);
    ctx.lineTo(x + s, y + s);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x - s, y - s);
    ctx.lineTo(x + s, y - s);
  }
  ctx.closePath();
  ctx.fill();
}

function drawDimLabel(ctx, x, y, label, align = "center") {
  const fs = Math.round(11 * SCALE);
  ctx.font = `bold ${fs}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.dim;
  ctx.fillText(label, x, y);
}

function drawDimH(ctx, x1, x2, y, label, offsetY = 0, labelAbove = true) {
  ctx.strokeStyle = COLORS.dim;
  ctx.lineWidth = 1;
  const yLine = y + offsetY;
  ctx.beginPath();
  ctx.moveTo(x1, yLine);
  ctx.lineTo(x2, yLine);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, yLine - 3);
  ctx.lineTo(x1, yLine + 3);
  ctx.moveTo(x2, yLine - 3);
  ctx.lineTo(x2, yLine + 3);
  ctx.stroke();
  drawArrowHead(ctx, x1, yLine, "left");
  drawArrowHead(ctx, x2, yLine, "right");
  drawDimLabel(ctx, (x1 + x2) / 2, yLine + (labelAbove ? -10 : 10), label);
}

function drawDimV(ctx, y1, y2, x, label, offsetX = 0, labelSide = "left") {
  ctx.strokeStyle = COLORS.dim;
  ctx.lineWidth = 1;
  const xLine = x + offsetX;
  ctx.beginPath();
  ctx.moveTo(xLine, y1);
  ctx.lineTo(xLine, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xLine - 3, y1);
  ctx.lineTo(xLine + 3, y1);
  ctx.moveTo(xLine - 3, y2);
  ctx.lineTo(xLine + 3, y2);
  ctx.stroke();
  drawArrowHead(ctx, xLine, y1, "up");
  drawArrowHead(ctx, xLine, y2, "down");
  const labelX = labelSide === "right" ? xLine + 12 : xLine - 12;
  drawDimLabel(ctx, labelX, (y1 + y2) / 2, label, "center");
}

function drawLetterH(ctx, cx, cy, w, h, bar) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x, y, bar, h);
  ctx.fillRect(x + w - bar, y, bar, h);
  ctx.fillRect(x, y + (h - bar) / 2, w, bar);
}

function drawDashedRect(ctx, x, y, size, dashLen, gap, lineW) {
  const h = size / 2;
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = Math.max(lineW, 2);
  ctx.setLineDash([dashLen, gap]);
  ctx.strokeRect(x - h, y - h, size, size);
  ctx.setLineDash([]);
}

function drawOutlineRect(ctx, x, y, size, lineW = 3) {
  const h = size / 2;
  ctx.strokeStyle = COLORS.tlof;
  ctx.lineWidth = lineW;
  ctx.strokeRect(x - h, y - h, size, size);
}

function drawOutlineCircle(ctx, cx, cy, diameter, lineW = 3) {
  ctx.beginPath();
  ctx.arc(cx, cy, diameter / 2, 0, Math.PI * 2);
  ctx.strokeStyle = COLORS.tlof;
  ctx.lineWidth = lineW;
  ctx.stroke();
}

function drawAlignmentArrow(ctx, cx, baseY, tipY, headH, headW, shaftW) {
  const shaftTop = tipY + headH;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx - headW / 2, shaftTop);
  ctx.lineTo(cx + headW / 2, shaftTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - shaftW / 2, shaftTop, shaftW, baseY - shaftTop);
  return { tipY, shaftTop, baseY };
}

function drawAssignmentLabels(ctx, geom) {
  const {
    ox,
    oy,
    C,
    fatoX,
    fatoY,
    B,
    fcx,
    fcy,
    tcx,
    tcy,
    tlofX,
    tlofY,
    arrow,
    circleR,
    m,
  } = geom;

  const { hH, hW, bar, D, dashSeg, dashGap, dashW, arrowShaftW } = m;

  drawDimV(ctx, oy, fatoY, fcx, "A", 0, "left");
  drawDimH(ctx, ox, fatoX, fcy, "A", 0);
  drawDimH(ctx, fatoX + B, ox + C, fcy, "A", 0);
  drawDimV(ctx, fatoY + B, oy + C, ox + LAYOUT.A * 0.45, "A", 0, "left");
  drawDimV(ctx, fatoY, fatoY + dashSeg, fcx, "I", 0, "left");
  drawDimH(ctx, fatoX, tlofX, fatoY + B * 0.11, "M", 0);

  const leftSegY = fatoY + B * 0.18;
  drawDimV(ctx, leftSegY, leftSegY + dashSeg, fatoX, "N", 0, "left");
  drawDimH(ctx, fatoX - dashW - 2, fatoX, leftSegY + dashSeg * 0.5, "O", 0);
  drawDimH(ctx, tcx - circleR, tcx - hW / 2, tcy, "E", 0);
  drawDimV(ctx, tcy - hH / 2, tcy + hH / 2, tcx + hW / 2 + 5, "F", 0, "right");
  drawDimH(ctx, tcx + hW / 2 - bar, tcx + hW / 2, tcy + hH / 2 + 5, "G", 0, false);
  drawDimH(ctx, tcx - hW / 2 + bar, tcx + hW / 2 - bar, tcy + hH / 2 + 18, "H", 0, false);
  drawDimH(ctx, tlofX, tlofX + D, tlofY + D + 6, "D", 0, false);
  drawDimV(ctx, tlofY, tlofY + D, tlofX + D + 6, "D", 0, "right");
  drawDimV(ctx, fatoY, tlofY, tcx + arrowShaftW + 12, "L", 0, "right");
  drawDimH(
    ctx,
    tcx - arrowShaftW / 2,
    tcx + arrowShaftW / 2,
    arrow.shaftTop + (arrow.baseY - arrow.shaftTop) * 0.55,
    "K",
    0,
    false
  );
  drawDimH(ctx, fatoX, fatoX + B, fatoY + B + 8, "B", 0, false);
  drawDimH(ctx, ox, ox + C, oy + C + 10, "C", 0, false);
}

function drawAnswersPanel(ctx, x, y, w, h, answers) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 13px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Jawaban Peserta", x + w / 2, y + 10);

  const rowH = Math.min(22, (h - 40) / TUGAS_LETTERS.length);
  let rowY = y + 34;

  TUGAS_LETTERS.forEach((letter) => {
    const value = answers?.[letter];
    const filled = value !== "" && value != null;

    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(x + 8, rowY + rowH - 2);
    ctx.lineTo(x + w - 8, rowY + rowH - 2);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 12px Arial, Helvetica, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(letter, x + 12, rowY + 4);

    ctx.textAlign = "right";
    ctx.font = filled ? "bold 12px Arial, Helvetica, sans-serif" : "12px Arial, Helvetica, sans-serif";
    ctx.fillStyle = filled ? "#0f172a" : "#94a3b8";
    ctx.fillText(filled ? `${value} m` : "—", x + w - 12, rowY + 4);

    rowY += rowH;
  });
}

export function getSchematicDimensions(includeAnswers = false) {
  const C = LAYOUT.C;
  const diagramW = PAD.left + C + PAD.right;
  const diagramH = PAD.top + C + PAD.bottom;
  const panelW = includeAnswers ? Math.round(150 * SCALE) : 0;
  const gap = includeAnswers ? Math.round(16 * SCALE) : 0;
  return {
    diagramW,
    diagramH,
    totalW: diagramW + gap + panelW,
    totalH: diagramH,
    panelW,
    gap,
  };
}

export function drawTugasSchematic(ctx, options = {}) {
  const { answers = null, offsetX = 0, offsetY = 0 } = options;
  const includeAnswers = answers && TUGAS_LETTERS.some((l) => answers[l] !== "" && answers[l] != null);
  const dims = getSchematicDimensions(includeAnswers);
  const C = LAYOUT.C;
  const A = LAYOUT.A;
  const B = LAYOUT.B;
  const m = px(LAYOUT);

  const ox = PAD.left + offsetX;
  const oy = PAD.top + offsetY;
  const fcx = ox + C / 2;
  const fcy = oy + C / 2;
  const fatoX = ox + A;
  const fatoY = oy + A;
  const tcx = fcx;
  const tcy = fcy;
  const tlofX = tcx - m.D / 2;
  const tlofY = tcy - m.D / 2;
  const circleR = m.circle / 2;

  ctx.fillStyle = COLORS.safety;
  ctx.fillRect(offsetX, offsetY, dims.diagramW, dims.diagramH);

  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(offsetX + 0.75, offsetY + 0.75, dims.diagramW - 1.5, dims.diagramH - 1.5);

  ctx.fillStyle = COLORS.fato;
  ctx.fillRect(fatoX, fatoY, B, B);

  drawDashedRect(ctx, fcx, fcy, B, m.dashSeg, m.dashGap, m.dashW);
  drawOutlineRect(ctx, tcx, tcy, m.D);
  drawOutlineCircle(ctx, tcx, tcy, m.circle);
  drawLetterH(ctx, tcx, tcy, m.hW, m.hH, m.bar);

  const arrowTipY = fatoY + 3;
  const arrow = drawAlignmentArrow(
    ctx,
    tcx,
    tlofY,
    arrowTipY,
    m.arrowHeadH,
    m.arrowHeadH * 1.4,
    m.arrowShaftW
  );

  drawAssignmentLabels(ctx, {
    ox,
    oy,
    C,
    A,
    fatoX,
    fatoY,
    B,
    fcx,
    fcy,
    tcx,
    tcy,
    tlofX,
    tlofY,
    arrow,
    circleR,
    m,
  });

  if (includeAnswers) {
    const panelX = offsetX + dims.diagramW + dims.gap;
    drawAnswersPanel(ctx, panelX, offsetY + PAD.top, dims.panelW, C, answers);
  }

  return dims;
}

export function renderTugasSchematicToCanvas(canvas, answers = null) {
  if (!canvas || typeof document === "undefined") return null;

  const includeAnswers = answers && TUGAS_LETTERS.some((l) => answers[l] !== "" && answers[l] != null);
  const dims = getSchematicDimensions(includeAnswers);
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

  canvas.width = dims.totalW * dpr;
  canvas.height = dims.totalH * dpr;
  canvas.style.width = `${dims.totalW}px`;
  canvas.style.height = `${dims.totalH}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, dims.totalW, dims.totalH);
  drawTugasSchematic(ctx, { answers });
  return canvas.toDataURL("image/png");
}

/** Gambar diagram tugas (+ panel jawaban jika diisi) untuk PDF / export. */
export function renderTugasSchematicPng(answers = null) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  return renderTugasSchematicToCanvas(canvas, answers);
}
