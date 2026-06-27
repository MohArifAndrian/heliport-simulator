import { Router } from "express";
import * as ctrl from "../controllers/tugas.controller.js";
import { validate } from "../middleware/errorHandler.js";
import {
  requireAdmin,
  requireAdminOrPengajar,
  requirePengajar,
  requireSiswa,
} from "../middleware/requireAuth.js";
import {
  idParamSchema,
  tugasAdminListSchema,
  tugasCreateSchema,
  tugasJoinSchema,
  tugasPengajarListSchema,
  tugasSiswaListSchema,
  tugasUpdateSchema,
} from "../validators/schemas.js";

const router = Router();

// Siswa
router.get("/siswa", requireSiswa, validate(tugasSiswaListSchema), ctrl.listForSiswa);
router.get("/siswa/:id", requireSiswa, validate(idParamSchema), ctrl.getByIdForSiswa);
router.post("/join", requireSiswa, validate(tugasJoinSchema), ctrl.join);

// Pengajar
router.get("/pengajar", requirePengajar, validate(tugasPengajarListSchema), ctrl.listForPengajar);

// Admin
router.get("/", requireAdmin, validate(tugasAdminListSchema), ctrl.list);
router.get("/:id", requireAdminOrPengajar, validate(idParamSchema), ctrl.getById);

// Pengajar CRUD
router.post("/", requirePengajar, validate(tugasCreateSchema), ctrl.create);
router.put("/:id", requirePengajar, validate(tugasUpdateSchema), ctrl.update);
router.patch("/:id", requirePengajar, validate(tugasUpdateSchema), ctrl.update);
router.delete("/:id", requirePengajar, validate(idParamSchema), ctrl.remove);

export default router;
