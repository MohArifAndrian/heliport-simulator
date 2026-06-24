import { cookies } from "next/headers";
import {
  createSessionToken,
  DOSEN_COOKIE,
  sessionCookieOptions,
} from "@/lib/dosenAuth";
import { authenticateUser } from "@/lib/userStorage";

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  const user = await authenticateUser(email, password);
  if (!user) {
    return Response.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const token = createSessionToken(user);
  cookies().set(DOSEN_COOKIE, token, sessionCookieOptions());

  return Response.json({
    ok: true,
    nama: user.nama,
    role: user.role,
    email: user.email,
  });
}
