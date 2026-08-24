# PRD.md — Product Requirements Document

## Platform Website Terpadu JMMI ITS

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Repo Target:** `comdevjmmi/jmmi-its`
**Referensi:** SRS v1.0, DBML Schema v1.0 (disetujui)

---

## 1. RINGKASAN PROYEK

### 1.1 Konteks

Proyek ini adalah **pengembangan lanjutan** (bukan greenfield) di atas repository existing `comdevjmmi/jmmi-its` — Next.js 15 App Router + TypeScript + Prisma ORM (PostgreSQL). Beberapa modul sudah punya fondasi kode (Shorten Link, Kalender, Keuangan sederhana), sebagian besar modul lain harus dibangun dari nol.

### 1.2 Tim

- 3 Frontend Engineer
- 3 Backend Engineer
- Pendekatan: AI-assisted "vibe coding" dengan Antigravity sebagai code editor/agent, dokumen `/docs` sebagai single source of truth

### 1.3 Non-Goals (Eksplisit Out-of-Scope untuk v1)

- Payment gateway terintegrasi (donasi tetap statis QRIS/rekening)
- Upgrade dependency usang (Jest v27, ESLint v8, Prettier v2, Husky v7) — **tidak disentuh** kecuali blocking terhadap fitur baru
- Multi-tenant (proyek ini khusus JMMI ITS, bukan platform SaaS multi-masjid)
- Native mobile app

---

## 2. ARSITEKTUR MIGRASI (KEPUTUSAN TEKNIS TERKUNCI)

Bagian ini WAJIB dipahami sebelum implementasi — ini adalah keputusan arsitektur yang sudah difinalisasi, bukan opsi diskusi ulang.

### 2.1 Auth & User Model

- **Keputusan:** Extend tabel `admins` existing → menjadi tabel `users` baru dengan kolom `role` (enum: `superadmin`, `admin`, `biro`).
- **Migrasi data:** Seluruh row `admins` existing di-migrate ke `users` dengan `role = 'admin'` (default), lalu Superadmin pertama di-assign manual pasca-migrasi.
- **JWT payload** berubah dari `{ adminId, email, type }` → `{ userId, email, role, type }`.
- Tabel `permissions` dan `user_permissions` (baru) ditambahkan untuk scoped access role `biro`, sesuai DBML v1.0.
- **Breaking change:** Semua endpoint yang membaca `adminId` dari JWT payload harus diupdate ke `userId`. Ini menyentuh `src/lib/api/auth.ts`, seluruh service di `src/lib/api/services/`, dan `useAuthStore.ts`.

### 2.2 Events & RSVP

- **Keputusan:** Tabel `calendar_events` existing **TIDAK di-extend**. Dibuat tabel baru `events` + `rsvp_entries` murni sesuai DBML v1.0.
- `calendar_events` tetap dipertahankan sebagai sumber data untuk halaman `/kalender` (agenda umum, tanpa RSVP).
- `events` adalah entitas baru khusus untuk "Pendaftaran Kegiatan & KSSI" yang butuh kuota + RSVP.
- **Keputusan desain terbuka untuk tim:** apakah `/kalender` (publik) perlu menampilkan gabungan data dari `calendar_events` DAN `events`, atau keduanya tetap terpisah secara UI. Direkomendasikan: gabung di level view/query (bukan di level tabel), supaya Jamaah tetap melihat satu kalender terpadu.

### 2.3 Financial Reports

- **Keputusan:** Tabel `finance_transactions` existing **tidak di-extend**. Dibuat tabel baru `financial_reports` murni sesuai DBML v1.0, untuk laporan teragregasi per-periode yang diinput manual oleh Admin/Biro.
- `finance_transactions` (existing, per-transaksi) tetap berjalan sebagaimana adanya — tidak ada migrasi data antar kedua tabel ini di v1. Relasi/agregasi otomatis antara keduanya **out-of-scope** untuk v1 (potensi improvement v2).

### 2.4 File Storage

- **Keputusan:** AWS S3 / S3-compatible storage (mis. Supabase Storage) untuk seluruh upload gambar (foto Lost & Found, gambar Blog/Konten, poster Event, foto Galeri).
- Tidak ada integrasi storage terdeteksi di codebase existing → ini adalah **integrasi baru**, perlu ditambahkan sebagai service layer baru (`src/lib/api/services/storage-service.ts` disarankan) sebelum modul manapun yang butuh upload bisa dikerjakan.
- Acceptance: upload menghasilkan URL publik yang disimpan sebagai `media_url`/`photo_url`/`poster_url` di tabel terkait (sesuai DBML).

### 2.5 Shorten Link (Extend, Bukan Rebuild)

- `short_links` sudah terimplementasi penuh — **tidak dibangun ulang**, hanya di-extend:
  1. Tambah tabel `link_click_logs` (baru) untuk log per-klik (saat ini hanya ada agregat `click_count`).
  2. Tambah endpoint override slug khusus role `superadmin` (belum ada di existing).
  3. Sesuaikan RBAC: saat ini semua request diverifikasi sebagai "Admin" generik → perlu disesuaikan agar `biro` (scoped) juga bisa create link miliknya sendiri, sementara override tetap ekslusif `superadmin`.

### 2.6 WhatsApp Notification (Integrasi Baru dari Nol)

- Tidak ada integrasi WA API sama sekali di existing codebase.
- Perlu riset & keputusan library (Baileys vs WA Business API resmi) sebelum implementasi modul Peminjaman Tempat/Barang dan Event RSVP — kedua modul ini **hard-dependent** pada notifikasi WA sesuai SRS.
- Disarankan: bangun sebagai service terisolasi (`src/lib/api/services/notification-service.ts`) dengan interface yang generic, supaya provider WA bisa diganti tanpa mengubah kode pemanggil (lihat NFR-REL-01 di SRS soal risiko Baileys).

---

## 3. MODULE SCOPE & ACCEPTANCE CRITERIA

Status kolom mengacu pada hasil audit Antigravity per 23 Agustus 2026.

### 3.1 RBAC & User Management — **BARU (extend dari `admins`)**

**Scope:**

- Migrasi `admins` → `users` + kolom `role`
- CRUD user oleh Superadmin (create/deactivate, tidak ada hard-delete)
- Tabel `permissions` + `user_permissions` untuk scoping akses Biro
- Middleware RBAC enforcement di semua route API (menggantikan cek "Admin generik" yang ada saat ini)

**Acceptance Criteria:**

- [ ] Superadmin dapat membuat akun baru dengan role `admin` atau `biro`, dan meng-assign permission spesifik ke akun `biro`
- [ ] Superadmin dapat menonaktifkan akun (`is_active = false`) tanpa menghapus data — sesi aktif akun tsb ter-invalidate dalam <5 menit
- [ ] Endpoint API menolak request dari role yang tidak memiliki permission modul terkait (401/403), termasuk saat dipanggil langsung tanpa lewat UI
- [ ] Data `admins` existing berhasil ter-migrasi 100% ke `users` tanpa kehilangan kredensial (password hash tetap valid, tidak perlu reset paksa)

**Edge Cases:**

- Akun `biro` tanpa permission di-assign sama sekali → tidak bisa akses modul apapun selain profil sendiri (bukan error, tapi empty state)
- Superadmin menonaktifkan akunnya sendiri → harus dicegah di level aplikasi (minimal 1 Superadmin aktif harus selalu ada)

---

### 3.2 Peminjaman Tempat — **BARU TOTAL**

**Scope:** Sesuai SRS 3.1 — form publik, validasi bentrok jadwal, approval flow, kalender publik, notifikasi WA, tracking via verifikasi nomor WA.

**Acceptance Criteria:**

- [ ] Jamaah dapat submit pengajuan tanpa login
- [ ] Sistem menolak submit jika `start_date`–`end_date` bentrok dengan booking `pending`/`approved` lain pada `room` yang sama (composite index sesuai DBML)
- [ ] Kalender publik (`/peminjaman-tempat` atau path serupa) menampilkan status occupied/available saja — TIDAK menampilkan `jamaah_name` untuk view publik
- [ ] View Admin/Biro (yang di-assign sebagai approver) menampilkan detail lengkap peminjam
- [ ] Approve/Reject memicu notifikasi WA sesuai template; Reject wajib menyertakan `rejection_reason`
- [ ] Jamaah dapat cek status via verifikasi OTP nomor WA (bukan tracking code) — lihat NFR-SEC-02 di SRS

**Edge Cases:**

- Dua submit bersamaan untuk slot sama → gunakan DB-level locking/transaction saat insert, bukan hanya validasi di application layer
- Pengajuan Pending tanpa respons Admin dalam SLA (SLA belum ditentukan — **TBD, perlu keputusan tim sebelum sprint terkait**)
- Pembatalan pengajuan setelah Approved oleh Jamaah sendiri — **belum ada di SRS v1.0, perlu diklarifikasi sebagai fitur v1 atau v2**

---

### 3.3 Peminjaman Barang — **BARU TOTAL**

**Scope:** Sesuai SRS 3.2 — sama seperti Peminjaman Tempat tapi approver terpisah, validasi stok bukan jadwal ruang.

**Acceptance Criteria:**

- [ ] Validasi stok tersedia mempertimbangkan `item_bookings` lain yang overlap pada rentang `borrow_date`–`return_date` (bukan hanya total stok statis)
- [ ] Approve mengunci (reserve) kuantitas barang untuk rentang tanggal terkait
- [ ] Reminder WA otomatis terkirim saat `return_date` tercapai tanpa update `returned_at`
- [ ] Approver Barang adalah role/akun yang bisa berbeda dari Approver Tempat (konfigurasi terpisah di level `permissions`)

**Edge Cases:**

- Stok sebagian tersedia (mis. request 5, sisa 3) → sistem harus reject penuh, bukan partial-approve otomatis (partial approval, jika diperlukan, adalah keputusan manual Admin saat review, bukan logic otomatis)

---

### 3.4 Event & RSVP — **PARSIAL (tabel baru `events`+`rsvp_entries`, terpisah dari `calendar_events`)**

**Scope:** Sesuai SRS 3.3.

**Acceptance Criteria:**

- [ ] Biro/Admin (dengan permission terkait) dapat membuat event baru dengan `quota_max` opsional
- [ ] RSVP tanpa login, field: `name`, `phone`, `gender`
- [ ] Saat kuota tersisa 1 dan 2 request bersamaan → hanya 1 yang berhasil (atomic decrement/transaction), yang gagal mendapat pesan "Kuota Penuh" bukan error generik
- [ ] Halaman publik `/kalender` menampilkan gabungan `calendar_events` (agenda umum) dan `events` (kegiatan dengan RSVP) dalam satu tampilan terpadu — dibedakan secara visual (mis. badge "Perlu Daftar")
- [ ] Biro/Admin pembuat event dapat export daftar peserta RSVP (CSV)

**Edge Cases:**

- Duplikasi RSVP dengan nomor WA sama pada event sama → **kebijakan final belum ditentukan** (SRS menyarankan dedup tapi belum final — perlu keputusan: block duplikat atau izinkan dengan warning?)
- Waitlist saat kuota penuh → **out-of-scope v1** kecuali ada keputusan lanjutan dari tim

---

### 3.5 Shorten Link — **EXTEND (fondasi sudah ada)**

**Scope:** Sesuai section 2.5 di atas.

**Acceptance Criteria:**

- [ ] Endpoint create link existing disesuaikan agar role `biro` (dengan permission) bisa create link miliknya sendiri (saat ini generik "Admin")
- [ ] Endpoint baru: override slug — hanya `superadmin`, validasi role di middleware
- [ ] Tabel `link_click_logs` mencatat setiap klik individual (timestamp, referrer) — TIDAK mengubah kolom agregat `click_count` yang sudah ada (tetap dipertahankan untuk performa dashboard)
- [ ] Dashboard analytics: Biro hanya melihat link miliknya sendiri, Admin/Superadmin melihat semua

---

### 3.6 Lost and Found — **BARU TOTAL**

**Scope:** Sesuai SRS 3.5 — one-directional, posting oleh Admin/Biro, upload foto via S3-compatible storage.

**Acceptance Criteria:**

- [ ] Form posting hanya bisa diakses Admin/Biro (dengan permission) — TIDAK ada form publik untuk Jamaah melaporkan barang
- [ ] Upload foto tersimpan ke S3-compatible storage, URL disimpan di `photo_url`
- [ ] Field `claim_procedure` adalah rich text/textarea bebas (bukan structured field) sesuai SRS
- [ ] Update status ke `claimed` memindahkan item dari listing aktif publik (tapi tetap tersimpan, bukan delete — untuk audit)

---

### 3.7 Donasi & Transparansi Keuangan — **PARSIAL (tabel baru `financial_reports`, terpisah dari `finance_transactions`)**

**Scope:** Sesuai SRS 3.4/section 2.3 di atas.

**Acceptance Criteria:**

- [ ] Halaman Donasi publik menampilkan info statis (QRIS image, nomor rekening, kontak) — CRUD-able oleh Admin/Superadmin
- [ ] `financial_reports` adalah entri manual periodik (bukan turunan otomatis dari `finance_transactions`) — Admin/Biro input `period`, `category`, `amount`, `description` secara manual
- [ ] Halaman publik Transparansi Keuangan menampilkan data dari `financial_reports`, bukan raw `finance_transactions`

---

### 3.8 Manajemen Konten/Blog — **BARU TOTAL**

**Scope:** Tidak dirinci mendalam di SRS v1.0 (disebut sebagai "Content & Media" umum) — perlu breakdown lebih lanjut sebelum sprint planning, tapi minimal:

**Acceptance Criteria:**

- [ ] Tabel `contents` mendukung multi-tipe (`blog`, `gallery`, `profile`, `achievement`, `alumni`) sesuai DBML
- [ ] Field `lang` (id/en) untuk mendukung i18n konten publik
- [ ] Draft vs Published state (`is_published` boolean)
- [ ] Editor konten mendukung rich text minimal (bold, italic, list, image embed) — **pilihan library editor belum ditentukan, perlu keputusan tim FE**

---

## 4. DEPENDENSI ANTAR-MODUL (URUTAN PENGERJAAN DISARANKAN)

```
Fase 0 (Fondasi — blocking semua modul lain):
  1. Migrasi Auth (admins → users + RBAC)
  2. Storage Service (S3-compatible)
  3. Notification Service (WhatsApp — interface generic dulu, provider bisa menyusul)

Fase 1 (Bisa paralel setelah Fase 0):
  4. Peminjaman Tempat
  5. Peminjaman Barang
  6. Event & RSVP (tabel baru, terpisah dari calendar_events)
  7. Lost & Found

Fase 2 (Extend existing, risk lebih rendah):
  8. Shorten Link extension (permission scoping + click logs + override)
  9. Financial Reports (tabel baru, terpisah dari finance_transactions)

Fase 3:
  10. Manajemen Konten/Blog
  11. i18n rollout ke seluruh halaman publik
```

**Alasan urutan:** Modul di Fase 1 semuanya _hard-dependent_ pada RBAC (siapa yang approve) dan Notification Service (WA), jadi Fase 0 wajib selesai/stabil dulu sebelum tim FE/BE mengerjakan modul fitur secara paralel.

---

## 5. OPEN DECISIONS (BELUM FINAL — PERLU KEPUTUSAN TIM SEBELUM SPRINT TERKAIT DIMULAI)

| #   | Keputusan Terbuka                                                                                          | Modul Terdampak                      | Urgensi                  |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------ |
| 1   | Provider WhatsApp API: Baileys (unofficial, murah, risiko ban) vs WA Business API resmi (stabil, berbayar) | Peminjaman Tempat/Barang, Event RSVP | Tinggi — blocking Fase 0 |
| 2   | SLA response time Admin untuk approval peminjaman (reminder/escalation policy)                             | Peminjaman Tempat/Barang             | Sedang                   |
| 3   | Kebijakan duplikasi RSVP dengan nomor WA sama pada event sama                                              | Event & RSVP                         | Sedang                   |
| 4   | Library rich text editor untuk Blog/Konten                                                                 | Manajemen Konten                     | Rendah                   |
| 5   | Fitur pembatalan booking oleh Jamaah setelah Approved — masuk v1 atau v2?                                  | Peminjaman Tempat/Barang             | Sedang                   |
| 6   | Retensi data RSVP & histori peminjaman (berapa lama sebelum diarsipkan)                                    | Seluruh modul booking/event          | Rendah                   |

---

_Dokumen ini adalah living document — update sesuai keputusan yang diambil pada poin Section 5 di atas. Dokumen selanjutnya: `ARCHITECTURE.md` (detail struktur folder baru, service layer pattern, dan RBAC middleware implementation)._

```

```
