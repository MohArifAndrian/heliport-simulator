import { Router } from "express";
import * as ctrl from "../controllers/admin.controller.js";
import { validate } from "../middleware/errorHandler.js";
import { requireAdmin } from "../middleware/requireAuth.js";
import {
  adminCreateSchema,
  adminListSchema,
  adminLoginSchema,
  adminUpdateSchema,
  adminUpdateSelfSchema,
  idParamSchema,
} from "../validators/schemas.js";

const router = Router();

const ADMIN_RESPONSE_TYPE = "admin";

function attachAdminResponseType(req, _res, next) {
  req.adminResponseType = ADMIN_RESPONSE_TYPE;
  next();
}

// Public
router.post("/login", validate(adminLoginSchema), attachAdminResponseType, ctrl.login);
router.get("/session", attachAdminResponseType, ctrl.session);

// Admin profile
router.get("/me", requireAdmin, attachAdminResponseType, ctrl.me);
router.patch("/me", requireAdmin, validate(adminUpdateSelfSchema), attachAdminResponseType, ctrl.updateMe);

// CRUD admin (token admin)
router.get("/", requireAdmin, validate(adminListSchema), ctrl.list);
router.get("/:id", requireAdmin, validate(idParamSchema), ctrl.getById);
router.post("/", requireAdmin, validate(adminCreateSchema), ctrl.create);
router.put("/:id", requireAdmin, validate(adminUpdateSchema), ctrl.update);
router.patch("/:id", requireAdmin, validate(adminUpdateSchema), ctrl.update);
router.delete("/:id", requireAdmin, validate(idParamSchema), ctrl.remove);

export default router;
