"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DosenHeader from "@/components/DosenHeader";
import SubmissionDetailView from "@/components/SubmissionDetailView";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dosenNama, setDosenNama] = useState("Dosen");

  useEffect(() => {
    async function load() {
      try {
        const [sessRes, subRes] = await Promise.all([
          fetch("/api/dosen/session"),
          fetch(`/api/submissions/${id}`),
        ]);
        if (sessRes.ok) {
          const sess = await sessRes.json();
          setDosenNama(sess.nama || "Dosen");
        }
        if (!subRes.ok) {
          setError("Data tidak ditemukan.");
          return;
        }
        const data = await subRes.json();
        setSubmission(data.submission);
      } catch {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <DosenHeader nama={dosenNama} />
      <main className="mx-auto max-w-[1400px] px-4 py-8">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Memuat detail…</div>
        ) : error ? (
          <div className="card p-8 text-center text-sm text-red-600">{error}</div>
        ) : (
          <SubmissionDetailView data={submission} />
        )}
      </main>
    </div>
  );
}
