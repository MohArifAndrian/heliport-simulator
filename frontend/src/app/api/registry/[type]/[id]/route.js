import { getRegistryConfig, isValidRegistryType } from "@/lib/registryConfig";
import {
  getRegistryItemById,
  updateRegistryItem,
  deleteRegistryItem,
} from "@/lib/registryStorage";
import { requireDosen } from "@/lib/requireDosen";

function pickFields(body, config) {
  const data = {};
  for (const field of config.fields) {
    const value = body[field.key];
    data[field.key] = typeof value === "string" ? value.trim() : value ?? "";
  }
  return data;
}

function validateRequired(data, config) {
  for (const field of config.fields) {
    if (field.required && !String(data[field.key] ?? "").trim()) {
      return `${field.label} wajib diisi.`;
    }
  }
  return null;
}

export async function GET(_request, { params }) {
  if (!requireDosen()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidRegistryType(params.type)) {
    return Response.json({ error: "Jenis data tidak dikenal." }, { status: 404 });
  }

  const item = await getRegistryItemById(params.type, params.id);
  if (!item) {
    return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ item });
}

export async function PUT(request, { params }) {
  if (!requireDosen()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getRegistryConfig(params.type);
  if (!config) {
    return Response.json({ error: "Jenis data tidak dikenal." }, { status: 404 });
  }

  const body = await request.json();
  const data = pickFields(body, config);
  const error = validateRequired(data, config);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const item = await updateRegistryItem(params.type, params.id, data);
  if (!item) {
    return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ ok: true, item });
}

export async function DELETE(_request, { params }) {
  if (!requireDosen()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isValidRegistryType(params.type)) {
    return Response.json({ error: "Jenis data tidak dikenal." }, { status: 404 });
  }

  const ok = await deleteRegistryItem(params.type, params.id);
  if (!ok) {
    return Response.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
