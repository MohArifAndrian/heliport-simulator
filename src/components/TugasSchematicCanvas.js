"use client";

import { useEffect, useRef } from "react";

/**
 * Layout tetap (px) — proporsi disesuaikan dengan diagram referensi KP 215.
 * C = total hijau, A = margin, B = pad abu-abu, D = kotak kuning, lingkaran < D (jarak E).
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
  hWidthRatio: 0.40,
  hBarRatio: 0.10,
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
  } = geom;

  const { hH, hW, bar, D, dashSeg, dashGap, dashW, arrowShaftW } = m;

  drawDimV(ctx, oy, fatoY, fcx, "A", 0, "left");
  drawDimH(ctx, ox, fatoX, fcy, "A", 0);
  drawDimH(ctx, fatoX + B, ox + C, fcy, "A", 0);
  drawDimV(ctx, fatoY + B, oy + C, ox + A * 0.45, "A", 0, "left");

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

function drawSchematic(canvas) {
  if (!canvas) return;

  const pad = {
    top: Math.round(32 * SCALE),
    right: Math.round(46 * SCALE),
    bottom: Math.round(58 * SCALE),
    left: Math.round(46 * SCALE),
  };
  const C = LAYOUT.C;
  const A = LAYOUT.A;
  const B = LAYOUT.B;
  const m = px(LAYOUT);

  const W = pad.left + C + pad.right;
  const H = pad.top + C + pad.bottom;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = COLORS.safety;
  ctx.fillRect(0, 0, W, H);

  const ox = pad.left;
  const oy = pad.top;
  const fcx = ox + C / 2;
  const fcy = oy + C / 2;
  const fatoX = ox + A;
  const fatoY = oy + A;
  const tcx = fcx;
  const tcy = fcy;
  const tlofX = tcx - m.D / 2;
  const tlofY = tcy - m.D / 2;
  const circleR = m.circle / 2;

  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, W - 1.5, H - 1.5);

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
}

export default function TugasSchematicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawSchematic(canvasRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => drawSchematic(canvas));
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto block max-w-full"
      aria-label="Diagram tugas helipad dengan label huruf A–O"
    />
  );
}
