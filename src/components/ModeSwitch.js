"use client";

import { SIMULATOR_MODE } from "@/lib/simulatorMode";

export default function ModeSwitch({ mode, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Mode Simulator
      </span>
      <div
        className="inline-flex rounded-lg bg-slate-200/80 p-1 ring-1 ring-slate-200"
        role="group"
        aria-label="Pilih mode simulator"
      >
        <ModeButton
          active={mode === SIMULATOR_MODE.LATIHAN}
          onClick={() => onChange(SIMULATOR_MODE.LATIHAN)}
          label="Mode Latihan"
          hint="Dimensi minimum & cek hasil tampil langsung"
        />
        <ModeButton
          active={mode === SIMULATOR_MODE.TUGAS}
          onClick={() => onChange(SIMULATOR_MODE.TUGAS)}
          label="Mode Tugas"
          hint="Dimensi & cek hasil hanya di PDF submit"
        />
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, label, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={[
        "rounded-md px-4 py-1.5 text-xs font-bold transition",
        active
          ? "bg-white text-brand shadow-sm ring-1 ring-slate-200"
          : "text-slate-600 hover:text-slate-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
