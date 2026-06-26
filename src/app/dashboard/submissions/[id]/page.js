"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SubmissionDetailView from "@/components/SubmissionDetailView";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const subRes = await fetch(`/api/submissions/${id}`);
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

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Memuat detail…</div>;
  }

  if (error) {
    return <div className="card p-8 text-center text-sm text-red-600">{error}</div>;
  }

  return <SubmissionDetailView data={submission} />;
}
