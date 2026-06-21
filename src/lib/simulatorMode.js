"use client";

import { useCallback, useEffect, useState } from "react";

export const SIMULATOR_MODE = {
  LATIHAN: "latihan",
  TUGAS: "tugas",
};

const KEY = "heliport.simulatorMode";
const DEFAULT = SIMULATOR_MODE.LATIHAN;

export function getSimulatorMode() {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw === SIMULATOR_MODE.TUGAS ? SIMULATOR_MODE.TUGAS : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function setSimulatorMode(mode) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, mode);
  window.dispatchEvent(new Event("simulator-mode-changed"));
}

export function useSimulatorMode() {
  const [mode, setModeState] = useState(DEFAULT);

  useEffect(() => {
    setModeState(getSimulatorMode());
    const sync = () => setModeState(getSimulatorMode());
    window.addEventListener("simulator-mode-changed", sync);
    return () => window.removeEventListener("simulator-mode-changed", sync);
  }, []);

  const setMode = useCallback((next) => {
    setSimulatorMode(next);
    setModeState(next);
  }, []);

  return {
    mode,
    setMode,
    isTugasMode: mode === SIMULATOR_MODE.TUGAS,
    isLatihanMode: mode === SIMULATOR_MODE.LATIHAN,
  };
}
