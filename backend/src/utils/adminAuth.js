import crypto from "crypto";
import { extractBearerToken } from "./bearer.js";

export { extractBearerToken };

const SECRET = process.env.ADMIN_SESSION_SECRET || "heliport-admin-dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 jam

export function createAdminToken(admin) {
  const payload = JSON.stringify({
    role: "admin",
    id: admin.id,
    email: admin.email,
    nama: admin.nama,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64");
}

export function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64").toString());
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    if (data.role !== "admin") return null;
    return data;
  } catch {
    return null;
  }
}
