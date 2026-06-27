import { hashPassword } from "@/lib/userStorage";

export function sanitizeRegistryItem(item) {
  if (!item) return null;
  const { password, passwordHash, ...safe } = item;
  return { ...safe, hasPassword: Boolean(passwordHash) };
}

export function prepareRegistryData(data, existing = null) {
  const next = { ...data };
  delete next.password;

  if (data.password && String(data.password).trim()) {
    next.passwordHash = hashPassword(String(data.password).trim());
  } else if (existing?.passwordHash) {
    next.passwordHash = existing.passwordHash;
  }

  return next;
}
