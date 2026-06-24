import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "portal-settings.json");

const DEFAULTS = {
  institutionName: "Politeknik Penerbangan Indonesia",
  portalSubtitle: "Heliport Design Simulator — Penilaian Khusus",
  contactEmail: "admin@heliport.id",
  updatedAt: null,
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getPortalSettings() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePortalSettings(data) {
  await ensureDataDir();
  const next = {
    institutionName: data.institutionName?.trim() || DEFAULTS.institutionName,
    portalSubtitle: data.portalSubtitle?.trim() || DEFAULTS.portalSubtitle,
    contactEmail: data.contactEmail?.trim() || DEFAULTS.contactEmail,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
