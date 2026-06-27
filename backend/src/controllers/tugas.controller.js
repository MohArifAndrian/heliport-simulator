import prisma from "../lib/prisma.js";
import { paginated, parsePagination } from "../utils/pagination.js";
import { created, fail, success, generateEnrolCode } from "../utils/response.js";

const notDeleted = { deletedAt: null };
const ENROL_CODE_LENGTH = 5;

const pengajarBrief = { select: { id: true, namaLengkap: true, nid: true, prodi: true } };
const siswaBrief = { select: { id: true, nama: true, nim: true, email: true, category: true } };

async function ensureUniqueEnrolCode() {
  const code = generateEnrolCode(ENROL_CODE_LENGTH);
  const existing = await prisma.tugas.findUnique({ where: { enrolCode: code } });
  if (existing) return ensureUniqueEnrolCode();
  return code;
}

function assertPengajarOwns(req, res, tugas) {
  if (tugas.pengajarId !== req.pengajarSession.id) {
    return fail(res, "Akses ditolak. Tugas bukan milik Anda.", 403);
  }
  return null;
}

function buildSiswaFilters(siswaId, { joined, submitted }) {
  if (submitted === "true") {
    return { pengumpulanTugas: { some: { siswaId, pdf: { not: null }, ...notDeleted } } };
  }
  if (submitted === "false") {
    return {
      NOT: { pengumpulanTugas: { some: { siswaId, pdf: { not: null }, ...notDeleted } } },
    };
  }
  if (joined === "true") {
    return { pengumpulanTugas: { some: { siswaId, ...notDeleted } } };
  }
  if (joined === "false") {
    return { pengumpulanTugas: { none: { siswaId, ...notDeleted } } };
  }
  return {};
}

function formatSiswaTugas(item) {
  const pengumpulan = item.pengumpulanTugas[0];
  const joined = item.pengumpulanTugas.length > 0;
  const submitted = joined && !!pengumpulan?.pdf;
  const { pengumpulanTugas, ...rest } = item;
  return {
    ...rest,
    joined,
    joinStatus: joined ? "joined" : "not_joined",
    submitted,
    submitStatus: submitted ? "submitted" : "not_submitted",
    pengumpulanId: joined ? pengumpulan.id : null,
    nilai: pengumpulan?.nilai ?? null,
  };
}

export async function listForSiswa(req, res, next) {
  try {
    const { joined, submitted } = req.validated.query;
    const siswaId = req.siswaSession.id;
    const pg = parsePagination(req.validated.query);
    const where = { ...notDeleted, ...buildSiswaFilters(siswaId, { joined, submitted }) };

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where,
        include: {
          pengajar: { select: { id: true, namaLengkap: true, prodi: true } },
          pengumpulanTugas: {
            where: { siswaId, ...notDeleted },
            select: { id: true, createdAt: true, pdf: true, nilai: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.tugas.count({ where }),
    ]);

    return paginated(res, items.map(formatSiswaTugas), total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getByIdForSiswa(req, res, next) {
  try {
    const item = await prisma.tugas.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
      include: {
        pengajar: { select: { id: true, namaLengkap: true, prodi: true } },
        pengumpulanTugas: {
          where: { siswaId: req.siswaSession.id, ...notDeleted },
          select: { id: true, createdAt: true, pdf: true, nilai: true },
        },
      },
    });
    if (!item) return fail(res, "Tugas tidak ditemukan.", 404);
    return success(res, formatSiswaTugas(item));
  } catch (err) {
    next(err);
  }
}

export async function listForPengajar(req, res, next) {
  try {
    const pg = parsePagination(req.validated.query);
    const where = { ...notDeleted, pengajarId: req.pengajarSession.id };

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where,
        include: {
          pengajar: { select: { id: true, namaLengkap: true, prodi: true } },
          pengumpulanTugas: {
            where: notDeleted,
            include: { siswa: siswaBrief },
          },
          _count: { select: { pengumpulanTugas: { where: notDeleted } } },
        },
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.tugas.count({ where }),
    ]);
    return paginated(res, items, total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const pg = parsePagination(req.validated.query);
    const where = notDeleted;

    const [items, total] = await Promise.all([
      prisma.tugas.findMany({
        where,
        include: {
          pengajar: pengajarBrief,
          pengumpulanTugas: {
            where: notDeleted,
            include: { siswa: siswaBrief },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.tugas.count({ where }),
    ]);
    return paginated(res, items, total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.validated.params;

    if (req.authRole === "admin") {
      const item = await prisma.tugas.findFirst({
        where: { id, ...notDeleted },
        include: {
          pengajar: pengajarBrief,
          pengumpulanTugas: {
            where: notDeleted,
            include: { siswa: siswaBrief },
          },
        },
      });
      if (!item) return fail(res, "Tugas tidak ditemukan.", 404);
      return success(res, item);
    }

    const item = await prisma.tugas.findFirst({
      where: { id, pengajarId: req.pengajarSession.id, ...notDeleted },
      include: {
        pengajar: { select: { id: true, namaLengkap: true } },
        pengumpulanTugas: {
          where: notDeleted,
          include: { siswa: siswaBrief },
        },
      },
    });
    if (!item) return fail(res, "Tugas tidak ditemukan.", 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function join(req, res, next) {
  try {
    const { enrol_code } = req.validated.body;

    const tugas = await prisma.tugas.findFirst({
      where: { enrolCode: enrol_code.toUpperCase(), ...notDeleted },
      include: { pengajar: { select: { id: true, namaLengkap: true, prodi: true } } },
    });
    if (!tugas) return fail(res, "Kode enrol tidak ditemukan.", 404);

    const duplicate = await prisma.pengumpulanTugas.findFirst({
      where: { tugasId: tugas.id, siswaId: req.siswaSession.id, ...notDeleted },
    });
    if (duplicate) return fail(res, "Anda sudah bergabung ke tugas ini.", 409);

    const pengumpulan = await prisma.pengumpulanTugas.create({
      data: { tugasId: tugas.id, siswaId: req.siswaSession.id },
    });

    return created(res, {
      tugas: formatSiswaTugas({
        ...tugas,
        pengumpulanTugas: [{ id: pengumpulan.id, pdf: null, nilai: null }],
      }),
      pengumpulan: { id: pengumpulan.id, tugasId: tugas.id, siswaId: req.siswaSession.id },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { judul, deskripsi } = req.validated.body;
    const enrolCode = await ensureUniqueEnrolCode();

    const item = await prisma.tugas.create({
      data: {
        judul,
        deskripsi,
        pengajarId: req.pengajarSession.id,
        enrolCode,
      },
      include: { pengajar: { select: { id: true, namaLengkap: true } } },
    });
    return created(res, item);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const body = req.validated.body;

    const existing = await prisma.tugas.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Tugas tidak ditemukan.", 404);

    const denied = assertPengajarOwns(req, res, existing);
    if (denied) return denied;

    const data = {};
    if (body.judul !== undefined) data.judul = body.judul;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi;

    const item = await prisma.tugas.update({
      where: { id },
      data,
      include: { pengajar: { select: { id: true, namaLengkap: true } } },
    });
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    const existing = await prisma.tugas.findFirst({ where: { id, ...notDeleted } });
    if (!existing) return fail(res, "Tugas tidak ditemukan.", 404);

    const denied = assertPengajarOwns(req, res, existing);
    if (denied) return denied;

    await prisma.tugas.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.status(200).json({ success: true, message: "Data berhasil dihapus." });
  } catch (err) {
    next(err);
  }
}
