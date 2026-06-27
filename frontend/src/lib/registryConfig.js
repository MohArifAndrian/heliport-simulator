/** Registry definitions for dosen data management sidebar. */

import { DEFAULT_MAHASISWA_STATUS, MAHASISWA_STATUS_OPTIONS } from "@/lib/mahasiswaStatus";

export const REGISTRY_TYPES = {
  mahasiswa: {
    label: "Data Mahasiswa",
    file: "mahasiswa.json",
    path: "/dashboard/mahasiswa",
    description: "Daftar mahasiswa untuk referensi penilaian dan pengumpulan tugas.",
    fields: [
      { key: "nama", label: "Nama Lengkap", required: true, placeholder: "cth: Budi Santoso" },
      {
        key: "status",
        label: "Status",
        required: true,
        type: "select",
        options: MAHASISWA_STATUS_OPTIONS,
        defaultValue: DEFAULT_MAHASISWA_STATUS,
      },
      { key: "nim", label: "NIM", required: true, placeholder: "cth: 2110512345" },
      { key: "email", label: "Email Login", type: "email", required: true, placeholder: "cth: budi@poltekbang.id" },
      { key: "password", label: "Kata Sandi Login", type: "password", placeholder: "Min. 6 karakter (untuk login peserta)" },
      { key: "prodi", label: "Program Studi", placeholder: "cth: Teknik Penerbangan" },
      { key: "kelas", label: "Kelas", placeholder: "cth: A" },
      { key: "institusi", label: "Institusi", placeholder: "cth: Politeknik Penerbangan" },
    ],
    searchKeys: ["nama", "status", "nim", "email", "prodi", "kelas", "institusi"],
    tableColumns: ["nama", "status", "nim", "email", "prodi", "kelas", "institusi"],
  },
  "peserta-diklat": {
    label: "Peserta Diklat",
    file: "peserta-diklat.json",
    path: "/dashboard/peserta-diklat",
    description: "Daftar peserta diklat dan pelatihan terkait simulator heliport.",
    fields: [
      { key: "nama", label: "Nama Lengkap", required: true, placeholder: "cth: Andi Wijaya" },
      { key: "nip", label: "NIP / NIK", required: true, placeholder: "cth: 198501012010011001" },
      { key: "email", label: "Email Login", type: "email", required: true, placeholder: "email@instansi.go.id" },
      { key: "password", label: "Kata Sandi Login", type: "password", placeholder: "Min. 6 karakter (untuk login peserta)" },
      { key: "unitKerja", label: "Unit Kerja", placeholder: "cth: Subdit Standardisasi" },
      { key: "jabatan", label: "Jabatan", placeholder: "cth: Pranata" },
      { key: "telepon", label: "Telepon", placeholder: "08xxxxxxxxxx" },
      { key: "diklatNama", label: "Nama Diklat", placeholder: "cth: Diklat Heliport Design" },
      { key: "institusi", label: "Institusi", placeholder: "cth: Kementerian Perhubungan" },
    ],
    searchKeys: ["nama", "nip", "email", "unitKerja", "jabatan", "diklatNama", "institusi"],
    tableColumns: ["nama", "nip", "email", "unitKerja", "diklatNama", "institusi"],
  },
  diklat: {
    label: "Kegiatan Diklat",
    file: "diklat.json",
    path: "/dashboard/diklat",
    description: "Data kegiatan diklat, periode pelaksanaan, dan keterangan.",
    fields: [
      { key: "nama", label: "Nama Diklat", required: true, placeholder: "cth: Diklat Desain Heliport" },
      { key: "kode", label: "Kode", placeholder: "cth: DHL-2026-01" },
      { key: "periode", label: "Periode", placeholder: "cth: Januari – Maret 2026" },
      { key: "tahun", label: "Tahun", placeholder: "cth: 2026" },
      { key: "lokasi", label: "Lokasi", placeholder: "cth: Poltekbang Surabaya" },
      { key: "keterangan", label: "Keterangan", textarea: true, placeholder: "Catatan tambahan…" },
    ],
    searchKeys: ["nama", "kode", "periode", "tahun", "lokasi"],
    tableColumns: ["nama", "kode", "periode", "tahun", "lokasi"],
  },
};

export function getRegistryConfig(type) {
  return REGISTRY_TYPES[type] ?? null;
}

export function isValidRegistryType(type) {
  return Boolean(REGISTRY_TYPES[type]);
}
