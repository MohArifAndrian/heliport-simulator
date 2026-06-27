import prisma from "../lib/prisma.js";
import { extractBearerToken } from "../utils/bearer.js";
import { hashPassword, stripPassword, verifyPassword } from "../utils/password.js";
import { createSiswaToken, verifySiswaToken } from "../utils/siswaAuth.js";
import { paginated, parsePagination } from "../utils/pagination.js";
import { created, fail, success } from "../utils/response.js";

const notDeleted = { deletedAt: null };

export async function register(req, res, next) {
  try {
    const { nama, nim, prodi, category, kelas, email, password } = req.validated.body;

    const siswa = await prisma.siswa.create({
      data: {
        nama,
        nim,
        prodi,
        category,
        kelas,
        email: email.trim().toLowerCase(),
        password: await hashPassword(password),
      },
    });

    const token = createSiswaToken(siswa);
    return created(res, {
      token,
      type: req.siswaResponseType,
      siswa: stripPassword(siswa),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const siswa = await prisma.siswa.findFirst({
      where: { email: email.trim().toLowerCase(), ...notDeleted },
    });

    if (!siswa || !(await verifyPassword(password, siswa.password))) {
      return fail(res, "Email atau kata sandi salah.", 401);
    }

    const token = createSiswaToken(siswa);
    return success(res, {
      token,
      type: req.siswaResponseType,
      siswa: stripPassword(siswa),
    });
  } catch (err) {
    next(err);
  }
}

export async function session(req, res, next) {
  try {
    const token = extractBearerToken(req);
    const sessionData = verifySiswaToken(token);
    if (!sessionData) return fail(res, "Sesi tidak valid atau sudah kedaluwarsa.", 401);

    const siswa = await prisma.siswa.findFirst({
      where: { id: sessionData.id, ...notDeleted },
    });
    if (!siswa) return fail(res, "Siswa tidak ditemukan.", 404);

    return success(res, {
      type: req.siswaResponseType,
      siswa: stripPassword(siswa),
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const siswa = await prisma.siswa.findFirst({
      where: { id: req.siswaSession.id, ...notDeleted },
      include: { _count: { select: { pengumpulanTugas: { where: notDeleted } } } },
    });
    if (!siswa) return fail(res, "Siswa tidak ditemukan.", 404);

    return success(res, {
      type: req.siswaResponseType,
      siswa: stripPassword(siswa),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSelf(req, res, next) {
  try {
    const body = req.validated.body;
    const existing = await prisma.siswa.findFirst({
      where: { id: req.siswaSession.id, ...notDeleted },
    });
    if (!existing) return fail(res, "Siswa tidak ditemukan.", 404);

    const data = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.prodi !== undefined) data.prodi = body.prodi;
    if (body.kelas !== undefined) data.kelas = body.kelas;
    if (body.password !== undefined) data.password = await hashPassword(body.password);

    const item = await prisma.siswa.update({ where: { id: req.siswaSession.id }, data });
    return success(res, {
      type: req.siswaResponseType,
      siswa: stripPassword(item),
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { category, prodi, kelas } = req.validated.query;
    const pg = parsePagination(req.validated.query);
    const where = {
      ...notDeleted,
      ...(category ? { category } : {}),
      ...(prodi ? { prodi: { contains: prodi } } : {}),
      ...(kelas ? { kelas: { contains: kelas } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        orderBy: { nama: "asc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.siswa.count({ where }),
    ]);
    return paginated(res, items.map(stripPassword), total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await prisma.siswa.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
      include: { _count: { select: { pengumpulanTugas: { where: notDeleted } } } },
    });
    if (!item) return fail(res, "Siswa tidak ditemukan.", 404);
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { nama, nim, prodi, category, kelas, email, password } = req.validated.body;
    const item = await prisma.siswa.create({
      data: {
        nama,
        nim,
        prodi,
        category,
        kelas,
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

    const existing = await prisma.siswa.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Siswa tidak ditemukan.", 404);

    const data = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.nim !== undefined) data.nim = body.nim;
    if (body.prodi !== undefined) data.prodi = body.prodi;
    if (body.category !== undefined) data.category = body.category;
    if (body.kelas !== undefined) data.kelas = body.kelas;
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.password !== undefined) data.password = await hashPassword(body.password);

    const item = await prisma.siswa.update({ where: { id }, data });
    return success(res, stripPassword(item));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    const existing = await prisma.siswa.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Siswa tidak ditemukan.", 404);

    await prisma.siswa.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.status(200).json({ success: true, message: "Data berhasil dihapus." });
  } catch (err) {
    next(err);
  }
}
