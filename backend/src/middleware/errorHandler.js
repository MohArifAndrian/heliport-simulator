import { ZodError } from "zod";
import { fail } from "../utils/response.js";

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return fail(res, message, 422);
      }
      next(err);
    }
  };
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.code === "P2002") {
    const target = err.meta?.target;
    const fields = Array.isArray(target) ? target : target ? [target] : [];
    const messages = {
      email: "Email sudah terdaftar.",
      enrol_code: "Kode enrol sudah digunakan.",
      enrolCode: "Kode enrol sudah digunakan.",
    };
    const message = fields.map((f) => messages[f]).find(Boolean);
    if (message) return fail(res, message, 409);
    const field = fields.join(", ") || "field";
    return fail(res, `Data duplikat pada ${field}.`, 409);
  }

  if (err.code === "P2003") {
    return fail(res, "Referensi data tidak ditemukan.", 400);
  }

  if (err.code === "P2025") {
    return fail(res, "Data tidak ditemukan.", 404);
  }

  return fail(res, err.message || "Terjadi kesalahan server.", err.status || 500);
}

export function notFoundHandler(_req, res) {
  return fail(res, "Endpoint tidak ditemukan.", 404);
}
