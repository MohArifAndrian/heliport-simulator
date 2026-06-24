export const ROLES = {
  ADMIN: "admin",
  DOSEN: "dosen",
};

export const ROLE_LABELS = {
  admin: "Administrator",
  dosen: "Dosen",
};

export function isValidRole(role) {
  return role === ROLES.ADMIN || role === ROLES.DOSEN;
}

export function hasRole(session, ...roles) {
  if (!session?.role) return false;
  return roles.includes(session.role);
}

export function isAdmin(session) {
  return session?.role === ROLES.ADMIN;
}

export function canAccessAdmin(session) {
  return isAdmin(session);
}
