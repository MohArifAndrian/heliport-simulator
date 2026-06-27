import { Router } from "express";
import * as ctrl from "../controllers/pengumpulanTugas.controller.js";
import { validate } from "../middleware/errorHandler.js";
import { requireAdmin, requirePengajar, requireSiswa } from "../middleware/requireAuth.js";
import { uploadPdf, handleMulterError } from "../middleware/upload.js";
import {
  idParamSchema,
  pengumpulanAdminListSchema,
  pengumpulanNilaiSchema,
  pengumpulanPengajarListSchema,
  pengumpulanSiswaListSchema,
  pengumpulanSiswaSubmitSchema,
} from "../validators/schemas.js";

const router = Router();

const upload = [uploadPdf.single("pdf"), handleMulterError];

// Admin
router.get("/admin", requireAdmin, validate(pengumpulanAdminListSchema), ctrl.listForAdmin);
router.get("/admin/:id/pdf", requireAdmin, validate(idParamSchema), ctrl.downloadPdfForAdmin);
router.get("/admin/:id", requireAdmin, validate(idParamSchema), ctrl.getByIdForAdmin);

// Siswa
router.get("/siswa", requireSiswa, validate(pengumpulanSiswaListSchema), ctrl.listForSiswa);
router.get("/siswa/:id/pdf", requireSiswa, validate(idParamSchema), ctrl.downloadPdfForSiswa);
router.get("/siswa/:id", requireSiswa, validate(idParamSchema), ctrl.getByIdForSiswa);

// Pengajar
router.get("/pengajar", requirePengajar, validate(pengumpulanPengajarListSchema), ctrl.listForPengajar);
router.get("/pengajar/:id/pdf", requirePengajar, validate(idParamSchema), ctrl.downloadPdfForPengajar);
router.get("/pengajar/:id", requirePengajar, validate(idParamSchema), ctrl.getByIdForPengajar);

// Pengajar: beri nilai
router.patch("/:id/nilai", requirePengajar, validate(pengumpulanNilaiSchema), ctrl.updateNilai);

// Siswa: serahkan & update PDF
router.post("/", requireSiswa, ...upload, validate(pengumpulanSiswaSubmitSchema), ctrl.submit);
router.put("/:id", requireSiswa, ...upload, validate(idParamSchema), ctrl.updateBySiswa);
router.patch("/:id", requireSiswa, ...upload, validate(idParamSchema), ctrl.updateBySiswa);

export default router;
