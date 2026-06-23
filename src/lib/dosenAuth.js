import crypto from "crypto";

const SECRET = process.env.DOSEN_SESSION_SECRET || "heliport-dosen-dev-secret";
export const DOSEN_COOKIE = "dosen_session";
const SESSION_MAX_AGE = 60 * 60 * 24;

export function getDosenCredentials() {
  return {
    email: process.env.DOSEN_EMAIL || "dosen@heliport.id",
    password: process.env.DOSEN_PASSWORD || "dosen123",
    nama: process.env.DOSEN_NAMA || "Dosen Pengampu",
  };
}

export function createSessionToken() {
  const payload = JSON.stringify({
    role: "dosen",
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64");
}

export function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64").toString());
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}
