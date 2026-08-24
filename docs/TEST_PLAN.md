# TEST_PLAN.md

## Platform Website Terpadu JMMI ITS — Test Plan

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** PRD.md, ARCHITECTURE.md, DATABASE_SCHEMA.md, API_CONTRACT.md, CODING_CONVENTIONS.md, SPRINT_BACKLOG.md (semua v1.0)
**Tim QA:** QA1, QA2

---

## 1. STRATEGI TESTING

### 1.1 Testing Pyramid untuk Proyek Ini

```
                    ▲
                   / \
                  / E2E \          <- Sedikit, mahal, fokus critical path saja
                 /-------\            (Playwright / manual pass)
                /Integration\      <- Sedang, fokus API Handler + Prisma
               /-------------\        (Jest/Vitest + test DB)
              /   Unit Test    \   <- Banyak, murah, cepat
             /-------------------\    (Jest/Vitest, business logic di Service layer)
```

Prinsip alokasi: modul dengan risiko bisnis tinggi (booking conflict, RBAC, RSVP dedup) mendapat coverage lebih tebal di ketiga layer piramida; modul risiko rendah (mis. halaman statis identitas) cukup di layer Unit + manual QA visual.

### 1.2 Unit Testing (Jest/Vitest)

**Target:** Business logic di **Service layer** — layer inilah yang paling padat logic (overlap-check, quota-check, permission-check), sesuai CODING_CONVENTIONS.md Section 3.2.

**Prinsip:**

- Mock Repository layer (tidak menyentuh DB asli) — test murni logic keputusan (branch: sukses/gagal/edge case).
- Mock `notificationService` dan `storageService` (external dependency) — unit test tidak boleh bergantung pada Baileys/S3 asli.
- Naming: `<service-name>.test.ts`, co-located di `__tests__/` sesuai struktur existing repo.
- Target: setiap public method di Service layer punya minimal 1 happy-path test + 1 edge-case test.

```typescript
// Contoh pola unit test — room-booking-service.test.ts
describe('roomBookingService.submit', () => {
  it('berhasil submit booking pada slot kosong', async () => {
    /* ... */
  });
  it('melempar AppError BOOKING_CONFLICT saat slot bentrok', async () => {
    /* ... */
  });
  it('tetap submit booking meski notificationService gagal kirim WA', async () => {
    /* ... */
  });
});
```

### 1.3 Integration Testing (API Handlers & Prisma)

**Target:** Route Handler lengkap (`app/api/**/route.ts`) dari request masuk sampai response keluar, TERMASUK middleware (`withAuth`, `withRbac`) dan koneksi ke **test database** asli (bukan mock Prisma).

**Setup:**

- Database test terpisah (lihat Section 4.1) — di-reset (`prisma migrate reset` atau truncate manual) sebelum setiap test suite run, bukan sebelum setiap test case (demi kecepatan), dengan seed data minimal per suite.
- HTTP client testing: Next.js Route Handler dapat ditest langsung dengan memanggil handler function (import langsung), atau via `supertest`-style request ke server test lokal — pilih pendekatan yang konsisten dengan setup Jest/Vitest existing repo.
- Test mencakup: validasi Zod (400), RBAC enforcement (401/403), business logic (409 conflict/quota/dedup), response shape sesuai `ApiSuccessResponse`/`ApiErrorResponse`.

```typescript
// Contoh pola integration test — room-bookings.integration.test.ts
describe('POST /api/room-bookings', () => {
  it('mengembalikan 201 dengan status pending untuk booking valid', async () => {
    /* ... */
  });
  it('mengembalikan 409 BOOKING_CONFLICT untuk slot bentrok', async () => {
    /* ... */
  });
  it('mengembalikan 400 VALIDATION_ERROR untuk endDate < startDate', async () => {
    /* ... */
  });
});

describe('POST /api/room-bookings/:id/approve', () => {
  it('mengembalikan 403 FORBIDDEN_PERMISSION untuk biro tanpa permission', async () => {
    /* ... */
  });
  it('mengembalikan 200 dan mengubah status approved untuk admin', async () => {
    /* ... */
  });
});
```

### 1.4 E2E Testing (Playwright / Manual Pass)

**Target:** Critical user journey lintas-halaman, dari sisi browser sungguhan — bukan menguji setiap endpoint (itu tugas integration test), tapi memverifikasi **alur bisnis utuh** berfungsi dari perspektif pengguna.

**Critical Path yang WAJIB di-cover (prioritas E2E, sesuai risiko di Section 2):**

1. Jamaah submit Peminjaman Tempat → Admin approve → Jamaah menerima notifikasi (mock/log verifikasi) → Jamaah cek status via OTP.
2. Jamaah RSVP Event sampai kuota penuh → RSVP ke-N+1 gagal dengan pesan jelas.
3. Superadmin membuat akun Biro dengan permission scoped → Biro login → Biro hanya bisa akses modul yang di-assign.
4. Biro create shorten link → coba akses link milik Biro lain → ditolak.
5. Login Superadmin → override slug shorten link yang sudah dipakai.

**Pendekatan:** Jika waktu tim terbatas (mengingat timeline 14 hari), 5 critical path di atas WAJIB Playwright otomatis; jalur lain boleh **manual pass checklist** oleh QA1/QA2 (didokumentasikan, bukan sekadar "dicoba lalu lupa").

### 1.5 Load/Stress Testing (autocannon / k6)

**Target:** Endpoint dengan risiko _race condition_ dan/atau throughput tinggi — sesuai SPRINT_BACKLOG.md Task 7.7.

**Skenario wajib:**

- Concurrent request ke `POST /api/room-bookings` & `POST /api/item-bookings` pada slot/stok yang sama (lihat Section 3.1).
- Concurrent request ke `POST /api/events/:id/rsvp` pada event kuota terbatas (lihat Section 3.2).
- Throughput redirect `GET /s/[shortCode]` (mengingat ini endpoint paling sering diakses publik) — target latensi tetap rendah di bawah beban (NFR-PERF-03).

**Tool:** `autocannon` untuk load test cepat (throughput/latency), `k6` untuk skenario lebih kompleks dengan scripting (race condition spesifik dengan timing terkontrol). Tim bebas memilih salah satu asal konsisten dipakai di seluruh skenario Section 3.

---

## 2. MATRIX PRIORITAS RISIKO MODUL

| Modul                              | Level Risiko | Alasan                                                                                                                                               | Target Coverage (Unit) | Target Coverage (Integration) |               E2E Wajib?                |
| ---------------------------------- | :----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------: | :---------------------------: | :-------------------------------------: |
| **Auth & RBAC**                    |   **HIGH**   | Fondasi seluruh sistem — celah di sini berdampak ke SEMUA modul lain; kebocoran data/lateral access adalah risiko keamanan langsung                  |         ≥ 90%          |             ≥ 85%             |                   Ya                    |
| **Room/Item Booking Engine**       |   **HIGH**   | Double-booking/over-lending merusak kepercayaan Jamaah & operasional fisik masjid; melibatkan `$transaction` yang rawan race condition               |         ≥ 85%          |             ≥ 80%             |                   Ya                    |
| **Event RSVP (Quota + Dedup)**     |   **HIGH**   | Race condition kuota & duplikasi RSVP berdampak langsung ke pengalaman Jamaah saat pendaftaran acara ramai                                           |         ≥ 85%          |             ≥ 80%             |                   Ya                    |
| **Baileys Notification Service**   |  **MEDIUM**  | Kegagalan kirim tidak boleh menggagalkan proses utama (sudah di-desain fail-safe), tapi risiko _unofficial API_ (disconnect/ban) tetap perlu diawasi |         ≥ 70%          |     ≥ 60% (mock provider)     |     Tidak (manual verifikasi cukup)     |
| **Shortlink Analytics & Override** |  **MEDIUM**  | Risiko utama adalah RBAC scoping (Biro lihat data Biro lain) dan override slug oleh non-Superadmin — bukan data-loss langsung                        |         ≥ 75%          |             ≥ 70%             | Ya (khusus skenario override & scoping) |
| **Lost & Found**                   |     LOW      | One-directional, tidak ada validasi kompleks/race condition; risiko utama hanya upload file & RBAC posting                                           |         ≥ 60%          |             ≥ 60%             |                  Tidak                  |
| **Financial Reports**              |     LOW      | Input manual sederhana, tanpa agregasi otomatis; risiko rendah karena tidak ada kalkulasi kompleks                                                   |         ≥ 60%          |             ≥ 60%             |                  Tidak                  |
| **Content/CMS (Blog)**             |     LOW      | Risiko utama hanya XSS di rich text render & permission publish/create; bukan data kritis operasional                                                |         ≥ 60%          |             ≥ 60%             |    Tidak (kecuali XSS test — wajib)     |
| **i18n & Halaman Publik Statis**   |     LOW      | Tidak ada business logic — risiko murni visual/konten hilang saat toggle bahasa                                                                      |          N/A           |              N/A              |          Manual checklist saja          |

> **Catatan target coverage:** Angka di atas adalah target _line/branch coverage_ untuk Service layer (unit) dan Route Handler (integration) per modul — bukan target coverage keseluruhan codebase. Modul UI murni (komponen visual tanpa logic) tidak dihitung dalam target ini.

---

## 3. SKENARIO TEST CASE DETAIL (EDGE CASE KRITIS)

### 3.1 Overlap Room & Stock Item Booking (Concurrent Request)

**Modul:** Room Booking, Item Booking
**Layer:** Unit + Integration + Load Test
**Risiko jika gagal:** Double-booking tempat fisik / over-lending barang yang stoknya tidak mencukupi — dampak operasional langsung ke masjid.

| #     | Skenario                                                | Setup                                                           | Aksi                                                                                                   | Expected Result                                                                                                                                                                           |
| ----- | ------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1.1 | Overlap dasar (sequential)                              | 1 room, sudah ada booking `approved` tanggal 10-12 Sep          | Submit booking baru tanggal 11-13 Sep (overlap)                                                        | `409 BOOKING_CONFLICT`                                                                                                                                                                    |
| 3.1.2 | Non-overlap (boundary case)                             | Booking existing 10-12 Sep                                      | Submit booking baru 12-14 Sep (`startDate` baru = `endDate` existing)                                  | **Sukses** — boundary tidak dianggap overlap (`startDate < endDate` existing, bukan `<=`) — **konfirmasi definisi ini dengan tim BE sebelum implementasi test**, karena berpotensi ambigu |
| 3.1.3 | Overlap dengan status `pending`                         | Booking existing `pending` (belum di-approve) tanggal 10-12 Sep | Submit booking baru overlap                                                                            | `409 BOOKING_CONFLICT` — pending TETAP dihitung sebagai occupied (bukan hanya `approved`)                                                                                                 |
| 3.1.4 | Concurrent request identik (race condition — Load Test) | 1 room kosong                                                   | Kirim 20 request `POST /api/room-bookings` BERSAMAAN dengan `roomId`+rentang tanggal yang PERSIS SAMA  | Hanya **1 request** berhasil (201), sisanya `409 BOOKING_CONFLICT`. Verifikasi ke DB: hanya ada 1 row untuk kombinasi tsb                                                                 |
| 3.1.5 | Concurrent request overlap parsial (Load Test)          | 1 room kosong                                                   | Kirim 10 request dengan rentang tanggal saling overlap tapi tidak identik (mis. sliding window 1 hari) | Sistem harus konsisten menolak SEMUA yang overlap dengan booking yang lolos duluan — verifikasi TIDAK ADA 2 row yang overlap tersimpan sebagai `pending`/`approved`                       |
| 3.1.6 | Stock overlap dasar (Item Booking)                      | 1 item stok 5, booking existing quantity 5 tanggal 1-5 Okt      | Submit booking baru quantity 1, tanggal 3-4 Okt (overlap, total akan 6 > stok 5)                       | `409 STOCK_UNAVAILABLE` dengan `{ requested: 1, available: 0 }`                                                                                                                           |
| 3.1.7 | Stock overlap sebagian (partial reject)                 | Item stok 5, booking existing quantity 3 tanggal 1-5 Okt        | Submit booking baru quantity 3 (sisa hanya 2) tanggal 2-4 Okt                                          | `409 STOCK_UNAVAILABLE` — REJECT PENUH (bukan partial-approve quantity 2), sesuai keputusan PRD Section 3.3                                                                               |
| 3.1.8 | Concurrent stock race (Load Test)                       | Item stok 1, kosong                                             | Kirim 10 request quantity 1 BERSAMAAN pada rentang tanggal sama                                        | Hanya 1 berhasil, 9 sisanya `409 STOCK_UNAVAILABLE` — verifikasi total quantity ter-reserve di DB TIDAK melebihi `totalStock`                                                             |

**Metodologi Load Test (3.1.4, 3.1.5, 3.1.8):** Gunakan `autocannon`/`k6` dengan connection pool yang mengirim request secara _truly concurrent_ (bukan sequential cepat) — verifikasi hasil TIDAK dengan asumsi response code saja, tapi WAJIB query langsung ke test database pasca-test untuk menghitung jumlah row aktual yang tersimpan sebagai `pending`/`approved` pada kombinasi resource+waktu yang sama.

### 3.2 RSVP Quota Race Condition

**Modul:** Event & RSVP
**Layer:** Unit + Integration + Load Test
**Risiko jika gagal:** Kuota event terlampaui, menyebabkan masalah logistik nyata saat hari-H acara (kursi/konsumsi tidak cukup).

| #     | Skenario                                                       | Setup                                                       | Aksi                                                            | Expected Result                                                                                                                               |
| ----- | -------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.2.1 | RSVP normal di bawah kuota                                     | Event `quotaMax: 50`, `rsvpCount: 10`                       | Submit RSVP baru                                                | `201`, `rsvpCount` bertambah jadi 11                                                                                                          |
| 3.2.2 | RSVP tepat kuota terakhir                                      | Event `quotaMax: 10`, `rsvpCount: 9`                        | Submit RSVP baru                                                | `201` berhasil (slot ke-10 terisi)                                                                                                            |
| 3.2.3 | RSVP saat kuota sudah penuh                                    | Event `quotaMax: 10`, `rsvpCount: 10`                       | Submit RSVP baru                                                | `409 QUOTA_FULL`                                                                                                                              |
| 3.2.4 | RSVP tanpa kuota (`quotaMax: null`)                            | Event tanpa batas kuota                                     | Submit 100 RSVP berbeda nomor                                   | Seluruhnya `201`, tidak ada limit                                                                                                             |
| 3.2.5 | **Race condition — slot terakhir diserbu (Load Test, KRITIS)** | Event `quotaMax: 10`, `rsvpCount: 9` (tersisa TEPAT 1 slot) | Kirim 20 request RSVP BERSAMAAN dengan nomor WA berbeda-beda    | Hanya **1 request** berhasil `201`, 19 sisanya `409 QUOTA_FULL`. Verifikasi DB: total row `RsvpEntry` untuk event tsb = TEPAT 10, tidak lebih |
| 3.2.6 | Duplikat RSVP nomor sama pada event sama                       | Sudah ada RSVP dengan `phone: 6281111` di event X           | Submit RSVP lagi dengan `phone: 6281111` di event X yang sama   | `409 DUPLICATE_RSVP` — enforced oleh unique constraint DB `(eventId, phone)`                                                                  |
| 3.2.7 | Nomor sama, event BERBEDA                                      | RSVP dengan `phone: 6281111` sudah ada di event X           | Submit RSVP `phone: 6281111` di event Y (berbeda)               | `201` berhasil — dedup hanya berlaku per-event, bukan global                                                                                  |
| 3.2.8 | **Race condition dedup (Load Test)**                           | Event kosong                                                | Kirim 10 request RSVP BERSAMAAN dengan `phone` yang PERSIS SAMA | Hanya **1 request** berhasil `201`, 9 sisanya `409 DUPLICATE_RSVP` (menangkap `P2002` dari Prisma, bukan race yang lolos ganda)               |

**Catatan implementasi test 3.2.5 & 3.2.8:** Ini adalah test PALING KRITIS di seluruh dokumen ini — kegagalan di sini berarti keputusan arsitektur `prisma.$transaction` (terkunci di DATABASE_SCHEMA.md/CODING_CONVENTIONS.md) tidak benar-benar efektif. Jika load test menunjukkan kebocoran (row melebihi kuota), ini **BLOCKER** untuk deployment — bukan bug biasa yang bisa di-defer.

### 3.3 Security Pass & RBAC Lateral Access

**Modul:** Seluruh endpoint protected (Auth/RBAC sebagai fondasi)
**Layer:** Integration + Manual Security Test
**Risiko jika gagal:** Kebocoran data sensitif (data peminjam, laporan keuangan) atau manipulasi sistem oleh pihak tidak berwenang.

| #      | Skenario                                                            | Setup                                                           | Aksi                                                                                            | Expected Result                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.3.1  | Akses tanpa token sama sekali                                       | —                                                               | Request ke endpoint protected apapun tanpa header `Authorization`                               | `401 UNAUTHORIZED`                                                                                                                                                                 |
| 3.3.2  | Token invalid/expired                                               | Token JWT dengan signature salah atau `exp` sudah lewat         | Request ke endpoint protected                                                                   | `401 UNAUTHORIZED`                                                                                                                                                                 |
| 3.3.3  | Role `biro` akses endpoint Superadmin-only                          | User `biro` valid, token valid                                  | `POST /api/users` (create user)                                                                 | `403 FORBIDDEN_ROLE`                                                                                                                                                               |
| 3.3.4  | Role `biro` tanpa permission akses modul di-scope                   | User `biro` TANPA permission `room_bookings:approve`            | `POST /api/room-bookings/:id/approve`                                                           | `403 FORBIDDEN_PERMISSION`                                                                                                                                                         |
| 3.3.5  | Role `biro` DENGAN permission mengakses modul lain (bukan di-scope) | User `biro` HANYA punya permission `content:create`             | `POST /api/lost-found` (permission `lost_found:create`, TIDAK di-assign)                        | `403 FORBIDDEN_PERMISSION`                                                                                                                                                         |
| 3.3.6  | Role `admin` mencoba override shortlink slug                        | User `admin` (bukan superadmin) valid                           | `PUT /api/shortlinks/:id/override`                                                              | `403 FORBIDDEN_ROLE` — override eksklusif Superadmin, TIDAK bisa dibuka lewat permission table                                                                                     |
| 3.3.7  | Biro A mencoba lihat/edit link milik Biro B                         | 2 user `biro` berbeda, masing-masing punya shortlink sendiri    | Biro A request `GET /api/shortlinks/:id/analytics` dengan ID milik Biro B                       | `403` atau `404` (tergantung desain — TIDAK boleh `200` dengan data Biro B)                                                                                                        |
| 3.3.8  | Manipulasi langsung API bypass UI (tanpa lewat form)                | User `biro` tanpa permission                                    | Kirim request langsung (Postman) ke `POST /api/events` dengan payload valid, skip UI sepenuhnya | `403 FORBIDDEN_PERMISSION` — enforcement HARUS di server, bukan hanya UI hide/show (NFR-SEC-01)                                                                                    |
| 3.3.9  | Superadmin menonaktifkan diri sendiri (satu-satunya superadmin)     | Hanya ada 1 superadmin aktif di sistem                          | `PATCH /api/users/:id` dengan `isActive: false` pada akunnya sendiri                            | `409 { code: 'LAST_SUPERADMIN' }` — dicegah, sesuai PRD Section 3.1 edge case                                                                                                      |
| 3.3.10 | Sesi user yang di-nonaktifkan tetap dipakai                         | User `biro` valid login, lalu Superadmin menonaktifkan user tsb | User `biro` (dengan token lama yang masih "valid" secara JWT) request ke endpoint protected     | Ditolak dalam waktu singkat sesuai NFR-RBAC-03 (< 5 menit) — **verifikasi mekanisme invalidasi token yang dipakai benar-benar berfungsi, bukan hanya `isActive` dicek saat login** |
| 3.3.11 | Content draft diakses via endpoint publik                           | Content dengan `isPublished: false`                             | `GET /api/content/:id` tanpa token (sebagai publik)                                             | `404 NOT_FOUND` (bukan `200` dengan data draft bocor)                                                                                                                              |
| 3.3.12 | XSS payload di rich text Content                                    | User dengan permission `content:create`                         | Submit `body` berisi `<script>alert(1)</script>`                                                | Tersimpan sebagai teks (tidak tereksekusi saat render publik) — verifikasi sanitasi di FE (Task 6.3) benar-benar berfungsi                                                         |

**Metodologi:** Test 3.3.1-3.3.9 & 3.3.11 dieksekusi sebagai integration test otomatis (bisa masuk CI). Test 3.3.10 & 3.3.12 memerlukan verifikasi semi-manual (timing-based / browser-based) — dokumentasikan hasil secara eksplisit di test report, jangan hanya "assumed pass".

### 3.4 OTP Rate Limit Tracking

**Modul:** Room/Item Booking Tracking (`request-otp` & `track`)
**Layer:** Integration + Manual/Timing Test
**Risiko jika gagal:** Abuse OTP (spam WA ke nomor Jamaah lain) atau OTP bisa ditebak/brute-force.

| #      | Skenario                                                           | Setup                                                                                                                                               | Aksi                                                                  | Expected Result                                                                                                                                                                                                                                     |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.4.1  | Request OTP normal (di bawah limit)                                | Nomor belum pernah request OTP dalam 10 menit terakhir                                                                                              | `POST /api/room-bookings/track/request-otp` 1x                        | `200`, OTP terkirim (verifikasi log/mock notification)                                                                                                                                                                                              |
| 3.4.2  | Request OTP hingga batas (3x dalam window)                         | —                                                                                                                                                   | Request OTP 3x berturut-turut untuk nomor sama, dalam window 10 menit | Seluruh 3 request `200` berhasil                                                                                                                                                                                                                    |
| 3.4.3  | Request OTP ke-4 dalam window yang sama (KUNCI)                    | 3 request OTP sudah terkirim dalam 10 menit terakhir untuk nomor sama                                                                               | Request OTP ke-4                                                      | `429 RATE_LIMITED` — keputusan terkunci: max 3/10 menit                                                                                                                                                                                             |
| 3.4.4  | Request OTP setelah window reset                                   | Window 10 menit dari request pertama sudah lewat                                                                                                    | Request OTP lagi untuk nomor sama                                     | `200` berhasil — counter reset, BUKAN diblokir permanen                                                                                                                                                                                             |
| 3.4.5  | Rate limit per-nomor, bukan global                                 | Nomor A sudah kena rate limit (3x terpakai)                                                                                                         | Nomor B (berbeda) request OTP                                         | `200` berhasil — rate limit TIDAK boleh bocor antar-nomor                                                                                                                                                                                           |
| 3.4.6  | OTP benar dipakai verifikasi                                       | OTP valid terkirim                                                                                                                                  | `POST /api/room-bookings/track` dengan OTP benar                      | `200`, mengembalikan riwayat booking terkait nomor                                                                                                                                                                                                  |
| 3.4.7  | OTP salah                                                          | OTP valid terkirim (mis. "123456")                                                                                                                  | Verifikasi dengan OTP salah (mis. "000000")                           | Ditolak (`401` atau `400`, tentukan konsisten dengan tim BE), TIDAK mengembalikan data booking                                                                                                                                                      |
| 3.4.8  | OTP expired                                                        | OTP terkirim, tunggu melewati durasi expiry (disarankan 5 menit — **konfirmasi durasi final dengan tim BE, belum eksplisit di dokumen sebelumnya**) | Verifikasi dengan OTP yang sudah expired                              | Ditolak dengan pesan jelas ("OTP kedaluwarsa, minta OTP baru")                                                                                                                                                                                      |
| 3.4.9  | OTP reuse setelah berhasil dipakai                                 | OTP sudah berhasil dipakai 1x untuk verifikasi                                                                                                      | Coba pakai OTP yang SAMA lagi untuk verifikasi kedua                  | Ditolak — OTP harus single-use, tidak bisa dipakai berulang                                                                                                                                                                                         |
| 3.4.10 | Race condition request OTP bersamaan (edge, bukan prioritas utama) | Nomor baru, belum ada history                                                                                                                       | Kirim 5 request OTP BERSAMAAN (bukan sequential)                      | Idealnya counter tetap akurat (maks yang lolos = sesuai kapasitas rate limit tersisa), TAPI ini bukan test kritis-blocker seperti 3.1/3.2 — catat sebagai known-limitation jika rate limiter yang dipakai (in-memory) tidak atomic di edge case ini |

**Catatan:** Item 3.4.8 memerlukan **keputusan durasi expiry OTP** yang belum eksplisit dikunci di dokumen-dokumen sebelumnya — flagged di Section 5 (Open Decisions) di bawah, perlu konfirmasi tim BE sebelum test case ini bisa difinalisasi.

---

## 4. TEST DATA & ENVIRONMENT SETUP STRATEGY

### 4.1 Isolasi Data Test

```
Environment:
├── Development DB   → data seed developer sehari-hari (CODING_CONVENTIONS.md Section 4.2)
├── Test DB          → KHUSUS untuk unit/integration test otomatis (CI + lokal)
│                       - Di-reset penuh sebelum setiap test SUITE run (bukan per test case)
│                       - TIDAK PERNAH berisi data real Jamaah/pengurus JMMI
│                       - Connection string terpisah: DATABASE_URL_TEST (env var berbeda)
├── Staging DB        → mirror production untuk E2E & Load Test (Task 7.7-7.9)
│                       - Data dummy realistis (volume mendekati skenario produksi
│                         untuk load test yang representatif)
└── Production DB     → TIDAK PERNAH disentuh oleh proses testing otomatis apapun
```

**Aturan penamaan data dummy** (konsisten dengan CODING_CONVENTIONS.md Section 4.2):

- Nomor telepon test: prefix jelas seperti `628111XXXXXX` (rentang khusus testing, tidak overlap dengan format nomor asli).
- Nama: `Test Jamaah <N>`, `Test Biro <N>`, dst — mudah difilter/dibersihkan pasca-test.
- Email test: domain khusus, mis. `@test.jmmi-its.internal` (tidak pernah kirim email asli meski ada fitur email di masa depan).

**Cleanup strategy:** Test DB di-reset via `prisma migrate reset` (development) atau truncate table terarah di CI pipeline sebelum test suite run — JANGAN mengandalkan manual cleanup di akhir test (rawan data test menumpuk dan mengganggu run berikutnya).

### 4.2 Mock Service — Baileys (WhatsApp Notification)

**Untuk Unit & Integration Test:** Gunakan `MockNotificationProvider` (sudah dibangun di SPRINT_BACKLOG.md Task 2.8) — TIDAK PERNAH memanggil Baileys service asli dalam automated test. Mock harus:

- Mengembalikan `{ success: true }` untuk skenario happy-path.
- Bisa di-configure untuk simulasi `{ success: false }` guna test skenario "notifikasi gagal tapi proses utama tetap sukses" (PRD Section 2.6).
- Mencatat parameter yang dikirim (`recipientPhone`, `type`, `templateData`) agar test bisa assert pesan yang BENAR terkirim ke nomor yang BENAR.

**Untuk E2E/Manual Verification (Section 1.4, critical path #1):** Gunakan Baileys service asli yang terhubung ke **nomor WhatsApp testing khusus** (bukan nomor pengurus JMMI asli) — verifikasi pesan benar-benar diterima, sesuai SPRINT_BACKLOG.md Task 3.10.

### 4.3 Mock Service — S3 / Storage

**Untuk Unit & Integration Test:** Mock `StorageService` interface — return URL dummy (`https://mock-storage.test/lost-found/123-photo.jpg`) tanpa benar-benar upload ke S3 sungguhan. Ini menghindari:

- Biaya storage dari test run yang sering (CI berjalan tiap PR).
- Ketergantungan test terhadap koneksi internet/S3 availability saat CI run.

**Untuk E2E/Staging Test:** Gunakan bucket S3-compatible KHUSUS staging/testing (terpisah dari bucket production), dengan lifecycle policy auto-delete file test setelah beberapa hari untuk menghindari akumulasi sampah storage.

### 4.4 Environment Variables Khusus Testing

```
DATABASE_URL_TEST=
BAILEYS_TEST_PHONE_NUMBER=        # nomor WA khusus untuk E2E notification test
STORAGE_BUCKET_TEST=              # bucket terpisah dari production
OTP_RATE_LIMIT_MAX=3              # sama dengan production — TIDAK di-override saat test,
OTP_RATE_LIMIT_WINDOW_MINUTES=10  # justru harus divalidasi dengan nilai production yang sama
```

---

## 5. KRITERIA QA SIGN-OFF (GO/NO-GO DEPLOYMENT GATE)

Merujuk pada SPRINT_BACKLOG.md Task 7.9 (Sign-Off Report). Berikut kriteria eksplisit yang menentukan status **GO** atau **NO-GO** untuk deployment production:

### 5.1 Kriteria BLOCKER (WAJIB Go — sistem TIDAK BOLEH deploy jika salah satu gagal)

| #   | Kriteria                                                                            | Merujuk Test Case         |
| --- | ----------------------------------------------------------------------------------- | ------------------------- |
| B1  | 0 kebocoran double-booking Room/Item pada load test concurrent                      | 3.1.4, 3.1.5, 3.1.8       |
| B2  | 0 kebocoran over-quota RSVP pada load test concurrent                               | 3.2.5                     |
| B3  | 0 kebocoran duplikat RSVP pada load test concurrent                                 | 3.2.8                     |
| B4  | 100% skenario RBAC lateral access (3.3.1–3.3.12) berhasil diblokir sistem           | 3.3.x                     |
| B5  | Migrasi `admins → users` terverifikasi 0 data loss (kredensial tetap valid)         | ARCHITECTURE.md Section 5 |
| B6  | Seluruh unit + integration test suite untuk modul risiko HIGH (Section 2) PASS 100% | Auth/RBAC, Booking, RSVP  |
| B7  | CI pipeline (`lint`, `typecheck`, `test`) hijau di branch yang akan di-deploy       | —                         |

### 5.2 Kriteria WARNING (boleh Go dengan catatan — didokumentasikan sebagai known-issue, TIDAK menghalangi deploy tapi wajib prioritas perbaikan pasca-launch)

| #   | Kriteria                                                                                | Toleransi                                                                               |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| W1  | Coverage modul risiko MEDIUM (Shortlink, Notification) di bawah target Section 2        | Boleh deploy jika gap < 10% dari target dan tidak ada bug Critical terbuka di modul tsb |
| W2  | Bug Low/Minor dari backlog QA belum ter-fix                                             | Boleh deploy, wajib tercatat di known-issue list dengan estimasi fix pasca-launch       |
| W3  | E2E test critical path (Section 1.4) sebagian masih manual pass (belum full Playwright) | Boleh, asalkan manual pass sudah dieksekusi & terdokumentasi (bukan di-skip)            |
| W4  | OTP expiry duration test (3.4.8) belum final karena durasi belum dikonfirmasi tim BE    | Boleh deploy dengan default 5 menit, revisit jika ada laporan issue nyata dari user     |

### 5.3 Format Sign-Off Report (Template)

```markdown
## QA Sign-Off Report — Platform JMMI ITS v1.0

**Tanggal:** [tanggal]
**Disusun oleh:** QA1, QA2

### Status Kriteria BLOCKER

- [ ] B1 — Double-booking Room/Item: PASS/FAIL [detail]
- [ ] B2 — Over-quota RSVP: PASS/FAIL [detail]
- [ ] B3 — Duplikat RSVP: PASS/FAIL [detail]
- [ ] B4 — RBAC Lateral Access: PASS/FAIL [detail]
- [ ] B5 — Migrasi Data: PASS/FAIL [detail]
- [ ] B6 — Test Suite Modul HIGH: PASS/FAIL [detail]
- [ ] B7 — CI Pipeline: PASS/FAIL [detail]

### Status Kriteria WARNING (Known Issues)

- W1/W2/W3/W4: [daftar temuan + rencana mitigasi]

### Rekomendasi Akhir

[ ] GO — seluruh kriteria BLOCKER terpenuhi
[ ] NO-GO — kriteria [nomor] belum terpenuhi, deployment ditunda sampai [kondisi]

### Ringkasan Bug

- Critical: [jumlah] — [status: closed/open]
- High: [jumlah]
- Medium: [jumlah]
- Low: [jumlah, boleh open sebagai known-issue]
```

**Aturan Sign-Off:** Report ini WAJIB ditandatangani (approve) oleh QA1 DAN QA2 sebelum Project Lead memberi keputusan final deploy — satu QA saja tidak cukup untuk proyek dengan modul risiko HIGH sebanyak ini.

---

## OPEN DECISIONS TAMBAHAN (STATUS: SELURUHNYA TERKUNCI)

| #   | Keputusan Terbuka        | Status Final                                                                                                                                                                                                                                                      |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13  | Boundary overlap booking | **TERKUNCI** — Non-overlap/allowed jika `startDate` baru == `endDate` existing. Kondisi overlap: `startDate < existingEndDate AND endDate > existingStartDate`. Test case 3.1.2 dikonfirmasi: boundary case = SUKSES (bukan conflict).                            |
| 14  | Durasi expiry OTP        | **TERKUNCI** — 5 menit. Test case 3.4.8 final tanpa syarat konfirmasi lanjutan.                                                                                                                                                                                   |
| 15  | Response code OTP salah  | **TERKUNCI** — `400 Bad Request` dengan `error.code: "INVALID_OTP"`. Test case 3.4.7 & 3.4.9 disesuaikan: assert `400`, bukan `401`. Tambahkan `INVALID_OTP` ke tabel error code standar di API_CONTRACT.md Section 1.3 (catatan revisi kecil untuk dokumen tsb). |

---

_Dokumen selanjutnya: `UI_COMPONENT_MAP.md` (finalisasi daftar komponen reusable dari draft SPRINT_BACKLOG.md Task 6.2) atau `ENV_SETUP.md` (checklist environment variable & onboarding developer/AI agent baru)._

```

```
