import { requireAdmin } from "@/lib/requireDosen";
import { getUserById, updateUser, deleteUser } from "@/lib/userStorage";
import { isValidRole } from "@/lib/roles";

export async function GET(_request, { params }) {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(params.id);
  if (!user) {
    return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  return Response.json({ user });
}

export async function PUT(request, { params }) {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, password, nama, role, active } = body;

  if (role && !isValidRole(role)) {
    return Response.json({ error: "Role tidak valid." }, { status: 400 });
  }

  if (password && password.length < 6) {
    return Response.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
  }

  try {
    const user = await updateUser(params.id, { email, password, nama, role, active });
    if (!user) {
      return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true, user });
  } catch (err) {
    return Response.json({ error: err.message || "Gagal memperbarui pengguna." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  if (!requireAdmin()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ok = await deleteUser(params.id);
    if (!ok) {
      return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message || "Gagal menghapus pengguna." }, { status: 400 });
  }
}
