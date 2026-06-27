import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { getAllSubmissions, addSubmission, saveSubmissionPdf } from "@/lib/storage";
import { DOSEN_COOKIE, verifySessionToken } from "@/lib/dosenAuth";
import { buildSubmissionPayload } from "@/lib/buildSubmissionPayload";

function requireDosen() {
  const token = cookies().get(DOSEN_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  return session;
}

export async function GET() {
  if (!requireDosen()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const submissions = await getAllSubmissions();
  const list = submissions.map((s) => ({
    id: s.id,
    submittedAt: s.submittedAt,
    mahasiswa: s.mahasiswa,
    heliName: s.heliName,
    tugasSummary: s.tugasSummary,
    verdict: s.verdict,
    mode: s.mode,
    hasPdf: Boolean(s.pdfFile),
  }));
  return Response.json({ submissions: list });
}

export async function POST(request) {
  const body = await request.json();
  const { pdfBase64, ...rest } = body;

  if (!rest.mahasiswa?.nama?.trim()) {
    return Response.json({ error: "Data mahasiswa wajib diisi." }, { status: 400 });
  }

  const id = randomUUID();
  const payload = buildSubmissionPayload(rest);
  const submission = {
    id,
    submittedAt: new Date().toISOString(),
    ...payload,
  };

  if (pdfBase64) {
    try {
      submission.pdfFile = await saveSubmissionPdf(id, pdfBase64);
    } catch {
      return Response.json({ error: "Gagal menyimpan PDF laporan." }, { status: 500 });
    }
  }

  await addSubmission(submission);
  return Response.json({ ok: true, id: submission.id, hasPdf: Boolean(submission.pdfFile) });
}
