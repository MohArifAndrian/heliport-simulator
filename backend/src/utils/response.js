import crypto from "crypto";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return [
    `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`,
    `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`,
  ].join(" ");
}

function sanitizeValue(value) {
  if (value == null) return value;
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === "string" && ISO_DATE_RE.test(value)) return formatDateTime(value);
  return sanitizeResponse(value);
}

export function sanitizeResponse(data) {
  if (data == null) return data;
  if (Array.isArray(data)) return data.map(sanitizeValue);
  if (data instanceof Date) return formatDateTime(data);
  if (typeof data === "string" && ISO_DATE_RE.test(data)) return formatDateTime(data);
  if (typeof data !== "object") return data;
  if (data.constructor?.name === "Decimal") return data;

  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "updatedAt") continue;
    out[key] = sanitizeValue(value);
  }
  return out;
}

export function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data: sanitizeResponse(data) });
}

export function created(res, data) {
  return success(res, data, 201);
}

export function noContent(res) {
  return res.status(204).send();
}

export function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

export function generateEnrolCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}
