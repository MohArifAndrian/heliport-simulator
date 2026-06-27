"use client";

import { useCallback, useEffect, useState } from "react";
import TugasSchematicCanvas from "@/components/TugasSchematicCanvas";
import {
  TUGAS_LETTERS,
  TUGAS_LETTER_DEFS,
  emptyTugasAnswers,
} from "@/lib/tugasDimensions";

const STORAGE_KEY = "heliport.tugasAnswers";

function loadAnswers() {
  if (typeof window === "undefined") return emptyTugasAnswers();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyTugasAnswers(), ...JSON.parse(raw) } : emptyTugasAnswers();
  } catch {
    return emptyTugasAnswers();
  }
}

function saveAnswers(answers) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  window.dispatchEvent(new Event("tugas-answers-changed"));
}

export function getTugasAnswers() {
  return loadAnswers();
}

export default function TugasAssignmentPanel({ spec, onAnswersChange }) {
  const [answers, setAnswers] = useState(emptyTugasAnswers);

  useEffect(() => {
    const initial = loadAnswers();
    setAnswers(initial);
    onAnswersChange?.(initial);
  }, [onAnswersChange]);

  const update = useCallback(
    (letter, value) => {
      setAnswers((prev) => {
        const next = { ...prev, [letter]: value };
        saveAnswers(next);
        onAnswersChange?.(next);
        return next;
      });
    },
    [onAnswersChange]
  );

  return (
    <div className="card overflow-hidden">
      <div className="card-header bg-amber-600">MODE TUGAS — TENTUKAN DIMENSI (A–O)</div>
      <div className="p-4">
        <p className="mb-4 text-xs text-amber-900">
          <b>Tiap ukuran yang diminta dibuat huruf saja. Nanti mahasiswa yang isi.</b>
        </p>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
          <div className="min-w-0">
            <div className="flex justify-center overflow-x-auto rounded-lg border border-[#3d5a25] bg-[#3d5a25] p-4">
              <TugasSchematicCanvas />
            </div>
            <div className="mt-3 rounded border border-red-300 bg-white px-4 py-3 text-[11px] leading-relaxed text-slate-700">
              <p>
                <b className="text-red-700">Catatan:</b>
              </p>
              <p className="mt-1">
                Semua dimensi mengikuti ketentuan KP 215 Tahun 2019. Tentukan nilai setiap huruf
                (A–O) sesuai ketentuan, lalu isikan pada tabel di samping.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-300 bg-white px-4 py-3">
            <p className="mb-4 text-center text-sm font-bold text-slate-800">Tentukan</p>
            <div className="space-y-0">
              {TUGAS_LETTERS.map((letter) => (
                <div
                  key={letter}
                  className="flex items-baseline gap-3 border-b border-dotted border-slate-300 py-2 last:border-b-0"
                >
                  <span className="w-4 shrink-0 text-sm font-bold text-slate-900">{letter}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="min-w-0 flex-1 border-0 border-b border-dotted border-slate-400 bg-transparent px-0 py-0 text-sm outline-none focus:border-red-400"
                    value={answers[letter]}
                    onChange={(e) => update(letter, e.target.value)}
                    aria-label={`Nilai dimensi ${letter}: ${TUGAS_LETTER_DEFS[letter].label}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
