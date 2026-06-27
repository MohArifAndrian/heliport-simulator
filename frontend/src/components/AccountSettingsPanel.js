"use client";

import { usePortalSession } from "@/components/PortalSessionProvider";
import { ROLE_LABELS } from "@/lib/roles";

export default function AccountSettingsPanel() {
  const { session, loading } = usePortalSession();

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Memuat…</div>;
  }

  if (!session?.authenticated) {
    return <div className="card p-8 text-center text-sm text-red-600">Sesi tidak valid.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="portal-page-title">Pengaturan Akun</h2>
        <p className="portal-page-subtitle">Informasi akun Anda yang sedang login.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header-portal">PROFIL PENGGUNA</div>
        <div className="divide-y divide-slate-100 p-4">
          <InfoRow label="Nama" value={session.nama} />
          <InfoRow label="Email" value={session.email} />
          <InfoRow label="Role" value={session.roleLabel || ROLE_LABELS[session.role]} />
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Untuk mengubah kata sandi atau role, hubungi administrator sistem.
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}
