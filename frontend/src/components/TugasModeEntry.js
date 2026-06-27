"use client";

import { useRouter } from "next/navigation";
import { useMahasiswa } from "@/lib/session";

export default function TugasModeEntry({ className, children }) {
  const router = useRouter();
  const { authenticated, loading } = useMahasiswa();

  if (loading || !authenticated) return null;

  return (
    <button type="button" className={className} onClick={() => router.push("/tugas")}>
      {children}
    </button>
  );
}
