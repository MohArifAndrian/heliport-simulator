import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;

  await prisma.admin.upsert({
    where: { email: "admin@heliport.id" },
    update: {},
    create: {
      email: "admin@heliport.id",
      nama: "Administrator",
      password: await bcrypt.hash("admin123", rounds),
    },
  });

  const pengajar = await prisma.pengajar.upsert({
    where: { email: "dosen@heliport.id" },
    update: {},
    create: {
      nid: "DOSEN001",
      namaLengkap: "Dosen Pengampu",
      prodi: "Teknik Penerbangan",
      email: "dosen@heliport.id",
      password: await bcrypt.hash("dosen123", rounds),
    },
  });

  await prisma.siswa.upsert({
    where: { email: "mahasiswa@heliport.id" },
    update: {},
    create: {
      nama: "Mahasiswa Contoh",
      nim: "2024001",
      prodi: "Teknik Penerbangan",
      category: "Mahasiswa",
      kelas: "A",
      email: "mahasiswa@heliport.id",
      password: await bcrypt.hash("siswa123", rounds),
    },
  });

  await prisma.tugas.upsert({
    where: { enrolCode: "HELI2024" },
    update: {},
    create: {
      judul: "Desain Heliport Simulator",
      deskripsi: "Susun layout heliport sesuai regulasi ICAO Annex 14 Vol II.",
      enrolCode: "HELI2024",
      pengajarId: pengajar.id,
    },
  });

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
