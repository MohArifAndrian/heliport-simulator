"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { fatoDiameter, dimsToHelipadConfig } from "@/lib/helipadConfig";

const COLORS = {
  frame: "#c8c8c8",
  area: "#5a5a5a",
  yellow: "#f0c931",
  green: "#2d8a4e",
  white: "#ffffff",
  red: "#d8161f",
  dim: "#1a1a1a",
};

function fmtDim(n) {
  return Number(n).toFixed(2).replace(".", ",");
}

function drawArrowHead(ctx, x, y, dir) {
  const s = 4;
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

function drawDimH(ctx, x1, x2, y, label, offsetY) {
  ctx.strokeStyle = COLORS.dim;
  ctx.fillStyle = COLORS.dim;
  ctx.lineWidth = 1;
  ctx.font = "11px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const yLine = y + offsetY;
  ctx.beginPath();
  ctx.moveTo(x1, yLine);
  ctx.lineTo(x2, yLine);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x1, yLine - 5);
  ctx.lineTo(x1, yLine + 5);
  ctx.moveTo(x2, yLine - 5);
  ctx.lineTo(x2, yLine + 5);
  ctx.stroke();

  drawArrowHead(ctx, x1, yLine, "left");
  drawArrowHead(ctx, x2, yLine, "right");

  ctx.fillText(label, (x1 + x2) / 2, yLine - 12);
}

function drawDimV(ctx, y1, y2, x, label, offsetX) {
  ctx.strokeStyle = COLORS.dim;
  ctx.fillStyle = COLORS.dim;
  ctx.lineWidth = 1;
  ctx.font = "11px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const xLine = x + offsetX;
  ctx.beginPath();
  ctx.moveTo(xLine, y1);
  ctx.lineTo(xLine, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(xLine - 5, y1);
  ctx.lineTo(xLine + 5, y1);
  ctx.moveTo(xLine - 5, y2);
  ctx.lineTo(xLine + 5, y2);
  ctx.stroke();

  drawArrowHead(ctx, xLine, y1, "up");
  drawArrowHead(ctx, xLine, y2, "down");

  ctx.save();
  ctx.translate(xLine + 14, (y1 + y2) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawLetterH(ctx, cx, cy, wM, hM, strokeM, pxPerM) {
  const w = wM * pxPerM;
  const h = hM * pxPerM;
  const t = Math.max(strokeM * pxPerM, 2);
  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x, y, t, h);
  ctx.fillRect(x + w - t, y, t, h);
  ctx.fillRect(x, y + (h - t) / 2, w, t);
}

function drawSchematic(canvas, config) {
  if (!canvas || !config) return;

  const areaM = Number(config.totalArea) || 22;
  const tlofD = Number(config.tlofDiameter) || 9;
  const fatoD = fatoDiameter(config);
  const hH = Number(config.hHeight) || 3;
  const hW = Number(config.hWidth) || 1.8;
  const hStroke = Number(config.hStroke) || 0.6;
  const boxW = Number(config.boxWidth) || 2.67;
  const boxH = Number(config.boxHeight) || 3.67;

  const pad = { top: 52, right: 58, bottom: 36, left: 58 };
  const framePad = 6;
  const pxPerM = Math.min(280 / areaM, 16);
  const areaPx = areaM * pxPerM;
  const framePx = framePad * 2;

  const W = pad.left + areaPx + framePx + pad.right;
  const H = pad.top + areaPx + framePx + pad.bottom;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const areaX = pad.left + framePad;
  const areaY = pad.top + framePad;
  const cx = areaX + areaPx / 2;
  const cy = areaY + areaPx / 2;

  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(areaX - framePad, areaY - framePad, areaPx + framePx, areaPx + framePx);

  ctx.fillStyle = COLORS.area;
  ctx.fillRect(areaX, areaY, areaPx, areaPx);

  const ppjX = cx + (Number(config.ppjOffsetX) || 0) * pxPerM;
  const ppjY = cy + (Number(config.ppjOffsetY) || 0) * pxPerM;
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${Math.round(areaPx * 0.11)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(config.ppjText || "PPJ", ppjX, ppjY);

  const rFato = (fatoD / 2) * pxPerM;
  const rTlof = (tlofD / 2) * pxPerM;

  ctx.beginPath();
  ctx.arc(cx, cy, rFato, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.yellow;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, rTlof, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.green;
  ctx.fill();

  drawLetterH(ctx, cx, cy, hW, hH, hStroke, pxPerM);

  const boxPxW = boxW * pxPerM;
  const boxPxH = boxH * pxPerM;
  const boxX = areaX + 0.55 * pxPerM;
  const boxY = areaY + areaPx - boxPxH - 0.55 * pxPerM;
  const halfH = boxPxH / 2;

  ctx.fillStyle = COLORS.white;
  ctx.fillRect(boxX, boxY, boxPxW, halfH);
  ctx.fillRect(boxX, boxY + halfH, boxPxW, halfH);

  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxPxW, halfH);
  ctx.strokeRect(boxX, boxY + halfH, boxPxW, halfH);

  ctx.fillStyle = COLORS.dim;
  ctx.font = `bold ${Math.round(halfH * 0.42)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(config.angkaAtas || "", boxX + boxPxW / 2, boxY + halfH / 2);
  ctx.fillText(config.angkaBawah || "", boxX + boxPxW / 2, boxY + halfH + halfH / 2);

  drawDimH(ctx, areaX, areaX + areaPx, areaY - framePad - 6, `${fmtDim(areaM)} m (Lebar Area)`, -10);
  drawDimV(ctx, areaY, areaY + areaPx, areaX + areaPx + framePad + 6, `${fmtDim(areaM)} m (Tinggi Area)`, 10);

  const yTop = areaY - 2;
  drawDimH(ctx, cx - rFato, cx + rFato, yTop, `${fmtDim(fatoD)} m (Diameter Kuning)`, -28);
  drawDimH(ctx, cx - rTlof, cx + rTlof, yTop, `${fmtDim(tlofD)} m (Diameter Hijau)`, -46);

  const hPx = hH * pxPerM;
  const wPx = hW * pxPerM;
  drawDimV(ctx, cy - hPx / 2, cy + hPx / 2, cx + rTlof + 8, `${fmtDim(hH)} m (Tinggi H)`, 14);
  drawDimH(ctx, cx - wPx / 2, cx + wPx / 2, cy + rTlof + 10, `${fmtDim(hW)} m (Lebar H)`, 12);

  drawDimH(ctx, boxX, boxX + boxPxW, boxY + boxPxH + 6, `${fmtDim(boxW)} m (Lebar Kotak)`, 10);
  drawDimV(ctx, boxY, boxY + boxPxH, boxX - 6, `${fmtDim(boxH)} m (Tinggi Kotak)`, -10);
}

/** Technical 2D top-down layout schematic with dimension labels. */
const LayoutSchematic = forwardRef(function LayoutSchematic({ config, dims, lokasi }, ref) {
  const canvasRef = useRef(null);

  const resolvedConfig = useMemo(
    () => config ?? (dims ? dimsToHelipadConfig(dims, lokasi) : null),
    [config, dims, lokasi]
  );

  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      try {
        return canvasRef.current?.toDataURL("image/png") ?? null;
      } catch {
        return null;
      }
    },
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    drawSchematic(canvasRef.current, resolvedConfig);
  }, [resolvedConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      drawSchematic(canvas, resolvedConfig);
    });
    ro.observe(canvas.parentElement ?? canvas);
    return () => ro.disconnect();
  }, [resolvedConfig]);

  return (
    <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
      <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" aria-label="Skema layout heliport 2D" />
    </div>
  );
});

export default LayoutSchematic;
