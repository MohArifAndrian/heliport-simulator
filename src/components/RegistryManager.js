"use client";

import { useEffect, useMemo, useState } from "react";
import { getRegistryConfig } from "@/lib/registryConfig";

export default function RegistryManager({ type }) {
  const config = getRegistryConfig(type);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/registry/${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      config.searchKeys.some((key) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [items, search, config.searchKeys]);

  function emptyForm() {
    const next = {};
    config.fields.forEach((field) => {
      next[field.key] = "";
    });
    return next;
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    const next = emptyForm();
    config.fields.forEach((field) => {
      next[field.key] = item[field.key] ?? "";
    });
    setForm(next);
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = editing
        ? `/api/registry/${type}/${editing.id}`
        : `/api/registry/${type}`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data.");
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

  async function handleDelete(item) {
    if (!window.confirm(`Hapus data "${item.nama}"?`)) return;
    const res = await fetch(`/api/registry/${type}/${item.id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  const fieldLabel = (key) => config.fields.find((f) => f.key === key)?.label ?? key;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="portal-page-title">{config.label}</h2>
          <p className="portal-page-subtitle">{config.description}</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Tambah Data
        </button>
      </div>

      <div className="card mb-4 p-4">
        <input
          type="search"
          className="field-input"
          placeholder="Cari data…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="card-header-portal flex items-center justify-between">
          <span>{config.label.toUpperCase()}</span>
          <span className="text-xs font-normal opacity-80">{filtered.length} entri</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Memuat data…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">Belum ada data tersimpan.</p>
            <button type="button" className="btn-ghost mt-4" onClick={openCreate}>
              Tambah data pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  {config.tableColumns.map((col) => (
                    <th key={col} className="px-4 py-3">
                      {fieldLabel(col)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    {config.tableColumns.map((col) => (
                      <td key={col} className="px-4 py-3 text-slate-700">
                        {item[col] || "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="text-xs font-semibold text-brand hover:underline"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600 hover:underline"
                          onClick={() => handleDelete(item)}
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-brand">
                {editing ? "Edit" : "Tambah"} {config.label}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {config.fields.map((field) => (
                <div key={field.key}>
                  <label className="field-label">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                  {field.textarea ? (
                    <textarea
                      className="field-input min-h-[80px] resize-y"
                      value={form[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      className="field-input"
                      value={form[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button
                type="button"
                className="btn-primary disabled:opacity-60"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
