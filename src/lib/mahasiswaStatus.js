/** Opsi status peserta untuk data mahasiswa / pengguna simulator. */

export const MAHASISWA_STATUS_OPTIONS = [
  { value: "Mahasiswa", label: "Mahasiswa" },
  { value: "Peserta Diklat", label: "Peserta Diklat" },
  { value: "Praktisi", label: "Praktisi / Profesi" },
  { value: "Lainnya", label: "Lainnya" },
];

export const DEFAULT_MAHASISWA_STATUS = "Mahasiswa";

export function getMahasiswaStatusLabel(value) {
  return MAHASISWA_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "-";
}
