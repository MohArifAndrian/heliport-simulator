import { requireAdmin } from "@/lib/requireDosen";
import { getAllUsers, addUser } from "@/lib/userStorage";
import { isValidRole } from "@/lib/roles";

export async function GET() {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllUsers();
  return Response.json({ users });
}

export async function POST(request) {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, password, nama, role } = body;

  if (!email?.trim() || !password?.trim() || !nama?.trim()) {
    return Response.json({ error: "Email, kata sandi, dan nama wajib diisi." }, { status: 400 });
  }

  if (!isValidRole(role)) {
    return Response.json({ error: "Role tidak valid." }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
  }

  try {
    const user = await addUser({ email, password, nama, role });
    return Response.json({ ok: true, user });
  } catch (err) {
    return Response.json({ error: err.message || "Gagal menambah pengguna." }, { status: 400 });
  }
}
