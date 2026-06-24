import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getRegistryConfig } from "./registryConfig";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(type) {
  const config = getRegistryConfig(type);
  if (!config) throw new Error("Jenis data tidak dikenal.");
  return path.join(DATA_DIR, config.file);
}

async function readList(type) {
  await ensureDataDir();
  const filePath = filePathFor(type);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeList(type, list) {
  await ensureDataDir();
  await fs.writeFile(filePathFor(type), JSON.stringify(list, null, 2), "utf-8");
}

export async function getAllRegistryItems(type) {
  const list = await readList(type);
  return list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export async function getRegistryItemById(type, id) {
  const list = await readList(type);
  return list.find((item) => item.id === id) ?? null;
}

export async function addRegistryItem(type, data) {
  const list = await readList(type);
  const now = new Date().toISOString();
  const item = {
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(item);
  await writeList(type, list);
  return item;
}

export async function updateRegistryItem(type, id, data) {
  const list = await readList(type);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = {
    ...list[index],
    ...data,
    id: list[index].id,
    createdAt: list[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  list[index] = updated;
  await writeList(type, list);
  return updated;
}

export async function deleteRegistryItem(type, id) {
  const list = await readList(type);
  const next = list.filter((item) => item.id !== id);
  if (next.length === list.length) return false;
  await writeList(type, next);
  return true;
}
