"use client";

import { useEffect, useMemo, useState } from "react";
import { ROLE_LABELS, ROLES } from "@/lib/roles";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function emptyForm() {
    return { email: "", password: "", nama: "", role: ROLES.DOSEN, active: true };
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nama?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      email: user.email,
      password: "",
      nama: user.nama,
      role: user.role,
      active: user.active,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/users/${editing.id}` : "/api/users";
      const body = { ...form };
      if (editing && !body.password) delete body.password;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan pengguna.");
        return;
      }
      setModalOpen(false);
      await load();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Hapus pengguna "${user.nama}"?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      window.alert(data.error || "Gagal menghapus pengguna.");
      return;
    }
    await load();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="portal-page-title">Admin & Role</h2>
          <p className="portal-page-subtitle">
            Kelola akun administrator dan dosen beserta penetapan role.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Tambah Pengguna
        </button>
      </div>

      <div className="card mb-4 p-4">
        <input
          type="search"
          className="field-input"
          placeholder="Cari nama, email, atau role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="card-header-portal flex items-center justify-between">
          <span>DAFTAR ADMIN & ROLE</span>
          <span className="text-xs font-normal opacity-80">{filtered.length} akun</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Memuat data…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Belum ada pengguna.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{user.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={user.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="text-xs font-semibold text-brand hover:underline"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600 hover:underline"
                          onClick={() => handleDelete(user)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-extrabold text-brand">
              {editing ? "Edit" : "Tambah"} Pengguna
            </h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Field label="Nama Lengkap *" value={form.nama} onChange={(v) => setForm((f) => ({ ...f, nama: v }))} />
              <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              <Field
                label={editing ? "Kata Sandi Baru (kosongkan jika tidak diubah)" : "Kata Sandi *"}
                type="password"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              />
              <div>
                <label className="field-label">Role *</label>
                <select
                  className="field-input"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value={ROLES.DOSEN}>{ROLE_LABELS.dosen}</option>
                  <option value={ROLES.ADMIN}>{ROLE_LABELS.admin}</option>
                </select>
              </div>
              {editing && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  />
                  Akun aktif
                </label>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button type="button" className="btn-primary disabled:opacity-60" disabled={saving} onClick={handleSave}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="field-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === ROLES.ADMIN;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
        isAdmin ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"
      }`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}
