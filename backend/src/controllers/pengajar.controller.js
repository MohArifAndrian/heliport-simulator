import prisma from "../lib/prisma.js";
import { extractBearerToken } from "../utils/bearer.js";
import { createPengajarToken, verifyPengajarToken } from "../utils/pengajarAuth.js";
import { hashPassword, stripPassword, verifyPassword } from "../utils/password.js";
import { paginated, parsePagination } from "../utils/pagination.js";
import { created, fail, success } from "../utils/response.js";

const notDeleted = { deletedAt: null };

export async function register(req, res, next) {
  try {
    const { nid, nama_lengkap, prodi, email, password } = req.validated.body;

    const pengajar = await prisma.pengajar.create({
      data: {
        nid,
        namaLengkap: nama_lengkap,
        prodi,
        email: email.trim().toLowerCase(),
        password: await hashPassword(password),
      },
    });

    const token = createPengajarToken(pengajar);
    return created(res, {
      token,
      type: req.pengajarResponseType,
      pengajar: stripPassword(pengajar),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const pengajar = await prisma.pengajar.findFirst({
      where: { email: email.trim().toLowerCase(), ...notDeleted },
    });

    if (!pengajar || !(await verifyPassword(password, pengajar.password))) {
      return fail(res, "Email atau kata sandi salah.", 401);
    }

    const token = createPengajarToken(pengajar);
    return success(res, {
      token,
      type: req.pengajarResponseType,
      pengajar: stripPassword(pengajar),
    });
  } catch (err) {
    next(err);
  }
}

export async function session(req, res, next) {
  try {
    const token = extractBearerToken(req);
    const sessionData = verifyPengajarToken(token);
    if (!sessionData) return fail(res, "Sesi tidak valid atau sudah kedaluwarsa.", 401);

    const pengajar = await prisma.pengajar.findFirst({
      where: { id: sessionData.id, ...notDeleted },
    });
    if (!pengajar) return fail(res, "Pengajar tidak ditemukan.", 404);

    return success(res, {
      type: req.pengajarResponseType,
      pengajar: stripPassword(pengajar),
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const pengajar = await prisma.pengajar.findFirst({
      where: { id: req.pengajarSession.id, ...notDeleted },
      include: { _count: { select: { tugas: { where: notDeleted } } } },
    });
    if (!pengajar) return fail(res, "Pengajar tidak ditemukan.", 404);

    return success(res, {
      type: req.pengajarResponseType,
      pengajar: stripPassword(pengajar),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSelf(req, res, next) {
  try {
    const body = req.validated.body;
    const existing = await prisma.pengajar.findFirst({
      where: { id: req.pengajarSession.id, ...notDeleted },
    });
    if (!existing) return fail(res, "Pengajar tidak ditemukan.", 404);

    const data = {};
    if (body.nama_lengkap !== undefined) data.namaLengkap = body.nama_lengkap;
    if (body.prodi !== undefined) data.prodi = body.prodi;
    if (body.password !== undefined) data.password = await hashPassword(body.password);

    const item = await prisma.pengajar.update({ where: { id: req.pengajarSession.id }, data });
    return success(res, {
      type: req.pengajarResponseType,
      pengajar: stripPassword(item),
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { prodi } = req.validated.query;
    const pg = parsePagination(req.validated.query);
    const where = {
      ...notDeleted,
      ...(prodi ? { prodi: { contains: prodi } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.pengajar.findMany({
        where,
        orderBy: { namaLengkap: "asc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.pengajar.count({ where }),
    ]);
    return paginated(res, items.map(stripPassword), total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await prisma.pengajar.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
      include: { _count: { select: { tugas: { where: notDeleted } } } },
    });
    if (!item) return fail(res, "Pengajar tidak ditemukan.", 404);
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { nid, nama_lengkap, prodi, email, password } = req.validated.body;
    const item = await prisma.pengajar.create({
      data: {
        nid,
        namaLengkap: nama_lengkap,
        prodi,
        email: email.trim().toLowerCase(),
        password: await hashPassword(password),
      },
    });
    return created(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const body = req.validated.body;

    const existing = await prisma.pengajar.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Pengajar tidak ditemukan.", 404);

    const data = {};
    if (body.nid !== undefined) data.nid = body.nid;
    if (body.nama_lengkap !== undefined) data.namaLengkap = body.nama_lengkap;
    if (body.prodi !== undefined) data.prodi = body.prodi;
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.password !== undefined) data.password = await hashPassword(body.password);

    const item = await prisma.pengajar.update({ where: { id }, data });
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    const existing = await prisma.pengajar.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Pengajar tidak ditemukan.", 404);

    await prisma.pengajar.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.status(200).json({ success: true, message: "Data berhasil dihapus." });
  } catch (err) {
    next(err);
  }
}
