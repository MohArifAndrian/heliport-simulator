"use client";

import dynamic from "next/dynamic";
import RequireMahasiswaSession from "@/components/RequireMahasiswaSession";
import { SIMULATOR_MODE } from "@/lib/simulatorMode";

const HeliportDesigner = dynamic(() => import("@/components/HeliportDesigner"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Memuat simulator…
    </div>
  ),
});

export default function TugasApp() {
  return (
    <RequireMahasiswaSession>
      <HeliportDesigner mode={SIMULATOR_MODE.TUGAS} />
    </RequireMahasiswaSession>
  );
}
