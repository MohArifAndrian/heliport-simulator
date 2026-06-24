import { requireAdmin } from "@/lib/requireDosen";
import { getPortalSettings, savePortalSettings } from "@/lib/settingsStorage";

export async function GET() {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getPortalSettings();
  return Response.json({ settings });
}

export async function PUT(request) {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.institutionName?.trim()) {
    return Response.json({ error: "Nama institusi wajib diisi." }, { status: 400 });
  }

  const settings = await savePortalSettings(body);
  return Response.json({ ok: true, settings });
}
