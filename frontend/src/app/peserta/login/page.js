"use client";

import { Suspense } from "react";
import PesertaLoginForm from "./PesertaLoginForm";

export default function PesertaLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Memuat…
        </div>
      }
    >
      <PesertaLoginForm />
    </Suspense>
  );
}
