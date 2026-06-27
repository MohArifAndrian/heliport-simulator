import crypto from "crypto";
import { PESERTA_COOKIE } from "./pesertaConstants";

export { PESERTA_COOKIE };

const SECRET =
  process.env.PESERTA_SESSION_SECRET ||
  process.env.DOSEN_SESSION_SECRET ||
  "heliport-peserta-dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function createPesertaToken(peserta) {
  const payload = JSON.stringify({
    role: "peserta",
    pesertaId: peserta.id,
    registryType: peserta.registryType,
    nama: peserta.nama,
    email: peserta.email || "",
    status: peserta.status,
    nim: peserta.nim || "",
    nip: peserta.nip || "",
    prodi: peserta.prodi || "",
    kelas: peserta.kelas || "",
    institusi: peserta.institusi || "",
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64");
}

export function verifyPesertaToken(token) {
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

export function toPesertaProfile(session) {
  if (!session) return null;
  return {
    id: session.pesertaId,
    registryType: session.registryType,
    nama: session.nama,
    email: session.email || "",
    status: session.status,
    nim: session.nim || "",
    nip: session.nip || "",
    prodi: session.prodi || "",
    kelas: session.kelas || "",
    institusi: session.institusi || "",
  };
}
