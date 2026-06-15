"use client";

function ConfigField({ label, unit, value, onChange, type = "number" }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          type={type}
          className={`field-input text-sm ${unit ? "pr-10" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ConfigSection({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function HelipadInputPanel({
  draft,
  onChange,
  onGenerate,
  onReset,
  onDownloadPng,
  onDownloadPdf,
  onDownloadLaporan,
}) {
  const set = (key, raw) => {
    const numericKeys = new Set([
      "totalArea",
      "tlofDiameter",
      "ringWidth",
      "hWidth",
      "hHeight",
      "hStroke",
      "ppjOffsetX",
      "ppjOffsetY",
      "boxWidth",
      "boxHeight",
    ]);
    const value = numericKeys.has(key) && raw !== "" ? Number(raw) : raw;
    onChange(key, value);
  };

  return (
    <div className="card p-5">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ConfigSection title="Ukuran Helipad">
          <ConfigField label="Total Area" unit="m" value={draft.totalArea} onChange={(v) => set("totalArea", v)} />
          <ConfigField
            label="Diameter TLOF (Lingkar Hijau)"
            unit="m"
            value={draft.tlofDiameter}
            onChange={(v) => set("tlofDiameter", v)}
          />
          <ConfigField
            label="Lebar Ring Kuning"
            unit="m"
            value={draft.ringWidth}
            onChange={(v) => set("ringWidth", v)}
          />
        </ConfigSection>

        <ConfigSection title="Huruf H">
          <ConfigField label="Lebar H" unit="m" value={draft.hWidth} onChange={(v) => set("hWidth", v)} />
          <ConfigField label="Tinggi H" unit="m" value={draft.hHeight} onChange={(v) => set("hHeight", v)} />
          <ConfigField label="Lebar Garis H" unit="m" value={draft.hStroke} onChange={(v) => set("hStroke", v)} />
        </ConfigSection>

        <ConfigSection title="Huruf PPJ">
          <ConfigField label="Teks PPJ" value={draft.ppjText} onChange={(v) => set("ppjText", v)} type="text" />
          <ConfigField label="Offset X PPJ" unit="m" value={draft.ppjOffsetX} onChange={(v) => set("ppjOffsetX", v)} />
          <ConfigField label="Offset Y PPJ" unit="m" value={draft.ppjOffsetY} onChange={(v) => set("ppjOffsetY", v)} />
        </ConfigSection>

        <ConfigSection title="Kotak Merah Angka">
          <ConfigField label="Lebar Kotak" unit="m" value={draft.boxWidth} onChange={(v) => set("boxWidth", v)} />
          <ConfigField label="Tinggi Kotak" unit="m" value={draft.boxHeight} onChange={(v) => set("boxHeight", v)} />
          <ConfigField label="Angka Atas" value={draft.angkaAtas} onChange={(v) => set("angkaAtas", v)} type="text" />
          <ConfigField label="Angka Bawah" value={draft.angkaBawah} onChange={(v) => set("angkaBawah", v)} type="text" />
        </ConfigSection>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onGenerate} className="btn-primary">
          Generate
        </button>
        <button type="button" onClick={onDownloadPng} className="btn-success">
          Download PNG
        </button>
        <button type="button" onClick={onDownloadPdf} className="btn-danger">
          Download PDF
        </button>
        <button type="button" onClick={onDownloadLaporan} className="btn-dark">
          Download Laporan
        </button>
        <button type="button" onClick={onReset} className="btn-outline">
          Reset
        </button>
      </div>
    </div>
  );
}
