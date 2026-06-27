import crypto from "crypto";

const SECRET = process.env.PENGAJAR_SESSION_SECRET || "heliport-pengajar-dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 jam

export function createPengajarToken(pengajar) {
  const payload = JSON.stringify({
    role: "pengajar",
    id: pengajar.id,
    email: pengajar.email,
    nama: pengajar.namaLengkap,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64");
}

export function verifyPengajarToken(token) {
  if (!token) return null;
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64").toString());
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    if (data.role !== "pengajar") return null;
    return data;
  } catch {
    return null;
  }
}
