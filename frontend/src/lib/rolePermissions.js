import { ROLES, ROLE_LABELS } from "./roles";

export const PERMISSIONS = [
  {
    id: "dashboard",
    label: "Dashboard Penilaian",
    description: "Lihat daftar pengumpulan tugas dan grafik statistik",
    roles: [ROLES.ADMIN, ROLES.DOSEN],
  },
  {
    id: "submissions-detail",
    label: "Detail Penilaian",
    description: "Lihat detail tugas peserta dan unduh PDF",
    roles: [ROLES.ADMIN, ROLES.DOSEN],
  },
  {
    id: "registry-mahasiswa",
    label: "Data Mahasiswa",
    description: "Kelola daftar mahasiswa",
    roles: [ROLES.ADMIN, ROLES.DOSEN],
  },
  {
    id: "registry-peserta",
    label: "Peserta Diklat",
    description: "Kelola daftar peserta diklat",
    roles: [ROLES.ADMIN, ROLES.DOSEN],
  },
  {
    id: "registry-diklat",
    label: "Kegiatan Diklat",
    description: "Kelola data kegiatan diklat",
    roles: [ROLES.ADMIN, ROLES.DOSEN],
  },
  {
    id: "admin-settings",
    label: "Pengaturan Sistem",
    description: "Konfigurasi portal dan informasi institusi",
    roles: [ROLES.ADMIN],
  },
  {
    id: "admin-users",
    label: "Admin & Role",
    description: "Kelola akun admin/dosen dan penetapan role",
    roles: [ROLES.ADMIN],
  },
];

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: "Akses penuh ke semua fitur portal termasuk pengaturan sistem dan manajemen pengguna.",
  [ROLES.DOSEN]: "Akses penilaian tugas, data mahasiswa, peserta diklat, dan kegiatan diklat.",
};

export function roleHasPermission(role, permissionId) {
  const perm = PERMISSIONS.find((p) => p.id === permissionId);
  return perm?.roles.includes(role) ?? false;
}

export function permissionsForRole(role) {
  return PERMISSIONS.filter((p) => p.roles.includes(role));
}

export function permissionMatrix() {
  return PERMISSIONS.map((p) => ({
    ...p,
    access: {
      [ROLES.ADMIN]: p.roles.includes(ROLES.ADMIN),
      [ROLES.DOSEN]: p.roles.includes(ROLES.DOSEN),
    },
    roleLabels: ROLE_LABELS,
  }));
}
