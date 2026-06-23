import { cookies } from "next/headers";
import { DOSEN_COOKIE } from "@/lib/dosenAuth";

export async function POST() {
  cookies().delete(DOSEN_COOKIE);
  return Response.json({ ok: true });
}
