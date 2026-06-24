import { cookies } from "next/headers";
import { DOSEN_COOKIE, verifySessionToken } from "@/lib/dosenAuth";
import { ROLE_LABELS } from "@/lib/roles";

export async function GET() {
  const token = cookies().get(DOSEN_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({
    authenticated: true,
    nama: session.nama,
    email: session.email,
    role: session.role,
    userId: session.userId,
    roleLabel: ROLE_LABELS[session.role] || session.role,
  });
}
