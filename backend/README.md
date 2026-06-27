# Heliport Simulator API

REST API berbasis Node.js + Express + Prisma + MySQL untuk sistem LMS Heliport Design Simulator.

## Tech Stack

- **Express 5** — HTTP server
- **Prisma** — ORM & migrasi database
- **MySQL** — database
- **Zod** — validasi request
- **bcrypt** — hash password
- **Multer** — upload PDF submission

## Setup (MAMP)

```bash
cd backend
cp .env.example .env

npm install
npm run db:generate
npm run db:push
npm run db:seed   # opsional
npm run dev
```

API berjalan di `http://localhost:4000`.

## Autentikasi

Semua endpoint (kecuali login/register) membutuhkan header:

```
Authorization: Bearer <token>
```

| Role | Login | Secret env |
|------|-------|------------|
| Admin | `POST /api/admin/login` | `ADMIN_SESSION_SECRET` |
| Pengajar | `POST /api/pengajar/login` | `PENGAJAR_SESSION_SECRET` |
| Siswa | `POST /api/siswa/login` atau `POST /api/siswa/register` | `SISWA_SESSION_SECRET` |

## Endpoint

### Admin — `/api/admin`

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| POST | `/login` | Public | Login |
| GET | `/session` | Token | Cek sesi |
| GET | `/me` | Admin | Profil sendiri |
| PATCH | `/me` | Admin | Update profil/password |
| GET | `/` | Admin | List admin (`?page=&limit=`) |
| GET/POST/PUT/PATCH/DELETE | `/:id` | Admin | CRUD admin |

### Pengajar — `/api/pengajar`

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| POST | `/login` | Public | Login (register dinonaktifkan) |
| GET | `/session` | Token | Cek sesi |
| GET/PATCH | `/me` | Pengajar | Profil sendiri |
| GET/POST/PUT/PATCH/DELETE | `/` & `/:id` | Admin | CRUD pengajar |

### Siswa — `/api/siswa`

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| POST | `/register` | Public | Daftar akun |
| POST | `/login` | Public | Login |
| GET | `/session` | Token | Cek sesi |
| GET/PATCH | `/me` | Siswa | Profil sendiri |
| GET/POST/PUT/PATCH/DELETE | `/` & `/:id` | Admin | CRUD siswa |

### Tugas — `/api/tugas`

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | `/siswa` | Siswa | List semua tugas guru |
| GET | `/siswa/:id` | Siswa | Detail tugas |
| POST | `/join` | Siswa | Join via kode enrol |
| GET | `/pengajar` | Pengajar | List tugas milik sendiri |
| GET | `/` | Admin | List semua tugas |
| GET | `/:id` | Admin/Pengajar | Detail tugas |
| POST/PUT/PATCH/DELETE | `/` & `/:id` | Pengajar | CRUD tugas sendiri |

**Filter siswa** (`GET /siswa`):
- `?joined=true|false` — sudah/belum join
- `?submitted=true|false` — sudah/belum upload PDF
- `?page=1&limit=20` — pagination

### Pengumpulan Tugas — `/api/pengumpulan-tugas`

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | `/admin` | Admin | List semua pengumpulan |
| GET | `/admin/:id` | Admin | Detail |
| GET | `/admin/:id/pdf` | Admin | Download PDF |
| GET | `/siswa` | Siswa | List pengumpulan sendiri |
| GET | `/siswa/:id/pdf` | Siswa | Download PDF sendiri |
| POST | `/` | Siswa | Submit PDF (`tugas_id` + file) |
| PUT/PATCH | `/:id` | Siswa | Update PDF |
| GET | `/pengajar` | Pengajar | List pengumpulan tugas sendiri |
| GET | `/pengajar/:id/pdf` | Pengajar | Download PDF siswa |
| PATCH | `/:id/nilai` | Pengajar | Beri nilai (setelah PDF diserahkan) |

## Response format

**Sukses:**
```json
{ "success": true, "data": { ... } }
```

**List dengan pagination:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

**Error:**
```json
{ "success": false, "error": "Pesan error" }
```

## Akun seed

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@heliport.id | admin123 |
| Pengajar | dosen@heliport.id | dosen123 |
| Siswa | mahasiswa@heliport.id | siswa123 |

## Alur siswa

1. `POST /api/siswa/register` atau login
2. `GET /api/tugas/siswa` — lihat tugas
3. `POST /api/tugas/join` — join dengan kode enrol
4. `POST /api/pengumpulan-tugas` — upload PDF
