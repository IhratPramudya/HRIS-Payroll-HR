# HRIS — Sistem Informasi SDM

Aplikasi HRIS (Human Resource Information System) full-stack yang mencakup 5 modul utama:

1. **Core HR** — Data karyawan, departemen, jabatan, struktur organisasi (atasan/bawahan)
2. **Attendance & Leave** — Clock in/out, riwayat absensi, pengajuan & persetujuan cuti/izin
3. **Payroll** — Proses penggajian bulanan, perhitungan BPJS & estimasi PPh21, slip gaji
4. **Recruitment** — Lowongan pekerjaan, pipeline kandidat (kanban), penjadwalan interview, auto-create karyawan saat kandidat di-hire
5. **Performance & Training** — Goal/KPI karyawan, penilaian kinerja (performance review), program pelatihan & pendaftaran

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials provider, JWT session) dengan role-based access control (RBAC)
- **Styling:** Tailwind CSS
- **Validasi:** Zod
- **Pola:** Server Components untuk data fetching, Server Actions untuk mutasi (tanpa API route terpisah untuk sebagian besar fitur)

## Role & Hak Akses

| Role | Akses |
|---|---|
| **ADMIN** | Akses penuh ke seluruh sistem |
| **HR** | Mengelola karyawan, departemen, payroll, rekrutmen, approve cuti, buat training/review |
| **MANAGER** | Melihat tim, approve cuti anak buah, mengisi performance review |
| **EMPLOYEE** | Self-service: absensi, ajukan cuti, isi goal pribadi, daftar training |

## Menjalankan Project (di komputer Anda)

Project ini **ditulis lengkap tanpa `node_modules`** (dibuat di lingkungan sandbox tanpa akses npm registry). Jalankan langkah berikut di komputer Anda yang memiliki akses internet normal:

### 1. Prasyarat
- Node.js 18.18+ 
- PostgreSQL (lokal, Docker, atau layanan cloud seperti Supabase/Neon/Railway)

### 2. Install dependencies

```bash
cd hris-nextjs
npm install
```

### 3. Konfigurasi environment

```bash
cp .env.example .env
```

Edit `.env` dan isi:
- `DATABASE_URL` — connection string PostgreSQL Anda
- `NEXTAUTH_SECRET` — string acak (generate dengan `openssl rand -base64 32`)

### 4. Setup database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Perintah di atas akan membuat seluruh tabel dan mengisi data contoh (departemen, karyawan, akun demo, dsb).

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Akun Demo (setelah seed)

| Email | Password | Role |
|---|---|---|
| admin@hris.com | password123 | Admin |
| hr@hris.com | password123 | HR |
| manager@hris.com | password123 | Manager |
| budi@hris.com | password123 | Employee |

## Struktur Project

```
hris-nextjs/
├── prisma/
│   ├── schema.prisma      # Skema database lengkap (14 model)
│   └── seed.ts            # Data contoh
├── src/
│   ├── app/
│   │   ├── login/              # Halaman login
│   │   ├── (dashboard)/        # Route group terproteksi (butuh login)
│   │   │   ├── dashboard/      # Ringkasan statistik
│   │   │   ├── employees/      # Modul Core HR
│   │   │   ├── departments/
│   │   │   ├── attendance/     # Modul Attendance
│   │   │   ├── leave/          # Modul Leave
│   │   │   ├── payroll/        # Modul Payroll
│   │   │   ├── recruitment/    # Modul Recruitment
│   │   │   ├── performance/    # Modul Performance
│   │   │   └── training/       # Modul Training
│   │   └── api/auth/           # NextAuth route handler
│   ├── components/
│   │   ├── layout/         # Sidebar, Topbar
│   │   └── ui/              # Komponen UI reusable
│   ├── lib/
│   │   ├── auth.ts          # Konfigurasi NextAuth
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── rbac.ts          # Helper proteksi role
│   │   ├── payroll.ts        # Logika kalkulasi gaji/pajak
│   │   └── utils.ts
│   └── middleware.ts         # Proteksi route otomatis
└── package.json
```

## Catatan Penting & Batasan

Supaya ekspektasi jelas — ini adalah **fondasi HRIS yang solid dan fungsional**, bukan produk enterprise yang sudah diaudit penuh:

- **Perhitungan PPh21/BPJS** di `src/lib/payroll.ts` adalah **penyederhanaan** untuk demonstrasi alur payroll (tarif progresif, PTKP TK/0 saja). Untuk produksi, wajib direview ulang oleh konsultan pajak/payroll sesuai regulasi terbaru (termasuk skema TER) dan status PTKP masing-masing karyawan.
- Belum ada: upload dokumen/file (CV, kontrak), notifikasi email, export PDF/Excel, audit log, multi-tenant, test otomatis (unit/e2e).
- Rate limiting, 2FA, dan hardening keamanan tambahan belum diimplementasikan — tambahkan sebelum deploy ke produksi dengan data nyata.
- Build belum dijalankan di lingkungan pengembangan (sandbox ini tidak memiliki akses ke npm registry), sehingga `npm run build` perlu dijalankan dan diperiksa pertama kali di komputer Anda. Seluruh file sudah dicek sintaksnya, tapi type-check penuh terhadap library (Next.js/Prisma types) baru bisa terjadi setelah `npm install`.

## Pengembangan Lanjutan yang Disarankan

- Tambah modul: dokumen karyawan, reimbursement, aset perusahaan
- Export payslip ke PDF
- Dashboard analytics lebih kaya (grafik headcount, turnover, dsb.)
- Integrasi email (reset password, notifikasi approval)
- Audit trail untuk setiap perubahan data sensitif (gaji, status karyawan)
