import { Router } from "express";
import * as ctrl from "../controllers/siswa.controller.js";
import { validate } from "../middleware/errorHandler.js";
import { requireAdmin, requireSiswa } from "../middleware/requireAuth.js";
import {
  idParamSchema,
  siswaCreateSchema,
  siswaListSchema,
  siswaLoginSchema,
  siswaRegisterSchema,
  siswaUpdateSchema,
  siswaUpdateSelfSchema,
} from "../validators/schemas.js";

const router = Router();

const SISWA_RESPONSE_TYPE = "siswa";

function attachSiswaResponseType(req, _res, next) {
  req.siswaResponseType = SISWA_RESPONSE_TYPE;
  next();
}

// Auth siswa (public)
router.post("/register", validate(siswaRegisterSchema), attachSiswaResponseType, ctrl.register);
router.post("/login", validate(siswaLoginSchema), attachSiswaResponseType, ctrl.login);
router.get("/session", attachSiswaResponseType, ctrl.session);

// Area siswa (token siswa)
router.get("/me", requireSiswa, attachSiswaResponseType, ctrl.me);
router.patch("/me", requireSiswa, validate(siswaUpdateSelfSchema), attachSiswaResponseType, ctrl.updateSelf);

// CRUD admin (token admin)
router.get("/", requireAdmin, validate(siswaListSchema), ctrl.list);
router.get("/:id", requireAdmin, validate(idParamSchema), ctrl.getById);
router.post("/", requireAdmin, validate(siswaCreateSchema), ctrl.create);
router.put("/:id", requireAdmin, validate(siswaUpdateSchema), ctrl.update);
router.patch("/:id", requireAdmin, validate(siswaUpdateSchema), ctrl.update);
router.delete("/:id", requireAdmin, validate(idParamSchema), ctrl.remove);

export default router;
