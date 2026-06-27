const SECRET =
  process.env.PESERTA_SESSION_SECRET ||
  process.env.DOSEN_SESSION_SECRET ||
  "heliport-peserta-dev-secret";

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

export async function verifyPesertaSession(token) {
  if (!token) return null;
  try {
    const decoded = atob(token);
    const { payload, sig } = JSON.parse(decoded);
    const expected = await hmacHex(payload);
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
