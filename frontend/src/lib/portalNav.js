import { ROLES } from "./roles";

export const PORTAL_NAV = [
  {
    section: "Penilaian",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard Penilaian",
        shortLabel: "Penilaian",
        exact: true,
        roles: [ROLES.ADMIN, ROLES.DOSEN],
        icon: "dashboard",
      },
    ],
  },
  {
    section: "Data",
    items: [
      {
        href: "/dashboard/mahasiswa",
        label: "Data Mahasiswa",
        shortLabel: "Mahasiswa",
        roles: [ROLES.ADMIN, ROLES.DOSEN],
        icon: "user",
      },
      {
        href: "/dashboard/peserta-diklat",
        label: "Peserta Diklat",
        shortLabel: "Peserta",
        roles: [ROLES.ADMIN, ROLES.DOSEN],
        icon: "users",
      },
      {
        href: "/dashboard/diklat",
        label: "Kegiatan Diklat",
        shortLabel: "Diklat",
        roles: [ROLES.ADMIN, ROLES.DOSEN],
        icon: "book",
      },
    ],
  },
  {
    section: "Setting",
    items: [
      {
        href: "/dashboard/settings",
        label: "Pengaturan Akun",
        shortLabel: "Akun",
        roles: [ROLES.ADMIN, ROLES.DOSEN],
        icon: "account",
      },
      {
        href: "/dashboard/admin/settings",
        label: "Setting Sistem",
        shortLabel: "Setting",
        roles: [ROLES.ADMIN],
        icon: "settings",
      },
      {
        href: "/dashboard/admin/users",
        label: "Admin & Role",
        shortLabel: "Role",
        roles: [ROLES.ADMIN],
        icon: "shield",
      },
    ],
  },
];

export function getNavForRole(role) {
  return PORTAL_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

export function flattenNav(role) {
  return getNavForRole(role).flatMap((group) => group.items);
}
