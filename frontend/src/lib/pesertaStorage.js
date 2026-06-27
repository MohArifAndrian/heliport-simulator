import { DEFAULT_MAHASISWA_STATUS } from "@/lib/mahasiswaStatus";
import { getAllRegistryItems, addRegistryItem } from "@/lib/registryStorage";
import { verifyPassword, hashPassword } from "@/lib/userStorage";

function toProfile(record, registryType) {
  return {
    id: record.id,
    registryType,
    nama: record.nama,
    email: record.email || "",
    status: record.status || DEFAULT_MAHASISWA_STATUS,
    nim: record.nim || "",
    nip: record.nip || "",
    prodi: record.prodi || "",
    kelas: record.kelas || "",
    institusi: record.institusi || "",
    unitKerja: record.unitKerja || "",
    jabatan: record.jabatan || "",
  };
}

export async function ensureDefaultPesertaAccounts() {
  const mahasiswa = await getAllRegistryItems("mahasiswa");
  if (mahasiswa.length > 0) return;

  await addRegistryItem("mahasiswa", {
    nama: "Peserta Demo",
    status: DEFAULT_MAHASISWA_STATUS,
    nim: "2110512345",
    email: "peserta.demo@poltekbang.id",
    prodi: "Teknik Penerbangan",
    kelas: "A",
    institusi: "Politeknik Penerbangan Indonesia",
    passwordHash: hashPassword("peserta123"),
    active: true,
  });
}

async function findByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const mahasiswa = await getAllRegistryItems("mahasiswa");
  const mhs = mahasiswa.find((r) => String(r.email || "").trim().toLowerCase() === normalized);
  if (mhs?.passwordHash) {
    return { record: mhs, registryType: "mahasiswa" };
  }

  const diklat = await getAllRegistryItems("peserta-diklat");
  const p = diklat.find((r) => String(r.email || "").trim().toLowerCase() === normalized);
  if (p?.passwordHash) {
    return { record: p, registryType: "peserta-diklat" };
  }

  return null;
}

export async function authenticatePeserta(email, password) {
  await ensureDefaultPesertaAccounts();

  const found = await findByEmail(email);
  if (!found) return null;

  const { record, registryType } = found;
  if (record.active === false) return null;
  if (!verifyPassword(password, record.passwordHash)) return null;

  return toProfile(record, registryType);
}

export async function getPesertaById(registryType, id) {
  const items = await getAllRegistryItems(registryType);
  const record = items.find((item) => item.id === id);
  if (!record || record.active === false) return null;
  return toProfile(record, registryType);
}
