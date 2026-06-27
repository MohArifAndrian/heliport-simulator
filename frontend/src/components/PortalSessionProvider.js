"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PortalSessionContext = createContext(null);

export function PortalSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dosen/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setSession(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalSessionContext.Provider value={{ session, loading }}>
      {children}
    </PortalSessionContext.Provider>
  );
}

export function usePortalSession() {
  return useContext(PortalSessionContext);
}
