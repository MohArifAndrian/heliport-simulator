import { cookies } from "next/headers";
import { getSubmissionById } from "@/lib/storage";
import { DOSEN_COOKIE, verifySessionToken } from "@/lib/dosenAuth";

export async function GET(_request, { params }) {
  const token = cookies().get(DOSEN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await getSubmissionById(params.id);
  if (!submission) {
    return Response.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  return Response.json({ submission });
}
