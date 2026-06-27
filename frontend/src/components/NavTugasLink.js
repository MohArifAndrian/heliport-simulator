"use client";

import Link from "next/link";
import { useMahasiswa } from "@/lib/session";

const TUGAS_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export default function NavTugasLink({ className }) {
  const { authenticated, loading } = useMahasiswa();

  if (loading || !authenticated) return null;

  return (
    <Link href="/tugas" className={className}>
      {TUGAS_ICON}
      Tugas
    </Link>
  );
}
