import { cookies } from "next/headers";
import { DOSEN_COOKIE, verifySessionToken } from "@/lib/dosenAuth";
import { ROLES, hasRole, isAdmin } from "@/lib/roles";

export function requireSession() {
  const token = cookies().get(DOSEN_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  return session;
}

export function requireDosen() {
  const session = requireSession();
  if (!session || !hasRole(session, ROLES.ADMIN, ROLES.DOSEN)) return null;
  return session;
}

export function requireAdmin() {
  const session = requireSession();
  if (!session || !isAdmin(session)) return null;
  return session;
}
