import { cookies } from "next/headers";
import { PESERTA_COOKIE, verifyPesertaToken, toPesertaProfile } from "@/lib/pesertaAuth";

export async function GET() {
  const token = cookies().get(PESERTA_COOKIE)?.value;
  const session = verifyPesertaToken(token);

  if (!session) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({
    authenticated: true,
    peserta: toPesertaProfile(session),
  });
}
