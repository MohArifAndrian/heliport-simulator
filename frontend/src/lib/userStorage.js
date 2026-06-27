import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { ROLES, isValidRole } from "./roles";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SECRET = process.env.DOSEN_SESSION_SECRET || "heliport-dosen-dev-secret";

function hashPassword(password) {
  return crypto.createHash("sha256").update(`${SECRET}:${password}`).digest("hex");
}

export { hashPassword };

function defaultUsers() {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      email: process.env.ADMIN_EMAIL || "admin@heliport.id",
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "admin123"),
      nama: process.env.ADMIN_NAMA || "Administrator",
      role: ROLES.ADMIN,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      email: process.env.DOSEN_EMAIL || "dosen@heliport.id",
      passwordHash: hashPassword(process.env.DOSEN_PASSWORD || "dosen123"),
      nama: process.env.DOSEN_NAMA || "Dosen Pengampu",
      role: ROLES.DOSEN,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function ensureUsersFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers(), null, 2), "utf-8");
  }
}

async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function verifyPassword(password, passwordHash) {
  return hashPassword(password) === passwordHash;
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function getAllUsers() {
  const users = await readUsers();
  return users
    .map(sanitizeUser)
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

export async function getUserById(id) {
  const users = await readUsers();
  return sanitizeUser(users.find((u) => u.id === id) ?? null);
}

export async function getUserByEmail(email) {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return sanitizeUser(user);
}

export async function addUser({ email, password, nama, role }) {
  if (!isValidRole(role)) throw new Error("Role tidak valid.");
  const users = await readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email sudah terdaftar.");
  }
  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    nama: nama.trim(),
    role,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  await writeUsers(users);
  return sanitizeUser(user);
}

export async function updateUser(id, { email, password, nama, role, active }) {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  if (email && users.some((u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email sudah terdaftar.");
  }

  const current = users[index];
  const updated = {
    ...current,
    email: email?.trim().toLowerCase() ?? current.email,
    nama: nama?.trim() ?? current.nama,
    role: role && isValidRole(role) ? role : current.role,
    active: typeof active === "boolean" ? active : current.active,
    passwordHash: password ? hashPassword(password) : current.passwordHash,
    updatedAt: new Date().toISOString(),
  };
  users[index] = updated;
  await writeUsers(users);
  return sanitizeUser(updated);
}

export async function deleteUser(id) {
  const users = await readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return false;

  const admins = users.filter((u) => u.role === ROLES.ADMIN && u.active);
  if (user.role === ROLES.ADMIN && admins.length <= 1) {
    throw new Error("Tidak dapat menghapus admin terakhir.");
  }

  const next = users.filter((u) => u.id !== id);
  await writeUsers(next);
  return true;
}
