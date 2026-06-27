"use client";

import { useCallback, useEffect, useState } from "react";

export function isMahasiswaComplete(data) {
  return Boolean(data?.nama?.trim());
}

export function isPesertaAuthenticated(data) {
  return isMahasiswaComplete(data);
}

export function useMahasiswa() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/peserta/session");
      if (res.ok) {
        const json = await res.json();
        setData(json.authenticated ? json.peserta : null);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("peserta-changed", sync);
    return () => window.removeEventListener("peserta-changed", sync);
  }, [refresh]);

  const clear = useCallback(async () => {
    await fetch("/api/peserta/logout", { method: "POST" });
    setData(null);
    window.dispatchEvent(new Event("peserta-changed"));
  }, []);

  return {
    mahasiswa: data,
    peserta: data,
    loading,
    clear,
    refresh,
    authenticated: isPesertaAuthenticated(data),
  };
}

export function usePeserta() {
  return useMahasiswa();
}
