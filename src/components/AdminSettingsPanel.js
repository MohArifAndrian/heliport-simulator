"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { permissionMatrix, ROLE_DESCRIPTIONS } from "@/lib/rolePermissions";

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState({
    institutionName: "",
    portalSubtitle: "",
    contactEmail: "",
  });
  const [userStats, setUserStats] = useState({ admin: 0, dosen: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/users"),
      ]);
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          institutionName: data.settings?.institutionName || "",
          portalSubtitle: data.settings?.portalSubtitle || "",
          contactEmail: data.settings?.contactEmail || "",
        });
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        const users = data.users || [];
        setUserStats({
          admin: users.filter((u) => u.role === ROLES.ADMIN && u.active).length,
          dosen: users.filter((u) => u.role === ROLES.DOSEN && u.active).length,
          total: users.filter((u) => u.active).length,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan pengaturan.");
        return;
      }
      setSuccess("Pengaturan berhasil disimpan.");
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  const matrix = permissionMatrix();

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Memuat pengaturan…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="portal-page-title">Pengaturan Sistem</h2>
        <p className="portal-page-subtitle">
          Konfigurasi portal, hak akses role, dan informasi institusi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Pengguna Aktif" value={userStats.total} />
        <StatCard label="Administrator" value={userStats.admin} accent />
        <StatCard label="Dosen" value={userStats.dosen} />
      </div>

      <form onSubmit={handleSave} className="card overflow-hidden">
        <div className="card-header-portal">INFORMASI PORTAL</div>
        <div className="space-y-4 p-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-100">
              {success}
            </div>
          )}
          <Field
            label="Nama Institusi"
            value={settings.institutionName}
            onChange={(v) => setSettings((s) => ({ ...s, institutionName: v }))}
          />
          <Field
            label="Subjudul Portal"
            value={settings.portalSubtitle}
            onChange={(v) => setSettings((s) => ({ ...s, portalSubtitle: v }))}
          />
          <Field
            label="Email Kontak Admin"
            type="email"
            value={settings.contactEmail}
            onChange={(v) => setSettings((s) => ({ ...s, contactEmail: v }))}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-accent disabled:opacity-60" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan Pengaturan"}
            </button>
          </div>
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="card-header-portal flex items-center justify-between">
          <span>PERAN & HAK AKSES</span>
          <Link href="/dosen/admin/users" className="text-xs font-normal text-accent hover:underline">
            Kelola Admin & Role →
          </Link>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
            <div key={role} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <RoleBadge role={role} />
                <span className="text-sm font-bold text-brand-dark">{ROLE_LABELS[role]}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto border-t border-slate-100 p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 pr-4">Fitur</th>
                <th className="pb-2 pr-4 text-center">Admin</th>
                <th className="pb-2 text-center">Dosen</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="py-2.5 pr-4">
                    <p className="font-semibold text-slate-800">{row.label}</p>
                    <p className="text-slate-500">{row.description}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    <AccessIcon allowed={row.access.admin} />
                  </td>
                  <td className="py-2.5 text-center">
                    <AccessIcon allowed={row.access.dosen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-brand-dark">Manajemen Admin & Role</h3>
            <p className="text-sm text-slate-600">
              Tambah, edit, atau hapus akun admin dan dosen beserta role-nya.
            </p>
          </div>
          <Link href="/dosen/admin/users" className="btn-primary">
            Buka Admin & Role
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`portal-stat-card ${accent ? "border-accent" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="portal-stat-value">{value}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === ROLES.ADMIN;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
        isAdmin ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"
      }`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function AccessIcon({ allowed }) {
  return allowed ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      ✓
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      —
    </span>
  );
}
