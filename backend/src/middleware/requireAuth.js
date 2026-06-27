import { verifyAdminToken } from "../utils/adminAuth.js";
import { extractBearerToken } from "../utils/bearer.js";
import { fail } from "../utils/response.js";
import { verifyPengajarToken } from "../utils/pengajarAuth.js";
import { verifySiswaToken } from "../utils/siswaAuth.js";

export function requireAdmin(req, res, next) {
  const session = verifyAdminToken(extractBearerToken(req));
  if (!session) return fail(res, "Akses ditolak. Token admin tidak valid.", 401);
  req.adminSession = session;
  next();
}

export function requireSiswa(req, res, next) {
  const session = verifySiswaToken(extractBearerToken(req));
  if (!session) return fail(res, "Akses ditolak. Token siswa tidak valid.", 401);
  req.siswaSession = session;
  next();
}

export function requirePengajar(req, res, next) {
  const session = verifyPengajarToken(extractBearerToken(req));
  if (!session) return fail(res, "Akses ditolak. Token pengajar tidak valid.", 401);
  req.pengajarSession = session;
  req.authRole = "pengajar";
  next();
}

export function requireAdminOrPengajar(req, res, next) {
  const token = extractBearerToken(req);
  const admin = verifyAdminToken(token);
  if (admin) {
    req.authRole = "admin";
    req.adminSession = admin;
    return next();
  }
  const pengajar = verifyPengajarToken(token);
  if (pengajar) {
    req.authRole = "pengajar";
    req.pengajarSession = pengajar;
    return next();
  }
  return fail(res, "Akses ditolak. Token tidak valid.", 401);
}

export function requireTugasReader(req, res, next) {
  const token = extractBearerToken(req);
  const admin = verifyAdminToken(token);
  if (admin) {
    req.authRole = "admin";
    req.adminSession = admin;
    return next();
  }
  const pengajar = verifyPengajarToken(token);
  if (pengajar) {
    req.authRole = "pengajar";
    req.pengajarSession = pengajar;
    return next();
  }
  const siswa = verifySiswaToken(token);
  if (siswa) {
    req.authRole = "siswa";
    req.siswaSession = siswa;
    return next();
  }
  return fail(res, "Akses ditolak. Token tidak valid.", 401);
}
