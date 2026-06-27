import crypto from "crypto";

const SECRET = process.env.SISWA_SESSION_SECRET || "heliport-siswa-dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 jam

export function createSiswaToken(siswa) {
  const payload = JSON.stringify({
    role: "siswa",
    id: siswa.id,
    email: siswa.email,
    nama: siswa.nama,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64");
}

export function verifySiswaToken(token) {
  if (!token) return null;
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64").toString());
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    if (data.role !== "siswa") return null;
    return data;
  } catch {
    return null;
  }
}
