# ENV_SETUP.md

## Platform Website Terpadu JMMI ITS — Environment Setup & Onboarding

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** ARCHITECTURE.md, DATABASE_SCHEMA.md, CODING_CONVENTIONS.md (semua v1.0)
**Repo:** `comdevjmmi/jmmi-its`

---

## 1. COMPLETE .env.example TEMPLATE

Salin sebagai `.env.local` (untuk Next.js — **JANGAN** commit file ini dengan value asli, hanya `.env.example` yang di-commit).

```bash
# =========================================
# APP CONFIG
# =========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="JMMI ITS"
NEXT_PUBLIC_DEFAULT_LOCALE=id

# =========================================
# DATABASE
# =========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jmmi_its_dev?schema=public"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/jmmi_its_test?schema=public"

# =========================================
# AUTH / JWT
# =========================================
JWT_SECRET="dev-jwt-secret-CHANGE-IN-PRODUCTION-min-32-chars"
JWT_REFRESH_SECRET="dev-refresh-secret-CHANGE-IN-PRODUCTION-min-32-chars"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_EXPIRY="7d"
BCRYPT_SALT_ROUNDS=10

# =========================================
# STORAGE (S3-Compatible — mis. Supabase Storage)
# =========================================
STORAGE_ENDPOINT="https://<project-ref>.supabase.co/storage/v1/s3"
STORAGE_REGION="auto"
STORAGE_ACCESS_KEY="dev-access-key-placeholder"
STORAGE_SECRET_KEY="dev-secret-key-placeholder"
STORAGE_BUCKET="jmmi-its-dev"
STORAGE_BUCKET_TEST="jmmi-its-test"
STORAGE_PUBLIC_URL="https://<project-ref>.supabase.co/storage/v1/object/public/jmmi-its-dev"
STORAGE_MAX_UPLOAD_MB=5

# =========================================
# WHATSAPP NOTIFICATION (Baileys Standalone Service)
# =========================================
BAILEYS_SERVICE_URL="http://localhost:4000"
BAILEYS_SERVICE_API_KEY="dev-internal-api-key-placeholder"
BAILEYS_TEST_PHONE_NUMBER="628111111111"

# =========================================
# RATE LIMITING (OTP Tracking — nilai terkunci, JANGAN diubah tanpa persetujuan tim)
# =========================================
OTP_RATE_LIMIT_MAX=3
OTP_RATE_LIMIT_WINDOW_MINUTES=10
OTP_EXPIRY_MINUTES=5

# =========================================
# CI / DEPLOYMENT (referensi — biasanya di-set di platform hosting, bukan .env lokal)
# =========================================
# VERCEL_URL=                # auto-injected oleh Vercel, tidak perlu diisi manual
# NETLIFY_URL=                # auto-injected oleh Netlify, tidak perlu diisi manual
```

**Aturan Wajib:**

- `.env.example` (tanpa value asli, boleh pakai placeholder seperti di atas) **WAJIB** ter-commit ke repo.
- `.env.local` (dengan value asli development) **TIDAK PERNAH** di-commit — pastikan ada di `.gitignore` (verifikasi: `.env*.local` sudah ter-cover, hanya `.env.example` yang dikecualikan).
- Setiap kali developer menambah environment variable baru saat implementasi modul, **update `.env.example` di PR yang sama** — jangan biarkan file ini basi dibanding kode aktual.
- Secret production (`JWT_SECRET`, `STORAGE_SECRET_KEY`, `BAILEYS_SERVICE_API_KEY`, dll) dikelola HANYA lewat Environment Variables di platform hosting (Vercel/Railway) — tidak pernah di-share via chat, dokumen, atau commit.

---

## 2. LOCAL DEVELOPMENT ONBOARDING STEPS

### Prasyarat

- Node.js `v20.10.0` (sesuai `.nvmrc` existing — gunakan `nvm use` jika pakai NVM)
- PNPM `v9.x`
- PostgreSQL `v15+` terinstall lokal, ATAU Docker (opsi lebih mudah, lihat 2.2)
- Git

### 2.1 Clone & Install Dependencies

```bash
git clone https://github.com/comdevjmmi/jmmi-its.git
cd jmmi-its

# Pastikan Node version sesuai .nvmrc
nvm use

# Install dependencies (frozen lockfile, konsisten dengan CI)
pnpm install --frozen-lockfile
```

### 2.2 Setup Database PostgreSQL

**Opsi A — Docker (disarankan, lebih cepat & konsisten antar-developer):**

```bash
docker run --name jmmi-its-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jmmi_its_dev \
  -p 5432:5432 \
  -d postgres:15

# Buat database test terpisah di container yang sama
docker exec -it jmmi-its-postgres psql -U postgres -c "CREATE DATABASE jmmi_its_test;"
```

**Opsi B — PostgreSQL Lokal (tanpa Docker):**

```bash
# Pastikan service PostgreSQL berjalan, lalu:
createdb jmmi_its_dev
createdb jmmi_its_test
```

### 2.3 Konfigurasi Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local sesuai kebutuhan lokal — minimal DATABASE_URL harus sesuai setup 2.2
# JWT_SECRET/JWT_REFRESH_SECRET boleh pakai placeholder di .env.example untuk development
```

### 2.4 Prisma Migration & Client Generation

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan seluruh migrasi (termasuk migrasi RBAC baru: users, permissions, dll)
npx prisma migrate dev
```

> **Catatan khusus migrasi Auth:** Jika bekerja di fase transisi `admins` → `users` (lihat ARCHITECTURE.md Section 5), pastikan menjalankan migrasi dalam URUTAN additive-first sesuai dokumen tsb — jangan skip langsung ke migrasi yang men-drop tabel `admins` di environment development kecuali sudah dikoordinasikan dengan tim (bisa merusak data test rekan lain jika di-share).

### 2.5 Jalankan Database Seeder

```bash
npx prisma db seed
```

Seeder ini akan menjalankan (sesuai DATABASE_SCHEMA.md Section 5.4 & CODING_CONVENTIONS.md Section 4.2):

- 1 akun `superadmin` development (`superadmin@jmmi-its.com`)
- Seed data `permissions` dasar (10 module+action)
- Data dummy Room, ItemAsset, Event, Content untuk testing modul

**Cek hasil seed:**

```bash
npx prisma studio
# Buka browser di http://localhost:5555 untuk verifikasi visual data ter-seed
```

### 2.6 (Opsional) Jalankan Baileys Standalone Service

Diperlukan HANYA jika sedang mengerjakan/testing modul yang butuh notifikasi WA nyata (Peminjaman, Event RSVP). Jika tidak, `MockNotificationProvider` sudah cukup untuk development modul lain.

```bash
# Di terminal terpisah, clone/masuk ke folder service Baileys (repo terpisah)
cd ../jmmi-baileys-service
pnpm install
pnpm dev
# Scan QR code yang muncul di terminal dengan WhatsApp nomor testing
```

### 2.7 Jalankan Development Server

```bash
pnpm dev
# Server berjalan di http://localhost:3000
```

### 2.8 Verifikasi Setup Berhasil

```bash
# Jalankan seluruh check yang juga dipakai CI — pastikan semua PASS sebelum mulai coding
pnpm run lint:strict
pnpm run typecheck
pnpm run format:check
pnpm run test
```

**Checklist Onboarding Selesai:**

- [ ] `pnpm dev` berjalan tanpa error, halaman `http://localhost:3000` bisa diakses
- [ ] Login dengan akun `superadmin@jmmi-its.com` (password sesuai seed script) berhasil
- [ ] `npx prisma studio` menampilkan data ter-seed dengan benar
- [ ] Seluruh command di Step 2.8 PASS tanpa error

---

## 3. AI AGENT SETUP & GUARDRAILS

Bagian ini WAJIB dibaca oleh AI Coding Agent (Antigravity atau sejenisnya) sebelum melakukan perubahan kode apapun di repository ini.

### 3.1 Cara Membaca Environment Variables

- AI Agent **TIDAK PERNAH** membaca isi file `.env.local` (berisi secret asli) sebagai bagian dari konteks kerja — jika perlu tahu variable APA yang tersedia, baca `.env.example` (berisi placeholder, aman dibaca) di Section 1 dokumen ini.
- Saat generate kode yang butuh environment variable BARU (belum ada di `.env.example`), AI Agent WAJIB:
  1. Menambahkan entry baru ke `.env.example` dengan placeholder yang jelas (bukan value asli apapun).
  2. Menyebutkan secara eksplisit ke developer bahwa variable baru ini perlu diisi manual di `.env.local` masing-masing dan di platform hosting untuk staging/production.
  3. **TIDAK PERNAH** menebak atau mengarang value asli (API key, secret, connection string) — jika perlu value asli untuk testing, tanyakan ke developer, jangan simulasikan dengan value palsu yang terlihat asli (bisa membingungkan dan berisiko ter-commit tidak sengaja).

### 3.2 Run Test Sebelum Commit (Wajib)

Sesuai CODING_CONVENTIONS.md Section 2.3 (PR Checklist), AI Agent yang men-generate kode WAJIB menjalankan urutan berikut SEBELUM menyarankan commit/PR ke developer:

```bash
pnpm run lint:strict     # ESLint, max warnings 0
pnpm run typecheck       # tsc --noEmit
pnpm run format:check    # Prettier check
pnpm run test            # Jest test suite
```

Jika salah satu gagal, AI Agent **memperbaiki dulu** sebelum menyatakan tugas selesai — bukan menyerahkan kode yang gagal check ke developer dengan asumsi "akan diperbaiki nanti". Ini konsisten dengan prinsip PR Checklist di CODING_CONVENTIONS.md: kode AI-generated tetap harus lulus gate yang sama dengan kode manual.

### 3.3 Instruksi Keamanan — Mencegah Hardcode Secret/Credentials

**Larangan mutlak untuk AI Agent, TANPA PENGECUALIAN:**

1. **JANGAN PERNAH** menuliskan value asli API key, JWT secret, database password, atau credential apapun langsung di dalam kode (hardcoded string) — bahkan untuk keperluan "testing sementara" atau "contoh". Selalu gunakan `process.env.VARIABLE_NAME`.
2. **JANGAN PERNAH** meng-commit file `.env.local`, `.env.production`, atau varian `.env.*` lain selain `.env.example` — jika AI Agent mendeteksi file semacam ini ter-stage untuk commit, WAJIB memperingatkan developer dan menyarankan `.gitignore` diperbaiki.
3. **JANGAN PERNAH** menempatkan credential asli di komentar kode, dokumentasi commit message, atau nama branch.
4. **JANGAN PERNAH** meng-generate atau menyarankan nilai default untuk `JWT_SECRET`/secret production lain yang terlihat "aman dipakai langsung" — selalu tandai jelas sebagai `CHANGE-IN-PRODUCTION` seperti contoh di Section 1, dan ingatkan bahwa value tsb WAJIB diganti sebelum deploy.
5. Jika AI Agent menemukan credential yang ter-expose secara tidak sengaja di kode existing (mis. hasil audit menemukan API key hardcoded), **laporkan sebagai temuan security kritis** ke developer — jangan diam-diam "diperbaiki" tanpa memberi tahu (developer perlu tahu untuk rotate credential yang ter-expose tsb, bukan hanya menghapus dari kode).
6. Untuk kebutuhan testing yang butuh koneksi ke service eksternal (S3, Baileys), gunakan environment TEST/development yang sudah didefinisikan di Section 1 (`STORAGE_BUCKET_TEST`, `BAILEYS_TEST_PHONE_NUMBER`) — JANGAN PERNAH mengarahkan test otomatis ke resource production.

### 3.3 Standard Context Checklist untuk AI Agent Sebelum Mulai Task

Sesuai CODING_CONVENTIONS.md Section 2.2 (Standard Prompt Template), sebelum generate kode AI Agent memverifikasi:

- [ ] Sudah membaca `ARCHITECTURE.md` section relevan untuk pola layering
- [ ] Sudah membaca `API_CONTRACT.md` section relevan untuk kontrak endpoint
- [ ] Sudah membaca `DATABASE_SCHEMA.md` untuk model Prisma terkait
- [ ] Sudah scan `src/components/` existing (untuk task Frontend) — cek Section 4 `UI_COMPONENT_MAP.md` sebelum membuat komponen baru
- [ ] Sudah memverifikasi environment variable yang dibutuhkan sudah ada di `.env.example` — jika belum, tambahkan (Section 3.1 di atas)
- [ ] TIDAK ada asumsi keputusan arsitektur baru yang dibuat sepihak — jika ada gap, tanyakan ke developer, jangan berasumsi

---

## 4. TROUBLESHOOTING UMUM

| Masalah                                         | Kemungkinan Penyebab                                                            | Solusi                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `prisma migrate dev` gagal dengan error koneksi | `DATABASE_URL` salah / PostgreSQL belum jalan                                   | Verifikasi container Docker/service PostgreSQL aktif, cek `DATABASE_URL` di `.env.local`                                                                     |
| Login gagal setelah seed                        | Password seed tidak sesuai yang dicoba                                          | Cek `prisma/seed.ts` untuk password default yang di-hash, atau reset via `prisma migrate reset` lalu seed ulang                                              |
| Notifikasi WA tidak terkirim di development     | Baileys service tidak berjalan / `BAILEYS_SERVICE_URL` salah                    | Pastikan Step 2.6 dijalankan jika sedang test modul terkait notifikasi; jika tidak butuh WA asli, pastikan `MockNotificationProvider` yang dipakai (default) |
| Upload foto gagal                               | `STORAGE_*` env belum diisi / bucket belum dibuat di provider                   | Verifikasi kredensial S3-compatible storage development, pastikan bucket `jmmi-its-dev` sudah dibuat di provider (Supabase Storage/dll)                      |
| CI PASS lokal tapi gagal di GitHub Actions      | Environment variable CI berbeda dari lokal, atau `pnpm-lock.yaml` tidak sinkron | Jalankan `pnpm install --frozen-lockfile` (bukan `pnpm install` biasa) untuk mereplikasi environment CI persis                                               |

---

## OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

Tidak ada Open Decision baru — dokumen ini murni operasional/setup, mengikuti seluruh keputusan arsitektur yang sudah terkunci di dokumen-dokumen sebelumnya.

---

_Dokumen tersisa dari documentation map: `DESIGN_SYSTEM.md` (template placeholder untuk diisi tim UI/UX) dan `GLOSSARY.md` (istilah domain JMMI untuk AI agent). Dengan `ENV_SETUP.md` selesai, seluruh 9 dokumen teknis inti + panduan onboarding sudah lengkap sebagai Single Source of Truth tim._

```

```
