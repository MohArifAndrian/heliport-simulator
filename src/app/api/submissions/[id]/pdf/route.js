import { cookies } from "next/headers";
import { getSubmissionById, readSubmissionPdf } from "@/lib/storage";
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

  const pdf = await readSubmissionPdf(params.id);
  if (!pdf) {
    return Response.json({ error: "PDF tidak ditemukan" }, { status: 404 });
  }

  const nama = submission.mahasiswa?.nama?.replace(/\s+/g, "-") || "mahasiswa";
  const filename = `laporan-heliport-${nama}.pdf`;

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
