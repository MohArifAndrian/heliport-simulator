import prisma from "../lib/prisma.js";
import { createAdminToken, extractBearerToken, verifyAdminToken } from "../utils/adminAuth.js";
import { hashPassword, stripPassword, verifyPassword } from "../utils/password.js";
import { paginated, parsePagination } from "../utils/pagination.js";
import { created, fail, success } from "../utils/response.js";

const notDeleted = { deletedAt: null };

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const admin = await prisma.admin.findFirst({
      where: { email: email.trim().toLowerCase(), ...notDeleted },
    });

    if (!admin || !(await verifyPassword(password, admin.password))) {
      return fail(res, "Email atau kata sandi salah.", 401);
    }

    const token = createAdminToken(admin);
    return success(res, {
      token,
      type: req.adminResponseType,
      admin: stripPassword(admin),
    });
  } catch (err) {
    next(err);
  }
}

export async function session(req, res, next) {
  try {
    const token = extractBearerToken(req);
    const session = verifyAdminToken(token);
    if (!session) return fail(res, "Sesi tidak valid atau sudah kedaluwarsa.", 401);

    const admin = await prisma.admin.findFirst({ where: { id: session.id, ...notDeleted } });
    if (!admin) return fail(res, "Admin tidak ditemukan.", 404);

    return success(res, {
      type: req.adminResponseType,
      admin: stripPassword(admin),
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const admin = await prisma.admin.findFirst({
      where: { id: req.adminSession.id, ...notDeleted },
    });
    if (!admin) return fail(res, "Admin tidak ditemukan.", 404);
    return success(res, {
      type: req.adminResponseType,
      admin: stripPassword(admin),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const { nama, password } = req.validated.body;
    const data = {};
    if (nama !== undefined) data.nama = nama;
    if (password !== undefined) data.password = await hashPassword(password);

    const item = await prisma.admin.update({ where: { id: req.adminSession.id }, data });
    return success(res, {
      type: req.adminResponseType,
      admin: stripPassword(item),
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const pg = parsePagination(req.validated.query);
    const where = notDeleted;
    const [items, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        orderBy: { id: "asc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.admin.count({ where }),
    ]);
    return paginated(res, items.map(stripPassword), total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await prisma.admin.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
    });
    if (!item) return fail(res, "Admin tidak ditemukan.", 404);
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { email, password, nama } = req.validated.body;
    const item = await prisma.admin.create({
      data: { email: email.trim().toLowerCase(), nama, password: await hashPassword(password) },
    });
    return created(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { email, password, nama } = req.validated.body;

    const existing = await prisma.admin.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Admin tidak ditemukan.", 404);

    const data = {};
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (nama !== undefined) data.nama = nama;
    if (password !== undefined) data.password = await hashPassword(password);

    const item = await prisma.admin.update({ where: { id }, data });
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    const existing = await prisma.admin.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Admin tidak ditemukan.", 404);

    await prisma.admin.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.status(200).json({ success: true, message: "Data berhasil dihapus." });
  } catch (err) {
    next(err);
  }
}
