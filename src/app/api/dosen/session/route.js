import { cookies } from "next/headers";
import { DOSEN_COOKIE, verifySessionToken, getDosenCredentials } from "@/lib/dosenAuth";

export async function GET() {
  const token = cookies().get(DOSEN_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({
    authenticated: true,
    nama: getDosenCredentials().nama,
  });
}
