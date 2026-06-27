import { Router } from "express";
import * as ctrl from "../controllers/pengajar.controller.js";
import { validate } from "../middleware/errorHandler.js";
import { requireAdmin, requirePengajar } from "../middleware/requireAuth.js";
import {
  idParamSchema,
  pengajarCreateSchema,
  pengajarListSchema,
  pengajarLoginSchema,
  pengajarUpdateSchema,
  pengajarUpdateSelfSchema,
} from "../validators/schemas.js";

const router = Router();

const PENGAJAR_RESPONSE_TYPE = "pengajar";

function attachPengajarResponseType(req, _res, next) {
  req.pengajarResponseType = PENGAJAR_RESPONSE_TYPE;
  next();
}

// Auth pengajar (public register dinonaktifkan — hanya admin yang bisa buat akun)
router.post("/login", validate(pengajarLoginSchema), attachPengajarResponseType, ctrl.login);
router.get("/session", attachPengajarResponseType, ctrl.session);

// Area pengajar (token pengajar)
router.get("/me", requirePengajar, attachPengajarResponseType, ctrl.me);
router.patch("/me", requirePengajar, validate(pengajarUpdateSelfSchema), attachPengajarResponseType, ctrl.updateSelf);

// CRUD admin (token admin)
router.get("/", requireAdmin, validate(pengajarListSchema), ctrl.list);
router.get("/:id", requireAdmin, validate(idParamSchema), ctrl.getById);
router.post("/", requireAdmin, validate(pengajarCreateSchema), ctrl.create);
router.put("/:id", requireAdmin, validate(pengajarUpdateSchema), ctrl.update);
router.patch("/:id", requireAdmin, validate(pengajarUpdateSchema), ctrl.update);
router.delete("/:id", requireAdmin, validate(idParamSchema), ctrl.remove);

export default router;
