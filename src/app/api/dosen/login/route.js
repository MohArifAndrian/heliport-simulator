import { cookies } from "next/headers";
import {
  getDosenCredentials,
  createSessionToken,
  DOSEN_COOKIE,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/dosenAuth";

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;
  const creds = getDosenCredentials();

  if (email !== creds.email || password !== creds.password) {
    return Response.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const token = createSessionToken();
  cookies().set(DOSEN_COOKIE, token, sessionCookieOptions());

  return Response.json({ ok: true, nama: creds.nama });
}
