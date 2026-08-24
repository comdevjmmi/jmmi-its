# GLOSSARY.md

## Platform Website Terpadu JMMI ITS — Glosarium Istilah Domain

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** SRS v1.0, PRD.md, ARCHITECTURE.md, DATABASE_SCHEMA.md, API_CONTRACT.md, UI_COMPONENT_MAP.md (semua v1.0)
**Tujuan:** Mencegah AI Agent/developer baru salah interpretasi istilah lokal JMMI sebagai typo/bug, dan menstandarkan terjemahan istilah bisnis ↔ nama teknis di kode.

---

## 1. DOMAIN TERMS & ROLES (Organisasi & Pengguna)

| Istilah         | Definisi                                                                                                                                                                        | Catatan Penting                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JMMI**        | Jamaah Masjid Manarul Ilmi ITS — nama organisasi kemasjidan/kerohanian Islam di lingkungan kampus ITS Surabaya, pemilik platform ini                                            | Nama proper noun — TIDAK boleh diterjemahkan, disingkat ulang, atau dianggap typo oleh AI Agent                                                                           |
| **Jamaah**      | Pengguna publik/umum platform — siapa saja yang berinteraksi dengan masjid (mahasiswa, dosen, warga sekitar), TANPA akun/login di sistem                                        | Di level teknis = "Public User" / unauthenticated visitor. BUKAN entitas dengan row di tabel `users`                                                                      |
| **Biro**        | Divisi/departemen kepengurusan di dalam struktur JMMI (mis. Biro Humas, Biro Danus/Dana Usaha, Biro Media) — pengurus yang punya akun dengan akses konten _scoped_ per divisi   | Di level teknis = `User` dengan `role: 'biro'` + `UserPermission` yang scoped ke module tertentu                                                                          |
| **Pengurus**    | Istilah umum untuk siapa saja yang aktif menjabat dalam struktur organisasi JMMI (mencakup Superadmin, Admin, dan Biro)                                                         | Istilah payung/umum — BUKAN role teknis spesifik, jangan dipetakan langsung ke satu enum value                                                                            |
| **Takmir**      | Istilah umum di dunia kemasjidan Indonesia untuk pengurus/pengelola masjid — di konteks JMMI ITS, sering dipakai bergantian dengan "Pengurus" secara informal                   | Istilah budaya/konteks, TIDAK muncul sebagai entitas terpisah di skema database — jangan buat model `Takmir` baru                                                         |
| **Superadmin**  | Role teknis tertinggi — akses penuh sistem, satu-satunya yang bisa kelola akun/permission dan override shortlink                                                                | Role teknis eksplisit: `role: 'superadmin'` di tabel `users`                                                                                                              |
| **Admin**       | Role teknis untuk pengurus yang mengelola operasional sistem (approval, transparansi keuangan) tanpa kompleksitas manajemen akun sekelas Superadmin                             | Role teknis eksplisit: `role: 'admin'`                                                                                                                                    |
| **KSSI**        | Istilah untuk kajian/kegiatan rutin keislaman yang diselenggarakan JMMI (mis. kajian mingguan, kegiatan syiar) — salah satu jenis "Kegiatan" yang didaftarkan lewat modul Event | Bukan entitas database terpisah — KSSI adalah SALAH SATU jenis `Event`, bukan model/tabel sendiri                                                                         |
| **Kilas Balik** | Halaman/konten yang menampilkan rekam jejak/sejarah kegiatan JMMI dari waktu ke waktu (semacam "throwback"/dokumentasi historis)                                                | Dipetakan sebagai salah satu `type` di model `Content` (kemungkinan `type: 'achievement'` atau kategori serupa — konfirmasi dengan tim konten saat implementasi Task 6.6) |
| **Arah Gerak**  | Istilah untuk dokumen/pernyataan arah kebijakan & fokus kerja organisasi JMMI dalam periode kepengurusan tertentu (mirip "roadmap"/GBHO organisasi)                             | Bagian dari halaman statis "Profil & Identity" (landing page) — konten statis, bukan entitas dinamis                                                                      |
| **Narahubung**  | Istilah untuk kontak person/penanggung jawab yang bisa dihubungi terkait suatu hal (mis. narahubung Lost & Found, narahubung Donasi)                                            | Field teks biasa di dalam entitas terkait (mis. bagian dari `claimProcedure` di Lost & Found), BUKAN entitas kontak terpisah                                              |

---

## 2. OPERATIONAL & BUSINESS LOGIC TERMS

| Istilah                                    | Definisi                                                                                                                                                                                      | Referensi Teknis                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slot Overlap / Bentrok Jadwal**          | Kondisi ketika rentang waktu pengajuan peminjaman baru beririsan dengan pengajuan lain yang berstatus `pending`/`approved` pada resource (Room/Item) yang sama                                | Dicek via query composite index `idx_room_booking_conflict`/`idx_item_booking_conflict`, DATABASE_SCHEMA.md Section 3.1                                    |
| **Boundary Overlap**                       | Kasus tepi (edge case) ketika `startDate` booking baru PERSIS SAMA dengan `endDate` booking existing — dikunci sebagai **NON-overlap** (diperbolehkan)                                        | Kondisi resmi: `startDate < existingEndDate AND endDate > existingStartDate` — TEST_PLAN.md Open Decision #13 (terkunci)                                   |
| **Approval Queue**                         | Daftar/antrian pengajuan (Peminjaman Tempat, Peminjaman Barang) berstatus `pending` yang menunggu keputusan Admin/Biro (approve/reject)                                                       | UI Organism: `DataTable` di halaman `/admin/peminjaman-tempat` & `/admin/peminjaman-barang`, API: `GET /api/room-bookings?status=pending`, dst             |
| **Kuota RSVP / Quota Event**               | Batas maksimum jumlah pendaftar (RSVP) yang diperbolehkan untuk satu Event — bersifat OPSIONAL (boleh tanpa batas jika `quotaMax: null`)                                                      | Field `quotaMax` di model `Event`, error `409 QUOTA_FULL` saat terlampaui                                                                                  |
| **1 WA = 1 Slot**                          | Kebijakan bisnis: satu nomor WhatsApp hanya bisa RSVP satu kali per Event yang sama (mencegah duplikasi pendaftaran)                                                                          | Enforced via unique constraint DB `(eventId, phone)` pada `RsvpEntry`, error `409 DUPLICATE_RSVP`                                                          |
| **OTP Single-Use**                         | Kebijakan bahwa satu kode OTP (untuk fitur cek status peminjaman via WA) hanya valid dipakai SATU KALI verifikasi — tidak bisa dipakai berulang meski belum expired                           | TEST_PLAN.md test case 3.4.9; OTP expiry terkunci 5 menit, rate limit 3x/10 menit per nomor                                                                |
| **Tracking via Verifikasi WA**             | Mekanisme Jamaah (tanpa login/akun) mengecek status pengajuan peminjaman mereka menggunakan verifikasi OTP ke nomor WhatsApp yang didaftarkan saat submit — BUKAN kode tracking unik terpisah | Endpoint `POST /api/room-bookings/track` & `/track/request-otp`; keputusan ini menggantikan pendekatan "kode unik" yang sempat dipertimbangkan di awal SRS |
| **Shortlink Override**                     | Aksi KHUSUS Superadmin untuk mengganti target URL pada sebuah slug shorten link yang SUDAH terpakai/dibuat pengguna lain sebelumnya                                                           | Endpoint `PUT /api/shortlinks/:id/override`, RBAC eksklusif `role: 'superadmin'` — TIDAK bisa dibuka via tabel `permissions` untuk role lain               |
| **Scoped Permission**                      | Konsep bahwa akses role `biro` TIDAK seragam — setiap akun Biro hanya bisa mengakses modul/aksi spesifik yang secara eksplisit di-assign oleh Superadmin                                      | Tabel `permissions` + `user_permissions`; berbeda dari Superadmin/Admin yang aksesnya ditentukan LANGSUNG dari `role`, bukan permission granular           |
| **Fase 0 / Fondasi**                       | Istilah proyek internal untuk pekerjaan yang bersifat _blocking_ terhadap seluruh modul fitur lain — mencakup migrasi Auth/RBAC, Storage Service, Notification Service                        | Istilah manajemen proyek (SPRINT_BACKLOG.md), BUKAN istilah bisnis/domain JMMI — tidak muncul di UI atau kode                                              |
| **Mark as Claimed / Tandai Diklaim**       | Aksi Admin/Biro menandai item Lost & Found sebagai sudah diambil pemiliknya — SOFT status change, bukan penghapusan data (untuk audit trail)                                                  | Endpoint `PATCH /api/lost-found/:id/mark-claimed`, mengubah `status: 'active'` → `'claimed'`                                                               |
| **Mark as Returned / Tandai Dikembalikan** | Aksi Admin menandai barang pinjaman (Item Booking) sudah dikembalikan Jamaah                                                                                                                  | Endpoint `POST /api/item-bookings/:id/mark-returned`, mengisi field `returnedAt`                                                                           |
| **Additive-First Migration**               | Strategi migrasi database proyek ini: tabel/kolom baru ditambahkan TANPA menghapus struktur lama terlebih dahulu, penghapusan (destructive) baru dilakukan di tahap terakhir setelah stabil   | Istilah teknis internal proyek — ARCHITECTURE.md Section 5.2, BUKAN istilah standar industri yang perlu dicari definisinya di luar dokumen ini             |

---

## 3. MAPPING ISTILAH DOMAIN → DATABASE/API

Tabel ini adalah rujukan WAJIB saat AI Agent atau developer baru menerjemahkan requirement berbahasa Indonesia (dari SRS/PRD/percakapan tim) menjadi nama teknis di kode. **Jangan menerjemahkan ulang secara harfiah** — gunakan mapping resmi berikut.

| Istilah Bisnis (Indonesia)                           | Entitas Teknis (Model Prisma)                                                                   | Endpoint API Utama                                           | Catatan                                                                                                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jamaah                                               | _(tidak ada model — unauthenticated public user)_                                               | Semua endpoint publik (`GET`/`POST` tanpa `withAuth`)        | Data Jamaah HANYA tersimpan sebagai field di dalam entitas lain (`jamaahName`, `jamaahPhone` di `RoomBooking`/`ItemBooking`; `name`/`phone` di `RsvpEntry`) — TIDAK ada tabel `Jamaah` tersendiri |
| Biro                                                 | `User` dengan `role: 'biro'`                                                                    | `POST /api/users` (create dengan `role: 'biro'`)             | Selalu disertai `UserPermission` untuk scoping akses                                                                                                                                              |
| Pengurus (umum)                                      | `User` (role apapun: superadmin/admin/biro)                                                     | `GET /api/users`                                             | Istilah payung, mapping ke MODEL yang sama untuk ketiga role teknis                                                                                                                               |
| Peminjaman Tempat                                    | `RoomBooking`                                                                                   | `POST /api/room-bookings`, `GET /api/room-bookings/calendar` | Entitas relasi: `Room`                                                                                                                                                                            |
| Peminjaman Barang / Rental Barang                    | `ItemBooking`                                                                                   | `POST /api/item-bookings`                                    | Entitas relasi: `ItemAsset`                                                                                                                                                                       |
| Tempat / Ruangan                                     | `Room`                                                                                          | `GET /api/rooms`                                             | —                                                                                                                                                                                                 |
| Barang (yang dipinjam)                               | `ItemAsset`                                                                                     | `GET /api/items`                                             | Field `totalStock` = jumlah unit tersedia                                                                                                                                                         |
| Pendaftaran Kegiatan & KSSI                          | `Event` + `RsvpEntry`                                                                           | `POST /api/events`, `POST /api/events/:id/rsvp`              | KSSI BUKAN model terpisah — hanya salah satu isi/kategori dari `Event.title`/`description`                                                                                                        |
| Kalender Kegiatan (gabungan)                         | `CalendarEvent` (existing, agenda umum) **DIGABUNG** dengan `Event` (baru, dengan RSVP)         | `GET /api/calendar/combined`                                 | Dua model BERBEDA di database, digabung HANYA di level query/response endpoint ini                                                                                                                |
| Barang Hilang & Ditemukan                            | `LostFoundItem`                                                                                 | `GET/POST /api/lost-found`                                   | Nama model Prisma singkat `LostFoundItem`, BUKAN `LostAndFoundItem` — perhatikan penulisan persis saat referensi kode                                                                             |
| Donasi                                               | _(info statis — bagian dari `Content` atau halaman hardcoded, BUKAN model transaksi)_           | `GET /api/content?type=...` (jika di-drive CMS)              | TIDAK ADA payment gateway/model transaksi donasi di v1 — murni informasi kontak                                                                                                                   |
| Transparansi Keuangan / Laporan Keuangan             | `FinancialReport`                                                                               | `GET/POST /api/financial-reports`                            | TERPISAH dari `FinanceTransaction` (existing, per-transaksi individual) — TIDAK ADA agregasi otomatis antar keduanya di v1                                                                        |
| Tautan Pendek / Shorten Link                         | `ShortLink`                                                                                     | `GET/POST /api/shortlinks`                                   | Existing model, di-extend dengan `LinkClickLog`                                                                                                                                                   |
| Log Klik Tautan                                      | `LinkClickLog`                                                                                  | `GET /api/shortlinks/:id/analytics`                          | Terpisah dari kolom agregat `click_count` di `ShortLink` (dipertahankan untuk performa)                                                                                                           |
| Konten / Artikel / Blog / Galeri / Prestasi / Alumni | `Content` (field `type` membedakan kategori: `blog`/`gallery`/`profile`/`achievement`/`alumni`) | `GET/POST /api/content`                                      | SATU model untuk seluruh jenis konten — bukan tabel terpisah per jenis                                                                                                                            |
| Log Notifikasi WA                                    | `NotificationLog`                                                                               | _(internal, tidak ada endpoint publik langsung)_             | Dicatat otomatis oleh `notificationService` setiap pengiriman                                                                                                                                     |
| Izin/Hak Akses (Biro)                                | `Permission` + `UserPermission`                                                                 | `GET /api/permissions`, `PUT /api/users/:id/permissions`     | —                                                                                                                                                                                                 |

---

## 4. AI AGENT GUARDRAILS — NAMING & i18n

Aturan berikut WAJIB diikuti AI Coding Agent (Antigravity atau sejenisnya) tanpa pengecualian, untuk menjaga konsistensi antara istilah yang dilihat Jamaah/pengurus (Bahasa Indonesia) dan kode yang ditulis tim (Bahasa Inggris).

### 4.1 Prinsip Dasar Pemisahan Bahasa

```
┌─────────────────────────────┬──────────────────────────────────┐
│  LAYER                       │  BAHASA YANG DIPAKAI               │
├─────────────────────────────┼──────────────────────────────────┤
│  Database (nama tabel/kolom) │  Bahasa Inggris, camelCase/        │
│                               │  snake_case sesuai Prisma          │
│                               │  convention (DATABASE_SCHEMA.md)   │
├─────────────────────────────┼──────────────────────────────────┤
│  API (endpoint path, field   │  Bahasa Inggris (API_CONTRACT.md)  │
│  request/response, error     │                                    │
│  code)                       │                                    │
├─────────────────────────────┼──────────────────────────────────┤
│  Kode internal (nama fungsi, │  Bahasa Inggris (CODING_           │
│  variabel, nama file/folder) │  CONVENTIONS.md)                   │
├─────────────────────────────┼──────────────────────────────────┤
│  UI-facing text (label,      │  Bahasa Indonesia (default locale) │
│  pesan error ke user, isi    │  ATAU Bahasa Inggris (jika locale  │
│  notifikasi WA)              │  `en` aktif) — SELALU via i18n,    │
│                               │  TIDAK PERNAH hardcoded            │
├─────────────────────────────┼──────────────────────────────────┤
│  Dokumentasi teknis (/docs)  │  Bahasa Indonesia (mengikuti       │
│                               │  seluruh dokumen yang sudah        │
│                               │  disusun tim)                      │
└─────────────────────────────┴──────────────────────────────────┘
```

### 4.2 Aturan Eksplisit untuk AI Agent

1. **JANGAN PERNAH** menerjemahkan nama model/field Prisma ke Bahasa Indonesia, meski istilah bisnisnya berbahasa Indonesia. Contoh: field untuk "Peminjaman Tempat" TETAP `RoomBooking`/`roomBooking`, BUKAN `PeminjamanTempat`/`peminjamanTempat`.
2. **JANGAN PERNAH** membuat model/tabel baru untuk istilah yang sebenarnya sudah termapping ke model existing di Section 3 di atas (mis. JANGAN buat model `Kssi` terpisah — KSSI adalah bagian dari `Event`).
3. **JANGAN PERNAH** hardcode string UI Bahasa Indonesia langsung di komponen (`<button>Setujui</button>`) — SELALU lewat sistem i18n yang sudah di-setup (SPRINT_BACKLOG.md Task 5.5), sehingga otomatis tersedia versi Inggrisnya juga.
4. **JANGAN PERNAH** menganggap istilah di Section 1 & 2 dokumen ini (mis. "Biro", "Takmir", "Kilas Balik", "Boundary Overlap") sebagai kesalahan ketik atau kata asing yang perlu "dikoreksi" — istilah-istilah ini SENGAJA dipertahankan sesuai konteks organisasi/proyek.
5. Saat generate pesan error/notifikasi WA baru yang belum ada template-nya, **cek dulu Section 2 dokumen ini** untuk istilah resmi yang harus dipakai (mis. gunakan tepat "Menunggu"/"Disetujui"/"Ditolak" untuk status booking sesuai `StatusBadge` mapping di UI_COMPONENT_MAP.md — JANGAN improvisasi sinonim seperti "Diproses"/"Diterima" yang tidak konsisten dengan istilah resmi).
6. Jika AI Agent menemukan istilah bisnis BARU dalam requirement yang BELUM ada di Section 1-3 dokumen ini (mis. istilah organisasi baru yang belum tercatat), **WAJIB bertanya ke developer** untuk klarifikasi mapping yang benar sebelum membuat model/nama teknis baru — jangan menebak terjemahan sendiri.
7. Penamaan file/folder/komponen (CODING_CONVENTIONS.md Section 1.1 & 3) selalu Bahasa Inggris konsisten dengan istilah teknis di Section 3 tabel mapping — mis. file untuk fitur "Peminjaman Barang" dinamai `item-booking-service.ts`, BUKAN `peminjaman-barang-service.ts`.
8. Untuk commit message (Conventional Commits, CODING_CONVENTIONS.md Section 1.2), scope tetap memakai nama teknis Bahasa Inggris (`feat(item-booking): ...`), TAPI deskripsi commit boleh campuran jika membantu kejelasan konteks tim (tidak seketat UI-facing text).

### 4.3 Contoh Kasus Ambigu yang Sering Salah (Referensi Cepat)

| Situasi                                     | Salah                                                               | Benar                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nama field database untuk "Nomor WA Jamaah" | `nomorWa`, `noWhatsapp`                                             | `jamaahPhone` (lihat `RoomBooking`/`ItemBooking`) atau `phone` (lihat `RsvpEntry`/`User`) — SESUAI model masing-masing, TIDAK seragam satu nama global |
| Label tombol approve di UI                  | Hardcode `"Approve"` (Inggris) di komponen Bahasa Indonesia default | Lewat i18n key, tampil `"Setujui"` saat locale `id`, `"Approve"` saat locale `en`                                                                      |
| Status badge untuk booking pending          | Membuat teks baru seperti `"Menunggu Approval"`                     | Gunakan persis `"Menunggu"` sesuai mapping resmi `StatusBadge` di UI_COMPONENT_MAP.md Section 2.2                                                      |
| Menyebut "Takmir" dalam kode                | Membuat `enum UserRole { ..., takmir }`                             | TIDAK ADA role teknis `takmir` — istilah ini payung informal, gunakan role teknis yang sudah ada (`admin`/`biro` sesuai konteks jabatan sebenarnya)    |
| Endpoint untuk cek status peminjaman        | `/api/room-bookings/cek-status`                                     | `POST /api/room-bookings/track` (Bahasa Inggris, sesuai API_CONTRACT.md)                                                                               |

---

## OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

| #   | Keputusan Terbuka                                              | Urgensi                                                                 | Status                                                                                                                                                                      |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | Pemetaan pasti "Kilas Balik" ke `type` mana di model `Content` | Rendah — tidak blocking modul lain, cukup diselesaikan sebelum Task 6.6 | **OPEN** — Rekomendasi sementara: petakan "Kilas Balik" ke `type: 'history'` atau `type: 'achievement'` pada model `Content`, menunggu finalisasi dari tim UI/UX dan Konten |

---
