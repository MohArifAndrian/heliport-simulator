import { cookies } from "next/headers";
import { createPesertaToken, PESERTA_COOKIE, sessionCookieOptions, toPesertaProfile } from "@/lib/pesertaAuth";
import { authenticatePeserta } from "@/lib/pesertaStorage";

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || body.loginId || "").trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return Response.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
  }

  const peserta = await authenticatePeserta(email, password);
  if (!peserta) {
    return Response.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const token = createPesertaToken(peserta);
  cookies().set(PESERTA_COOKIE, token, sessionCookieOptions());

  return Response.json({ ok: true, peserta });
}
