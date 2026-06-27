import { cookies } from "next/headers";
import { PESERTA_COOKIE } from "@/lib/pesertaAuth";

export async function POST() {
  cookies().delete(PESERTA_COOKIE);
  return Response.json({ ok: true });
}
