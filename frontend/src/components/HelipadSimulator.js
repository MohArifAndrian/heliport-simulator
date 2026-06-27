"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { MathJax } from "better-react-mathjax";
import { jsPDF } from "jspdf";
import HelipadInputPanel from "@/components/HelipadInputPanel";
import LayoutSchematic from "@/components/LayoutSchematic";
import {
  DEFAULT_HELIPAD_CONFIG,
  computeHelipadMetrics,
  fatoDiameter,
} from "@/lib/helipadConfig";

const MathJaxProvider = dynamic(() => import("@/components/MathJaxProvider"), {
  ssr: false,
});

const TABS = [
  { id: "2d", label: "Diagram 2D" },
  { id: "3d", label: "Tampilan 3D" },
  { id: "calc", label: "Perhitungan" },
];

function MetricBox({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-center ring-1 ring-slate-200">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-slate-800">
        {value}
        {unit && <span className="ml-0.5 text-xs font-semibold text-slate-500">{unit}</span>}
      </p>
    </div>
  );
}

function Helipad3DPreview({ config }) {
  const fatoD = fatoDiameter(config);
  const tlofD = Number(config.tlofDiameter) || 9;
  const area = Number(config.totalArea) || 22;

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-b from-sky-50 to-slate-100 p-6">
      <div
        className="relative"
        style={{
          width: `${Math.min(area * 8, 220)}px`,
          height: `${Math.min(area * 8, 220)}px`,
          perspective: "600px",
        }}
      >
        <div
          className="absolute inset-0 rounded-sm bg-slate-500 shadow-lg"
          style={{ transform: "rotateX(58deg) rotateZ(-38deg)", transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400 bg-yellow-300/80"
            style={{ width: `${(fatoD / area) * 100}%`, height: `${(fatoD / area) * 100}%` }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600"
            style={{ width: `${(tlofD / area) * 100}%`, height: `${(tlofD / area) * 100}%` }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-extrabold text-white">
            H
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Pratinjau isometrik sederhana berdasarkan dimensi input.
      </p>
    </div>
  );
}

function HelipadCalcPanel({ config, metrics }) {
  const tlofD = Number(config.tlofDiameter) || 0;
  const ringW = Number(config.ringWidth) || 0;
  const area = Number(config.totalArea) || 0;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-bold text-slate-700">Rumus Perhitungan</h3>
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-600">Diameter Kuning (FATO)</p>
          <MathJax className="mt-1 text-slate-700">{`\\(D_{kuning} = D_{TLOF} + 2 \\times w_{ring} = ${tlofD} + 2 \\times ${ringW} = ${metrics.fatoD}\\,\\text{m}\\)`}</MathJax>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-600">Luas TLOF (lingkar hijau)</p>
          <MathJax className="mt-1 text-slate-700">{`\\(A_{TLOF} = \\pi \\left(\\frac{D_{TLOF}}{2}\\right)^2 = ${metrics.luasTlof}\\,\\text{m}^2\\)`}</MathJax>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-600">Luas Ring Kuning</p>
          <MathJax className="mt-1 text-slate-700">{`\\(A_{ring} = \\pi r_{kuning}^2 - \\pi r_{TLOF}^2 = ${metrics.luasRing}\\,\\text{m}^2\\)`}</MathJax>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-600">Luas Area Total</p>
          <MathJax className="mt-1 text-slate-700">{`\\(A_{area} = ${area}^2 = ${metrics.luasArea}\\,\\text{m}^2\\)`}</MathJax>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-600">Rasio TLOF terhadap Lingkaran Kuning</p>
          <MathJax className="mt-1 text-slate-700">{`\\(\\text{Rasio} = \\frac{A_{TLOF}}{A_{kuning}} \\times 100\\% = ${metrics.rasioTlof}\\%\\)`}</MathJax>
        </div>
      </div>
    </div>
  );
}

function buildHelipadPdf(config, metrics, schematicPng, fullReport = false) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const M = 14;

  pdf.setFontSize(16);
  pdf.setTextColor(31, 78, 156);
  pdf.text(fullReport ? "Laporan Simulasi Helipad" : "Diagram Helipad", M, 20);

  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  let y = 30;

  const rows = [
    ["Total Area", `${config.totalArea} m`],
    ["Diameter TLOF", `${config.tlofDiameter} m`],
    ["Lebar Ring Kuning", `${config.ringWidth} m`],
    ["Diameter Kuning", `${metrics.fatoD} m`],
    ["Luas TLOF", `${metrics.luasTlof} m²`],
    ["Luas Ring Kuning", `${metrics.luasRing} m²`],
    ["Luas Area", `${metrics.luasArea} m²`],
    ["Rasio TLOF", `${metrics.rasioTlof} %`],
  ];

  rows.forEach(([k, v]) => {
    pdf.text(`${k}: ${v}`, M, y);
    y += 6;
  });

  if (schematicPng) {
    const imgW = 170;
    const imgH = 100;
    pdf.addImage(schematicPng, "PNG", M, y + 4, imgW, imgH);
  }

  pdf.save(fullReport ? "laporan-helipad.pdf" : "diagram-helipad.pdf");
}

export default function HelipadSimulator() {
  const [draft, setDraft] = useState(DEFAULT_HELIPAD_CONFIG);
  const [config, setConfig] = useState(DEFAULT_HELIPAD_CONFIG);
  const [tab, setTab] = useState("2d");
  const schematicRef = useRef(null);

  const metrics = useMemo(() => computeHelipadMetrics(config), [config]);

  function onChange(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function onGenerate() {
    setConfig({ ...draft });
  }

  function onReset() {
    setDraft(DEFAULT_HELIPAD_CONFIG);
    setConfig(DEFAULT_HELIPAD_CONFIG);
  }

  async function onDownloadPng() {
    const canvas = schematicRef.current?.getCanvas?.();
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "helipad-diagram.png";
    a.click();
  }

  function onDownloadPdf() {
    const png = schematicRef.current?.captureSnapshot?.();
    buildHelipadPdf(config, metrics, png, false);
  }

  function onDownloadLaporan() {
    const png = schematicRef.current?.captureSnapshot?.();
    buildHelipadPdf(config, metrics, png, true);
  }

  return (
    <MathJaxProvider>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Belajar</p>
          <h1 className="text-2xl font-extrabold text-brand sm:text-3xl">Simulasi Heliport</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Atur dimensi helipad, huruf H, label PPJ, dan kotak angin. Tekan Generate untuk memperbarui diagram.
          </p>
        </div>

        <HelipadInputPanel
          draft={draft}
          onChange={onChange}
          onGenerate={onGenerate}
          onReset={onReset}
          onDownloadPng={onDownloadPng}
          onDownloadPdf={onDownloadPdf}
          onDownloadLaporan={onDownloadLaporan}
        />

        <div className="card overflow-hidden">
          <div className="flex border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold transition ${
                  tab === t.id
                    ? "border-b-2 border-brand bg-white text-brand"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className={tab === "2d" ? "" : "hidden"}>
              <LayoutSchematic ref={schematicRef} config={config} />
            </div>
            {tab === "3d" && <Helipad3DPreview config={config} />}
            {tab === "calc" && <HelipadCalcPanel config={config} metrics={metrics} />}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-3 lg:grid-cols-6">
            <MetricBox label="Diameter Kuning" value={metrics.fatoD} unit="m" />
            <MetricBox label="Luas Area" value={metrics.luasArea} unit="m²" />
            <MetricBox label="Luas TLOF" value={metrics.luasTlof} unit="m²" />
            <MetricBox label="Luas Ring Kuning" value={metrics.luasRing} unit="m²" />
            <MetricBox label="Keliling Kuning" value={metrics.kelilingKuning} unit="m" />
            <MetricBox label="Rasio TLOF" value={metrics.rasioTlof} unit="%" />
          </div>
        </div>
      </div>
    </MathJaxProvider>
  );
}
