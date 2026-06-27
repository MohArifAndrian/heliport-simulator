import fs from "fs/promises";
import path from "path";
import prisma from "../lib/prisma.js";
import { UPLOADS_DIR } from "../middleware/upload.js";
import { paginated, parsePagination } from "../utils/pagination.js";
import { created, fail, success } from "../utils/response.js";

const notDeleted = { deletedAt: null };

const includeBrief = {
  tugas: { select: { id: true, judul: true, enrolCode: true, pengajarId: true } },
  siswa: { select: { id: true, nama: true, nim: true, email: true, category: true } },
};

async function findOwnPengumpulan(id, siswaId) {
  return prisma.pengumpulanTugas.findFirst({
    where: { id, siswaId, ...notDeleted },
    include: { tugas: { select: { pengajarId: true } } },
  });
}

async function findPengumpulanForPengajar(id, pengajarId) {
  return prisma.pengumpulanTugas.findFirst({
    where: { id, ...notDeleted, tugas: { pengajarId, ...notDeleted } },
    include: { tugas: { select: { pengajarId: true } } },
  });
}

function requirePdfFile(req, res) {
  if (!req.file) return fail(res, "File PDF wajib diunggah.", 422);
  return null;
}

export async function listForSiswa(req, res, next) {
  try {
    const pg = parsePagination(req.validated.query);
    const where = { siswaId: req.siswaSession.id, ...notDeleted };
    const [items, total] = await Promise.all([
      prisma.pengumpulanTugas.findMany({
        where,
        include: includeBrief,
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.pengumpulanTugas.count({ where }),
    ]);
    return paginated(res, items, total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function listForPengajar(req, res, next) {
  try {
    const { tugas_id } = req.validated.query;
    const pg = parsePagination(req.validated.query);
    const where = {
      ...notDeleted,
      tugas: {
        pengajarId: req.pengajarSession.id,
        ...notDeleted,
        ...(tugas_id ? { id: tugas_id } : {}),
      },
    };
    const [items, total] = await Promise.all([
      prisma.pengumpulanTugas.findMany({
        where,
        include: includeBrief,
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.pengumpulanTugas.count({ where }),
    ]);
    return paginated(res, items, total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function listForAdmin(req, res, next) {
  try {
    const { tugas_id, siswa_id } = req.validated.query;
    const pg = parsePagination(req.validated.query);
    const where = {
      ...notDeleted,
      ...(tugas_id ? { tugasId: tugas_id } : {}),
      ...(siswa_id ? { siswaId: siswa_id } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.pengumpulanTugas.findMany({
        where,
        include: {
          ...includeBrief,
          tugas: {
            select: {
              id: true,
              judul: true,
              enrolCode: true,
              pengajarId: true,
              pengajar: { select: { id: true, namaLengkap: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: pg.skip,
        take: pg.limit,
      }),
      prisma.pengumpulanTugas.count({ where }),
    ]);
    return paginated(res, items, total, pg, success);
  } catch (err) {
    next(err);
  }
}

export async function getByIdForSiswa(req, res, next) {
  try {
    const item = await prisma.pengumpulanTugas.findFirst({
      where: { id: req.validated.params.id, siswaId: req.siswaSession.id, ...notDeleted },
      include: includeBrief,
    });
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function getByIdForAdmin(req, res, next) {
  try {
    const item = await prisma.pengumpulanTugas.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
      include: {
        ...includeBrief,
        tugas: {
          select: {
            id: true,
            judul: true,
            enrolCode: true,
            pengajarId: true,
            pengajar: { select: { id: true, namaLengkap: true, prodi: true } },
          },
        },
      },
    });
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function getByIdForPengajar(req, res, next) {
  try {
    const item = await prisma.pengumpulanTugas.findFirst({
      where: {
        id: req.validated.params.id,
        ...notDeleted,
        tugas: { pengajarId: req.pengajarSession.id, ...notDeleted },
      },
      include: includeBrief,
    });
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const fileError = requirePdfFile(req, res);
    if (fileError) return fileError;

    const { tugas_id } = req.validated.body;
    const siswaId = req.siswaSession.id;

    const existing = await prisma.pengumpulanTugas.findFirst({
      where: { tugasId: tugas_id, siswaId, ...notDeleted },
    });
    if (!existing) return fail(res, "Anda belum bergabung ke tugas ini.", 404);

    if (existing.pdf) {
      return fail(res, "Tugas sudah diserahkan. Gunakan update untuk mengganti file.", 409);
    }

    const item = await prisma.pengumpulanTugas.update({
      where: { id: existing.id },
      data: { pdf: `pdfs/${req.file.filename}` },
      include: includeBrief,
    });
    return created(res, item);
  } catch (err) {
    next(err);
  }
}

export async function updateBySiswa(req, res, next) {
  try {
    const fileError = requirePdfFile(req, res);
    if (fileError) return fileError;

    const { id } = req.validated.params;
    const existing = await findOwnPengumpulan(id, req.siswaSession.id);
    if (!existing) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);

    if (existing.pdf) {
      const oldPath = path.join(UPLOADS_DIR, path.basename(existing.pdf));
      await fs.unlink(oldPath).catch(() => {});
    }

    const item = await prisma.pengumpulanTugas.update({
      where: { id },
      data: { pdf: `pdfs/${req.file.filename}` },
      include: includeBrief,
    });
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function updateNilai(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { nilai } = req.validated.body;

    const existing = await findPengumpulanForPengajar(id, req.pengajarSession.id);
    if (!existing) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);

    if (!existing.pdf) {
      return fail(res, "Siswa belum menyerahkan tugas.", 422);
    }

    const item = await prisma.pengumpulanTugas.update({
      where: { id },
      data: { nilai },
      include: includeBrief,
    });
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function downloadPdfForSiswa(req, res, next) {
  try {
    const item = await findOwnPengumpulan(req.validated.params.id, req.siswaSession.id);
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return downloadPdfFile(res, item, req.validated.params.id);
  } catch (err) {
    next(err);
  }
}

export async function downloadPdfForPengajar(req, res, next) {
  try {
    const item = await findPengumpulanForPengajar(
      req.validated.params.id,
      req.pengajarSession.id
    );
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return downloadPdfFile(res, item, req.validated.params.id);
  } catch (err) {
    next(err);
  }
}

export async function downloadPdfForAdmin(req, res, next) {
  try {
    const item = await prisma.pengumpulanTugas.findFirst({
      where: { id: req.validated.params.id, ...notDeleted },
    });
    if (!item) return fail(res, "Pengumpulan tugas tidak ditemukan.", 404);
    return downloadPdfFile(res, item, req.validated.params.id);
  } catch (err) {
    next(err);
  }
}

async function downloadPdfFile(res, item, id) {
  if (!item.pdf) return fail(res, "PDF belum diunggah.", 404);

  const filePath = path.join(UPLOADS_DIR, path.basename(item.pdf));
  try {
    await fs.access(filePath);
  } catch {
    return fail(res, "File PDF tidak ditemukan di server.", 404);
  }

  return res.download(filePath, `submission-${id}.pdf`);
}
