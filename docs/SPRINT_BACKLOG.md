# SPRINT_BACKLOG.md

## Platform Website Terpadu JMMI ITS — Sprint Backlog

**Versi:** 1.0
**Timeline:** 14 Hari (7 Micro-Sprint x 2 Hari)
**Tim:** 10 orang — UI1, UI2 (UI/UX), FE1, FE2, FE3 (Frontend), BE1, BE2, BE3 (Backend), QA1, QA2 (QA/Tester)
**Referensi:** PRD.md, ARCHITECTURE.md, DATABASE_SCHEMA.md, API_CONTRACT.md, CODING_CONVENTIONS.md (semua v1.0)

---

## MICRO-SPRINT 1 (HARI 1–2): Setup, Design System, Core Auth & RBAC

### Task 1.1 — Design System Foundation (Token & Typography)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `JMMI-ITS Design System v1`
**Target Database / Tech Stack:** Figma Variables, Tailwind v4 token mapping
**RBAC & Middleware Guard:** N/A (internal design artifact)
**Detail Alur Logic / Design / Test Scope:**

- Susun color tokens (primary, secondary, semantic: success/warning/error/info), typography scale (heading H1-H6, body, caption), spacing scale (4/8/12/16/24/32px), border-radius, shadow tokens.
- Sinkronkan token dengan struktur `DESIGN_SYSTEM.md` template placeholder yang sudah disiapkan.
- Output token dalam format siap-mapping ke `tailwind.config.ts` (nama variable konsisten dengan CSS variable).
  **Acceptance Criteria (DoD):**
- [ ] Seluruh token warna & tipografi terdaftar di Figma Variables
- [ ] File Figma dibagikan ke FE1 untuk mapping ke Tailwind config
- [ ] Dokumentasi token diekspor sebagai referensi (JSON/markdown table)

### Task 1.2 — Wireframe Low-Fi: Core Flow (Auth, Dashboard Admin, Landing Publik)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `JMMI-ITS Wireframe Core Flow`
**Target Database / Tech Stack:** Figma
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Wireframe halaman Login, Admin Dashboard shell (sidebar+topbar), Landing Page publik, dan struktur navigasi utama (public vs admin).
- Definisikan breakpoint responsive (mobile/tablet/desktop) untuk ketiga halaman ini sebagai acuan pola bagi wireframe modul lain di sprint berikutnya.
  **Acceptance Criteria (DoD):**
- [ ] Wireframe 3 halaman inti selesai & di-review internal tim UI
- [ ] Breakpoint & grid system terdokumentasi untuk dipakai FE1-FE3
- [ ] Link Figma dibagikan ke channel tim dev

### Task 1.3 — Project Structure Setup & Design Token Integration

**Scope Utama:** Frontend Setup / Config
**Endpoint / Path / Artifact:** `tailwind.config.ts`, struktur folder `src/` sesuai ARCHITECTURE.md
**Target Database / Tech Stack:** Next.js 15, Tailwind v4, TypeScript
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Sesuaikan struktur folder existing repo dengan peta folder baru di ARCHITECTURE.md Section 1 (buat folder kosong: `components/booking/`, `components/events/`, `components/lost-found/`, dll).
- Import design token dari Task 1.1 ke `tailwind.config.ts` sebagai CSS variables.
- Setup base layout component (`RootLayout`) menggunakan token baru.
  **Acceptance Criteria (DoD):**
- [ ] Struktur folder baru ter-commit tanpa breaking existing pages
- [ ] Tailwind config berhasil resolve token warna/tipografi dari Figma
- [ ] `pnpm run lint:strict` & `pnpm run typecheck` PASS

### Task 1.4 — Login Page & Auth Store Refactor (Frontend)

**Scope Utama:** Frontend Component + State Management
**Endpoint / Path / Artifact:** `/login`, `src/stores/useAuthStore.ts`
**Target Database / Tech Stack:** React Hook Form, Zod, Zustand, TanStack Query
**RBAC & Middleware Guard:** Public (halaman login sendiri publik)
**Detail Alur Logic / Design / Test Scope:**

- Refactor `useAuthStore.ts` sesuai shape baru (ARCHITECTURE.md Section 2.5): `{ userId, email, name, role, permissions? }`.
- Form login dengan validasi Zod (email/phone + password), integrasi ke `POST /api/auth/login`.
- Redirect ke `/admin` sesuai role setelah login sukses; simpan token di cookie (mengikuti pola existing `universal-cookie`).
  **Acceptance Criteria (DoD):**
- [ ] Login berhasil untuk role superadmin/admin/biro dummy (seed data)
- [ ] Error message tampil jelas saat kredensial salah
- [ ] Auth state persist setelah refresh halaman

### Task 1.5 — Admin Layout Shell & Frontend Route Guard

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `app/admin/layout.tsx`, `components/admin/AdminSidebar.tsx` (existing, disesuaikan)
**Target Database / Tech Stack:** Next.js Middleware, Zustand
**RBAC & Middleware Guard:** Client-side guard berbasis `useAuthStore` role — redirect ke `/login` jika tidak authenticated
**Detail Alur Logic / Design / Test Scope:**

- Update `AdminSidebar.tsx` agar menu yang tampil menyesuaikan `role` user (mis. menu "Kelola User" hanya muncul untuk superadmin).
- Implementasi client-side route guard: render loading state saat cek auth, redirect jika `role` tidak sesuai halaman yang diakses.
- **Catatan:** Ini guard FE untuk UX saja — enforcement sesungguhnya tetap di backend (`withRbac`), jangan andalkan guard FE sebagai satu-satunya proteksi.
  **Acceptance Criteria (DoD):**
- [ ] Sidebar menu berbeda tampil sesuai role (superadmin/admin/biro)
- [ ] User tanpa login diarahkan ke `/login` saat akses `/admin/*`
- [ ] Tidak ada flash of unauthorized content (FOUC) saat loading auth state

### Task 1.6 — Migrasi Prisma: admins → users + RBAC Schema

**Scope Utama:** Backend Database / Migration
**Endpoint / Path / Artifact:** `prisma/schema.prisma`, `scripts/migrate-admins-to-users.ts`
**Target Database / Tech Stack:** Prisma ORM, PostgreSQL
**RBAC & Middleware Guard:** N/A (migration script, dijalankan manual)
**Detail Alur Logic / Design / Test Scope:**

- Tambahkan model `User`, `Permission`, `UserPermission` (additive migration) sesuai DATABASE_SCHEMA.md Section 1 — tabel `admins` TIDAK dihapus dulu.
- Jalankan `npx prisma migrate dev --name add_users_table_with_rbac`.
- Implementasikan & jalankan `migrate-admins-to-users.ts` di environment development, verifikasi jumlah row `admins` === `users`.
- Assign 1 akun sebagai `superadmin` manual pasca-migrasi.
  **Acceptance Criteria (DoD):**
- [ ] Migrasi Prisma berhasil tanpa error di development DB
- [ ] Seluruh data admin existing berhasil ter-migrasi ke `users` dengan password hash tetap valid (test login manual)
- [ ] Minimal 1 user berstatus `superadmin` tersedia untuk testing

### Task 1.7 — Auth Service Refactor (JWT Payload & withAuth Middleware)

**Scope Utama:** Backend API Handler / Middleware
**Endpoint / Path / Artifact:** `src/lib/api/auth.ts`, `src/lib/api/middleware/with-auth.ts`, `POST /api/auth/login`, `POST /api/auth/refresh`
**Target Database / Tech Stack:** Prisma, jsonwebtoken, bcrypt
**RBAC & Middleware Guard:** N/A (ini adalah middleware itu sendiri)
**Detail Alur Logic / Design / Test Scope:**

- Ubah JWT payload dari `{ adminId, email, type }` → `{ userId, email, role, type }` sesuai ARCHITECTURE.md Section 2.1.
- Implementasikan `withAuth` middleware wrapper sesuai kode referensi di ARCHITECTURE.md Section 2.2.
- Update `auth-service.ts`: query ke tabel `users` (bukan `admins`), cek `isActive` sebelum generate token.
- Endpoint `POST /api/auth/login` menerima `email` ATAU `phone` (Zod refine, minimal salah satu).
  **Acceptance Criteria (DoD):**
- [ ] Login menghasilkan token dengan payload baru (`userId`, `role`)
- [ ] Login ditolak (`403`) untuk user dengan `isActive: false`
- [ ] `withAuth` berhasil inject `req.user` untuk endpoint protected

### Task 1.8 — RBAC Middleware (withRbac) & Permission Seeding

**Scope Utama:** Backend Middleware / Service
**Endpoint / Path / Artifact:** `src/lib/api/middleware/with-rbac.ts`, `src/lib/api/services/permission-service.ts`, `GET /api/permissions`, `PUT /api/users/:id/permissions`
**Target Database / Tech Stack:** Prisma, PostgreSQL
**RBAC & Middleware Guard:** `withAuth` + role check internal (`superadmin` untuk endpoint permission management)
**Detail Alur Logic / Design / Test Scope:**

- Implementasikan `withRbac` sesuai kode referensi ARCHITECTURE.md Section 2.2 — cek `allowedRoles` langsung untuk superadmin/admin, cek `requiredPermission` granular khusus role `biro`.
- Implementasikan `permission-service.ts`: `checkUserPermission(userId, module, action)`.
- Seed data permission awal (10 module+action) sesuai mapping ARCHITECTURE.md Section 2.4.
- Endpoint `PUT /api/users/:id/permissions` — replace seluruh assignment permission user `biro` tertentu.
  **Acceptance Criteria (DoD):**
- [ ] `withRbac` berhasil block akses role yang tidak sesuai (`403 FORBIDDEN_ROLE`)
- [ ] User `biro` tanpa permission assigned mendapat `403 FORBIDDEN_PERMISSION` saat akses modul yang di-scope
- [ ] Permission seed data ter-insert lewat `prisma db seed`

### Task 1.9 — Test Suite Setup & Auth/RBAC Test Cases

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/auth/`, `src/__tests__/rbac/`
**Target Database / Tech Stack:** Jest, React Testing Library, Supertest (jika dipakai untuk API test)
**RBAC & Middleware Guard:** N/A (test suite)
**Detail Alur Logic / Design / Test Scope:**

- Susun test plan awal untuk modul Auth & RBAC (test case list, bukan implementasi penuh dulu — fokus setup framework test API).
- Test case: login sukses/gagal, token expired, `withAuth` reject tanpa token, `withRbac` reject role salah, `withRbac` reject `biro` tanpa permission.
- Setup mock data seed khusus testing (user dummy per role).
  **Acceptance Criteria (DoD):**
- [ ] Minimal 6 test case Auth/RBAC tertulis dan PASS
- [ ] Test data seed terpisah dari seed development (tidak saling mengganggu)
- [ ] Dokumentasi test case awal untuk dipakai QA1/QA2 di sprint berikutnya

### Task 1.10 — CI/CD Verification & Environment Setup Checklist

**Scope Utama:** QA / DevOps Support
**Endpoint / Path / Artifact:** `.github/workflows/lint.yml` (existing), `.env.example`
**Target Database / Tech Stack:** GitHub Actions, PNPM
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Verifikasi pipeline CI existing (`lint.yml`) tetap hijau setelah perubahan struktur folder & schema Prisma dari Task 1.3/1.6.
- Update `.env.example` dengan variable baru dari perubahan Auth (jika ada) dan buat checklist onboarding developer baru ke repo.
- Validasi seluruh anggota tim (10 orang) bisa `pnpm install` & `pnpm dev` tanpa error di lokal masing-masing.
  **Acceptance Criteria (DoD):**
- [ ] CI pipeline tetap PASS setelah perubahan sprint ini
- [ ] `.env.example` sinkron dengan environment variable terbaru
- [ ] Seluruh anggota tim konfirmasi berhasil setup lokal (tidak ada yang blocked)

---

## MICRO-SPRINT 2 (HARI 3–4): Room Booking & Item Booking Engine

### Task 2.1 — UI Design: Room Booking (Form Publik & Kalender)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Room Booking Flow`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain halaman publik `/peminjaman-tempat`: form submit, kalender publik (status occupied/available tanpa nama), state error saat bentrok jadwal.
- Desain view Admin: approval queue list + detail modal dengan info lengkap peminjam.
- Sertakan state kosong (empty state) dan loading state.
  **Acceptance Criteria (DoD):**
- [ ] Desain form publik & kalender selesai, mencakup mobile breakpoint
- [ ] Desain admin approval queue selesai
- [ ] Handoff spec (spacing, komponen) siap dipakai FE1

### Task 2.2 — UI Design: Item Booking (Form & Katalog Barang)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Item Booking Flow`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain halaman publik `/peminjaman-barang`: katalog barang dengan info stok, form submit dengan date range picker.
- Desain admin approval queue Item Booking + tombol "Tandai Dikembalikan".
  **Acceptance Criteria (DoD):**
- [ ] Desain katalog & form submit selesai
- [ ] Desain admin queue + mark-returned flow selesai
- [ ] Handoff spec siap dipakai FE2

### Task 2.3 — Frontend: Room Booking Public Form + Calendar Component

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/peminjaman-tempat`, `components/booking/RoomCalendar.tsx`
**Target Database / Tech Stack:** React Hook Form, Zod, TanStack Query, `POST /api/room-bookings`, `GET /api/room-bookings/calendar`
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Form submit dengan validasi Zod client-side (mirror schema backend: `roomId`, `jamaahName`, `jamaahPhone`, `purpose`, `startDate`, `endDate`).
- Calendar component fetch `GET /api/room-bookings/calendar?roomId&month=`, render status occupied/available.
- Handle error `409 BOOKING_CONFLICT` dengan pesan jelas + saran pilih slot lain.
  **Acceptance Criteria (DoD):**
- [ ] Submit berhasil untuk slot kosong, redirect ke halaman konfirmasi
- [ ] Error bentrok jadwal tertampil jelas ke user (bukan generic error)
- [ ] Kalender publik TIDAK menampilkan nama peminjam (verifikasi manual)

### Task 2.4 — Frontend: Item Booking Public Form + Katalog Component

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/peminjaman-barang`, `components/booking/ItemCatalog.tsx`
**Target Database / Tech Stack:** React Hook Form, Zod, TanStack Query, `POST /api/item-bookings`, `GET /api/items`
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Katalog barang menampilkan `totalStock`/`availableStock`, form submit dengan date-range picker (`borrowDate`–`returnDate`) dan `quantity`.
- Handle error `409 STOCK_UNAVAILABLE` dengan detail `{ requested, available }` ditampilkan ke user.
  **Acceptance Criteria (DoD):**
- [ ] Submit berhasil untuk stok tersedia
- [ ] Error stok tidak cukup menampilkan jumlah tersedia secara jelas
- [ ] Form tervalidasi Zod client-side sebelum submit

### Task 2.5 — Frontend: Admin Approval Queue (Room + Item Booking)

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/admin/peminjaman-tempat`, `/admin/peminjaman-barang`
**Target Database / Tech Stack:** TanStack Query, `GET/POST /api/room-bookings/*`, `GET/POST /api/item-bookings/*`
**RBAC & Middleware Guard:** Guard FE berbasis permission `room_bookings:approve` / `item_bookings:approve` dari `useAuthStore`
**Detail Alur Logic / Design / Test Scope:**

- List pengajuan dengan filter status (`pending`/`approved`/`rejected`), pagination.
- Modal approve/reject — reject wajib isi `reason` (tervalidasi, tidak bisa submit kosong).
- Tombol "Tandai Dikembalikan" khusus Item Booking.
  **Acceptance Criteria (DoD):**
- [ ] Approve/Reject berfungsi dan update list secara real-time (refetch/optimistic update)
- [ ] Reject tanpa alasan tidak bisa disubmit
- [ ] User tanpa permission terkait tidak melihat menu ini (sesuai Task 1.5)

### Task 2.6 — Backend: Room Booking Repository & Service (Overlap Check)

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `POST /api/room-bookings`, `POST /api/room-bookings/:id/approve`, `POST /api/room-bookings/:id/reject`, `GET /api/room-bookings/calendar`
**Target Database / Tech Stack:** `RoomBooking` table, Prisma `$transaction`, Zod
**RBAC & Middleware Guard:** Submit = Public; Approve/Reject = `withAuth` + `withRbac({ allowedRoles: ['superadmin','admin','biro'], requiredPermission: { module: 'room_bookings', action: 'approve' } })`
**Detail Alur Logic / Design / Test Scope:**

- Implementasi `roomBookingRepository` + `roomBookingService` sesuai kode referensi CODING_CONVENTIONS.md Section 3.1–3.2.
- Overlap-check + insert dibungkus `prisma.$transaction` (keputusan terkunci) — lempar `AppError('BOOKING_CONFLICT', ..., 409)` jika bentrok.
- Approve/Reject memicu `notificationService.send()` (gunakan stub sementara jika Notification Service belum final di Task 3.x).
  **Acceptance Criteria (DoD):**
- [ ] Overlap-check berhasil mencegah double-booking pada test manual (2 request bersamaan)
- [ ] Approve mengubah status + `approverId` tercatat
- [ ] Reject wajib `rejectionReason`, tervalidasi Zod

### Task 2.7 — Backend: Item Booking Repository & Service (Stock Check)

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `POST /api/item-bookings`, `POST /api/item-bookings/:id/approve`, `POST /api/item-bookings/:id/reject`, `POST /api/item-bookings/:id/mark-returned`
**Target Database / Tech Stack:** `ItemBooking`, `ItemAsset` table, Prisma `$transaction`, Zod
**RBAC & Middleware Guard:** Submit = Public; Approve/Reject/Mark-Returned = `withAuth` + `withRbac({ requiredPermission: { module: 'item_bookings', action: 'approve' } })`
**Detail Alur Logic / Design / Test Scope:**

- Validasi stok tersedia mempertimbangkan booking lain yang overlap tanggal (bukan hanya `totalStock` statis) — dibungkus `prisma.$transaction`.
- Reject penuh jika stok sebagian tidak cukup (bukan partial-approve otomatis, sesuai PRD Section 3.3 edge case).
- `mark-returned` mengisi `returnedAt`.
  **Acceptance Criteria (DoD):**
- [ ] Validasi stok overlap berfungsi benar (test dengan 2 booking tanggal beririsan)
- [ ] Request quantity > stok tersedia ditolak dengan detail jumlah tersedia
- [ ] Mark-returned berhasil update `returnedAt`

### Task 2.8 — Backend: Notification Service Scaffolding (Interface Only)

**Scope Utama:** Backend Service Layer
**Endpoint / Path / Artifact:** `src/lib/api/services/notification-service.ts`
**Target Database / Tech Stack:** TypeScript interface, `NotificationLog` table (Prisma)
**RBAC & Middleware Guard:** N/A (internal service)
**Detail Alur Logic / Design / Test Scope:**

- Buat interface `NotificationProvider` + `SendNotificationParams` + message templates sesuai ARCHITECTURE.md Section 4.1.
- Implementasi sementara: `MockNotificationProvider` yang hanya log ke `NotificationLog` dengan status `pending` (Baileys adapter sungguhan dikerjakan di Micro-Sprint 3).
- Ini memungkinkan Task 2.6/2.7 langsung integrasi tanpa menunggu Baileys selesai.
  **Acceptance Criteria (DoD):**
- [ ] Interface `NotificationProvider` final dan dipakai oleh `room-booking-service.ts` & `item-booking-service.ts`
- [ ] Mock provider mencatat log ke `notification_logs` tanpa error
- [ ] Service mudah di-swap ke Baileys adapter tanpa ubah kode pemanggil

### Task 2.9 — QA: Test Case Booking Conflict & Double-Booking

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/room-booking/`
**Target Database / Tech Stack:** Jest, Supertest/Vitest
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: submit 2 booking bersamaan pada slot sama → hanya 1 berhasil.
- Test case: submit dengan `endDate < startDate` → ditolak validasi Zod.
- Test case: approve/reject flow lengkap + verifikasi `rejectionReason` wajib.
- Manual test kalender publik memastikan TIDAK ada `jamaahName` bocor ke response publik.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 5 test case Room Booking tertulis dan PASS
- [ ] Bug ditemukan (jika ada) dilaporkan via issue tracker dengan detail reproduksi
- [ ] Regresi test Auth/RBAC dari Sprint 1 tetap PASS

### Task 2.10 — QA: Test Case Stock Validation & Approve/Reject Flow

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/item-booking/`
**Target Database / Tech Stack:** Jest, Supertest/Vitest
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: submit quantity melebihi stok tersedia → `409 STOCK_UNAVAILABLE` dengan detail benar.
- Test case: 2 booking barang sama pada rentang tanggal overlap dengan total quantity melebihi stok → yang kedua ditolak.
- Test case: mark-returned hanya bisa dilakukan oleh role dengan permission sesuai.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 4 test case Item Booking tertulis dan PASS
- [ ] Edge case partial-stock (reject penuh, bukan partial-approve) terverifikasi
- [ ] Laporan bug (jika ada) terdokumentasi dengan severity level

---

## MICRO-SPRINT 3 (HARI 5–6): Event, RSVP & Notification Service (Baileys)

### Task 3.1 — UI Design: Event Listing, Detail & RSVP Form

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Event & RSVP Flow`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain listing event publik (`/kalender` gabungan), detail event dengan tombol RSVP, state "Kuota Penuh" (disabled).
- Desain form RSVP (nama, WA, gender) + state sukses/gagal (termasuk pesan duplikat RSVP).
  **Acceptance Criteria (DoD):**
- [ ] Desain listing + detail + form RSVP selesai
- [ ] State kuota penuh & duplikat RSVP terdesain jelas
- [ ] Handoff spec siap dipakai FE1

### Task 3.2 — UI Design: Admin Event CRUD & Kalender Gabungan

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Admin Event Management`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain form create/edit event (dengan toggle kuota opsional), list peserta RSVP + tombol export CSV.
- Desain tampilan kalender admin yang menggabungkan `calendar_events` (agenda umum) dan `events` (dengan badge "Perlu Daftar").
  **Acceptance Criteria (DoD):**
- [ ] Desain admin CRUD event selesai
- [ ] Desain kalender gabungan (publik & admin) selesai, badge pembeda jelas
- [ ] Handoff spec siap dipakai FE2/FE3

### Task 3.3 — Frontend: Event Listing, Detail & RSVP Form

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/kegiatan/[eventId]`, `components/events/RsvpForm.tsx`
**Target Database / Tech Stack:** React Hook Form, Zod, TanStack Query, `GET /api/events`, `GET /api/events/:id`, `POST /api/events/:id/rsvp`
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Detail event menampilkan `rsvpCount`/`quotaMax`, tombol RSVP disabled otomatis jika `isQuotaFull: true`.
- Handle error `409 QUOTA_FULL` dan `409 DUPLICATE_RSVP` dengan pesan spesifik berbeda (bukan generic error).
  **Acceptance Criteria (DoD):**
- [ ] RSVP berhasil untuk kuota tersedia
- [ ] Tombol RSVP otomatis disabled saat kuota penuh (tanpa perlu submit dulu)
- [ ] Pesan error duplikat RSVP jelas ("nomor sudah terdaftar")

### Task 3.4 — Frontend: Admin Event CRUD + Export RSVP UI

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/admin/kegiatan`
**Target Database / Tech Stack:** TanStack Query, React Hook Form, Zod, `POST/PATCH /api/events`, `GET /api/events/:id/rsvp-entries`, `GET /api/events/:id/rsvp-entries/export`
**RBAC & Middleware Guard:** Guard FE berbasis permission `events:create` / `events:export_rsvp`
**Detail Alur Logic / Design / Test Scope:**

- Form create/edit event dengan toggle kuota opsional (jika di-off, `quotaMax` dikirim `null`).
- List peserta RSVP dengan pagination + tombol download CSV (trigger file download dari endpoint export).
  **Acceptance Criteria (DoD):**
- [ ] Create event dengan & tanpa kuota berfungsi
- [ ] List RSVP menampilkan data sesuai backend
- [ ] Export CSV berhasil ter-download dengan format benar

### Task 3.5 — Frontend: Kalender Gabungan Publik (Integrasi calendar/combined)

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/kalender`, `components/events/CombinedCalendar.tsx`
**Target Database / Tech Stack:** TanStack Query, `GET /api/calendar/combined`
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Integrasi 1x fetch ke endpoint gabungan (keputusan terkunci Open Decision #12), render agenda umum dan event ber-RSVP dalam satu kalender dengan badge pembeda visual.
- Klik item event ber-RSVP mengarahkan ke `/kegiatan/[eventId]`.
  **Acceptance Criteria (DoD):**
- [ ] Kalender menampilkan gabungan data dari kedua sumber dengan benar
- [ ] Badge "Perlu Daftar" tampil hanya untuk item dari tabel `events`
- [ ] Hanya 1x network request untuk load kalender (bukan 2x fetch terpisah di FE)

### Task 3.6 — Backend: Event & RSVP Repository/Service (Quota + Dedup)

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `POST /api/events`, `PATCH /api/events/:id`, `POST /api/events/:id/rsvp`, `GET /api/events/:id/rsvp-entries`, `GET /api/events/:id/rsvp-entries/export`
**Target Database / Tech Stack:** `Event`, `RsvpEntry` table, Prisma unique constraint `(eventId, phone)`, `$transaction`
**RBAC & Middleware Guard:** Create/Update Event & Export = `withAuth` + `withRbac({ requiredPermission: { module: 'events', action: 'create'/'export_rsvp' } })`; RSVP submit = Public
**Detail Alur Logic / Design / Test Scope:**

- RSVP submit: cek kuota (jika `quotaMax` di-set) dalam `$transaction`, tangkap `P2002` unique constraint violation dari DB dan translate ke `409 DUPLICATE_RSVP` (keputusan terkunci: 1 WA = 1 slot, enforced di level DB).
- Export CSV: generate file dari `RsvpEntry` list, `Content-Type: text/csv`.
  **Acceptance Criteria (DoD):**
- [ ] Race condition kuota tersisa 1 dengan 2 request bersamaan → hanya 1 berhasil (test manual concurrent request)
- [ ] Duplikat RSVP dengan nomor sama pada event sama ditolak `409 DUPLICATE_RSVP`
- [ ] Export CSV menghasilkan file valid & terbuka dengan benar di Excel/Sheets

### Task 3.7 — Backend: Standalone Baileys Service Setup (Node Process Terpisah)

**Scope Utama:** Backend Infrastructure / Service
**Endpoint / Path / Artifact:** Repo/folder terpisah `jmmi-baileys-service`, internal HTTP API (`POST /send-message`, `GET /status`)
**Target Database / Tech Stack:** Node.js, Baileys library, Express/Fastify (untuk expose internal API), auth session persisten
**RBAC & Middleware Guard:** Internal API key auth (`BAILEYS_SERVICE_API_KEY`) — bukan RBAC user, ini service-to-service
**Detail Alur Logic / Design / Test Scope:**

- Setup proses Node.js standalone yang menjalankan koneksi socket Baileys, expose endpoint internal `POST /send-message` (menerima `{ phone, message }`) dan `GET /status` (cek koneksi aktif).
- Simpan auth session Baileys di storage persisten (bukan filesystem ephemeral) sesuai catatan ARCHITECTURE.md Section 4.2.
- Belum perlu deploy ke hosting final (Railway/VPS) — cukup jalan di environment development/staging lokal dulu untuk testing integrasi.
  **Acceptance Criteria (DoD):**
- [ ] Service Baileys berhasil scan QR & terhubung ke nomor WA testing
- [ ] Endpoint `POST /send-message` berhasil mengirim pesan WA test
- [ ] Session tetap persisten setelah restart proses (tidak perlu scan ulang QR)

### Task 3.8 — Backend: Notification Service Baileys Adapter + Calendar Combined Endpoint

**Scope Utama:** Backend Service Layer + API Handler
**Endpoint / Path / Artifact:** `src/lib/api/services/notification-service.ts` (final), `GET /api/calendar/combined`
**Target Database / Tech Stack:** `NotificationLog` table, HTTP client (axios) ke Baileys service, Prisma
**RBAC & Middleware Guard:** `calendar/combined` = Public
**Detail Alur Logic / Design / Test Scope:**

- Ganti `MockNotificationProvider` (Task 2.8) dengan `BaileysNotificationProvider` sesuai kode referensi ARCHITECTURE.md Section 4.1 — panggil HTTP endpoint Baileys service (Task 3.7), BUKAN socket langsung di proses Next.js.
- Kegagalan kirim (`sendStatus: 'failed'`) TIDAK boleh menggagalkan proses utama (booking/approval tetap tersimpan).
- Implementasi `GET /api/calendar/combined`: query `calendar_events` + `events`, merge & sort berdasarkan tanggal, kembalikan format seragam ke frontend (keputusan terkunci Open Decision #12).
  **Acceptance Criteria (DoD):**
- [ ] Notifikasi WA nyata berhasil terkirim end-to-end dari flow booking approve (Task 2.6/2.7 terintegrasi penuh)
- [ ] Kegagalan kirim WA tidak menyebabkan API approval error 500
- [ ] `GET /api/calendar/combined` mengembalikan data gabungan terurut tanggal dengan benar

### Task 3.9 — QA: Test RSVP Quota Race Condition & Duplikat WA

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/events/`
**Target Database / Tech Stack:** Jest/Vitest, load test tool sederhana (mis. autocannon) untuk concurrent request
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: event `quotaMax: 1` dengan 2 request RSVP bersamaan → hanya 1 sukses, yang lain dapat `409 QUOTA_FULL`.
- Test case: RSVP dengan nomor WA sama 2x pada event sama → kedua kali ditolak `409 DUPLICATE_RSVP`.
- Test case: event tanpa `quotaMax` (null) menerima RSVP tanpa batas.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 4 test case race condition & dedup tertulis dan PASS konsisten (run 5x tanpa flaky)
- [ ] Bug race condition (jika ditemukan) dilaporkan dengan detail reproduksi
- [ ] Regresi Room/Item Booking dari Sprint 2 tetap PASS

### Task 3.10 — QA: Test Notification Delivery & Calendar Combined Endpoint

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/notification/`, `src/__tests__/calendar/`
**Target Database / Tech Stack:** Jest/Vitest, manual testing dengan nomor WA testing
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Manual test: approve booking → verifikasi pesan WA benar-benar diterima di nomor test, isi pesan sesuai template.
- Test case: `notification_logs` mencatat status `sent`/`failed` dengan benar.
- Test case: `GET /api/calendar/combined` mengembalikan gabungan data yang benar (verifikasi item dari kedua sumber tabel muncul dengan flag yang tepat).
  **Acceptance Criteria (DoD):**
- [ ] Minimal 3 skenario notifikasi (approve, reject, RSVP confirmed) terverifikasi terkirim nyata
- [ ] Log status tersimpan akurat di `notification_logs`
- [ ] Endpoint kalender gabungan lulus test data dari kedua sumber tabel

---

## MICRO-SPRINT 4 (HARI 7–8): Lost & Found & Shortlink Engine

### Task 4.1 — UI Design: Lost & Found (Listing, Detail, Admin Posting Form)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Lost & Found Flow`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain listing publik dengan grid foto barang, detail item dengan `claimProcedure` yang jelas dibaca.
- Desain form posting Admin/Biro (upload foto, field lokasi & tanggal ditemukan) dan tombol "Tandai Diklaim".
  **Acceptance Criteria (DoD):**
- [ ] Desain listing + detail publik selesai
- [ ] Desain admin posting form + mark-claimed action selesai
- [ ] Handoff spec siap dipakai FE1/FE2

### Task 4.2 — UI Design: Shortlink Dashboard Refresh (Analytics & Override)

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Shortlink Dashboard v2`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain dashboard analytics per-link (grafik klik over time), disesuaikan visibilitas data (Biro hanya link sendiri).
- Desain modal khusus Superadmin untuk override slug yang sudah dipakai (dengan warning jelas bahwa ini mengganti target URL orang lain).
  **Acceptance Criteria (DoD):**
- [ ] Desain dashboard analytics selesai
- [ ] Desain modal override slug (dengan warning state) selesai
- [ ] Handoff spec siap dipakai FE3

### Task 4.3 — Frontend: Lost & Found Public Pages

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/lost-and-found`, `/lost-and-found/[id]`
**Target Database / Tech Stack:** TanStack Query, `GET /api/lost-found`, `GET /api/lost-found/:id`
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Listing dengan pagination, hanya menampilkan item `status: active`.
- Halaman detail menampilkan foto, deskripsi, dan `claimProcedure` lengkap (rich text/paragraf).
  **Acceptance Criteria (DoD):**
- [ ] Listing & detail tampil sesuai data backend
- [ ] Item berstatus `claimed` tidak muncul di listing publik
- [ ] Responsive di mobile (grid foto menyesuaikan)

### Task 4.4 — Frontend: Lost & Found Admin CRUD + Upload Integration

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/admin/lost-and-found`
**Target Database / Tech Stack:** React Hook Form, Zod, `POST /api/lost-found`, `PATCH /api/lost-found/:id/mark-claimed`, `POST /api/upload`
**RBAC & Middleware Guard:** Guard FE berbasis permission `lost_found:create`
**Detail Alur Logic / Design / Test Scope:**

- Form posting dengan upload foto: panggil `POST /api/upload` (`folder: 'lost-found'`) dulu, ambil `url`, baru submit form utama dengan `photoUrl` terisi.
- Validasi ukuran file (max 5MB) & tipe (`image/*`) di client sebelum upload (mirror validasi backend).
- Tombol "Tandai Diklaim" dengan konfirmasi dialog.
  **Acceptance Criteria (DoD):**
- [ ] Upload foto berhasil dan `photoUrl` tersimpan benar di item baru
- [ ] File > 5MB atau tipe salah ditolak dengan pesan jelas sebelum upload terjadi
- [ ] Mark-claimed berhasil dan item hilang dari listing publik seketika

### Task 4.5 — Frontend: Shortlink Extension UI (Permission Scoping, Analytics, Override)

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/admin/shortlinks` (existing, disesuaikan), `components/admin/ShortlinkOverrideModal.tsx`
**Target Database / Tech Stack:** TanStack Query, `GET/POST /api/shortlinks`, `PUT /api/shortlinks/:id/override`, `GET /api/shortlinks/:id/analytics`
**RBAC & Middleware Guard:** List/Create — guard permission `short_links:create`; Modal Override — guard `role === 'superadmin'` khusus
**Detail Alur Logic / Design / Test Scope:**

- Update UI existing agar list link terfilter otomatis (Biro hanya lihat link miliknya — data sudah difilter backend, FE cukup render apa adanya).
- Tambah tombol "Override" HANYA muncul untuk role `superadmin`, membuka modal konfirmasi sebelum submit.
- Halaman analytics per-link menampilkan grafik `clicksOverTime` (pakai chart library ringan, mis. Recharts).
  **Acceptance Criteria (DoD):**
- [ ] User `biro` hanya melihat link miliknya sendiri di list
- [ ] Tombol Override hanya tampil untuk Superadmin, berfungsi dengan konfirmasi
- [ ] Grafik analytics menampilkan data klik sesuai rentang tanggal

### Task 4.6 — Backend: Lost & Found Repository/Service + Storage Service (S3)

**Scope Utama:** Backend API Handler + Service Layer
**Endpoint / Path / Artifact:** `POST /api/lost-found`, `GET /api/lost-found`, `GET /api/lost-found/:id`, `PATCH /api/lost-found/:id/mark-claimed`, `src/lib/api/services/storage-service.ts`
**Target Database / Tech Stack:** `LostFoundItem` table, Prisma, AWS SDK S3 Client / Supabase Storage
**RBAC & Middleware Guard:** Create/Mark-claimed = `withAuth` + `withRbac({ requiredPermission: { module: 'lost_found', action: 'create' } })`; Read = Public
**Detail Alur Logic / Design / Test Scope:**

- Implementasikan `S3CompatibleStorageService` sesuai kode referensi ARCHITECTURE.md Section 3.1 — konfigurasi via environment variable (`STORAGE_ENDPOINT`, dll).
- Listing publik hanya query `status: 'active'`, sorted `createdAt` desc (pakai index `idx_lost_found_listing`).
- Mark-claimed adalah soft-update status, bukan delete (audit trail).
  **Acceptance Criteria (DoD):**
- [ ] Upload foto ke S3-compatible storage berhasil, URL publik valid dan bisa diakses browser
- [ ] Listing publik hanya menampilkan status `active`
- [ ] Mark-claimed berhasil update status tanpa hard-delete data

### Task 4.7 — Backend: Shortlink Extension (RBAC Scoping, Click Logs, Override Endpoint)

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `GET/POST /api/shortlinks` (existing, disesuaikan), `PUT /api/shortlinks/:id/override` (baru), `GET /api/shortlinks/:id/analytics` (baru), `app/s/[shortCode]/route.ts` (existing, disesuaikan)
**Target Database / Tech Stack:** `ShortLink`, `LinkClickLog` table, Prisma
**RBAC & Middleware Guard:** Create = `withRbac({ requiredPermission: { module: 'short_links', action: 'create' } })`; Override = `withRbac({ allowedRoles: ['superadmin'] })` khusus, tanpa cek permission granular
**Detail Alur Logic / Design / Test Scope:**

- Update endpoint create/list existing agar terfilter `createdBy` untuk role `biro` (query service layer, bukan filter di FE).
- Redirect handler `app/s/[shortCode]/route.ts` (existing): tambahkan insert `LinkClickLog` (timestamp, referrer) setiap kali diakses, TANPA mengubah kolom agregat `click_count` yang sudah ada (dipertahankan untuk performa).
- Endpoint override slug: validasi role `superadmin` secara eksplisit di service layer (bukan lewat tabel permission).
  **Acceptance Criteria (DoD):**
- [ ] Query list link ter-filter benar berdasarkan `createdBy` untuk role `biro`
- [ ] Setiap akses redirect tercatat di `LinkClickLog` tanpa mengganggu performa redirect (latensi tetap rendah)
- [ ] Override slug hanya berhasil untuk role `superadmin`, ditolak untuk role lain meski punya permission `short_links:create`

### Task 4.8 — Backend: Upload Endpoint (/api/upload) dengan Validasi

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `POST /api/upload`
**Target Database / Tech Stack:** Next.js FormData handling, `storage-service.ts` (Task 4.6)
**RBAC & Middleware Guard:** `withAuth` + `withRbac({ allowedRoles: ['superadmin','admin','biro'] })` (validasi permission kontekstual per folder dilakukan di endpoint pemanggil, bukan di sini)
**Detail Alur Logic / Design / Test Scope:**

- Terima `multipart/form-data` (`file`, `folder`), validasi ukuran (max 5MB) dan tipe (`image/jpeg`, `image/png`, `image/webp`) sebelum panggil `storageService.upload()`.
- Return `{ url, key }` sesuai API_CONTRACT.md Section 11.
  **Acceptance Criteria (DoD):**
- [ ] File valid berhasil upload dan mengembalikan URL yang bisa diakses
- [ ] File > 5MB ditolak `400 VALIDATION_ERROR` sebelum proses upload ke storage (hemat biaya/bandwidth)
- [ ] Tipe file selain gambar ditolak dengan pesan jelas

### Task 4.9 — QA: Test Lost & Found Flow & Upload Validation

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/lost-found/`, `src/__tests__/upload/`
**Target Database / Tech Stack:** Jest/Vitest
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: posting item lengkap dengan foto berhasil, item muncul di listing publik.
- Test case: mark-claimed menghilangkan item dari listing publik tapi data tetap ada di DB (query langsung by ID masih bisa).
- Test case upload: file besar/tipe salah ditolak sesuai constraint.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 5 test case Lost & Found + Upload tertulis dan PASS
- [ ] Manual test upload dengan file real (foto) berhasil end-to-end sampai tampil di UI
- [ ] Regresi Event/RSVP dari Sprint 3 tetap PASS

### Task 4.10 — QA: Test Shortlink RBAC Scoping & Analytics Accuracy

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/shortlinks/`
**Target Database / Tech Stack:** Jest/Vitest
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: user `biro` A tidak bisa melihat/override link milik `biro` B.
- Test case: user `admin` (bukan superadmin) mencoba akses endpoint override → ditolak `403`.
- Test case: klik link berulang kali → `LinkClickLog` bertambah sesuai jumlah klik, analytics endpoint mengembalikan angka yang cocok.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 4 test case RBAC scoping & analytics tertulis dan PASS
- [ ] Percobaan lateral access (biro ke data biro lain) berhasil diblokir dan terverifikasi
- [ ] Bug (jika ditemukan) dilaporkan dengan langkah reproduksi jelas

---

## MICRO-SPRINT 5 (HARI 9–10): Financial Reports & Public Jamaah Pages

### Task 5.1 — UI Design: Financial Reports & Donasi Publik

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Finance & Donasi Public Pages`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain halaman publik `/laporan-keuangan` (tabel/list per periode) dan `/donasi` (info QRIS, rekening, kontak narahubung statis).
- Desain admin form input laporan keuangan periodik.
  **Acceptance Criteria (DoD):**
- [ ] Desain kedua halaman publik selesai
- [ ] Desain admin form financial report selesai
- [ ] Handoff spec siap dipakai FE1/FE2

### Task 5.2 — UI Design: Halaman Identitas Publik & Toggle i18n

**Scope Utama:** Figma UI & Spec
**Endpoint / Path / Artifact:** Figma File: `Public Identity Pages & i18n`
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain halaman About/Sejarah/Visi/Kilas Balik (landing pages statis sesuai SRS Section Profil & Identity).
- Desain komponen language switcher (ID/EN) yang persisten di navbar, termasuk state aktif visual.
  **Acceptance Criteria (DoD):**
- [ ] Desain halaman identitas publik selesai
- [ ] Desain language switcher selesai dengan kedua state (ID aktif/EN aktif)
- [ ] Handoff spec siap dipakai FE2/FE3

### Task 5.3 — Frontend: Financial Reports Public + Admin CRUD

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/laporan-keuangan`, `/admin/laporan-keuangan`
**Target Database / Tech Stack:** TanStack Query, React Hook Form, Zod, `GET/POST/PATCH/DELETE /api/financial-reports`
**RBAC & Middleware Guard:** Publik = Public; Admin CRUD = guard permission `financial_reports:create`
**Detail Alur Logic / Design / Test Scope:**

- Halaman publik menampilkan data per periode dengan filter `?period=`.
- Form admin input manual (`period`, `category`, `amount`, `description`) — TIDAK ada agregasi otomatis dari `finance_transactions` (sesuai keputusan arsitektur terkunci).
  **Acceptance Criteria (DoD):**
- [ ] Data publik tampil sesuai filter periode
- [ ] Admin berhasil CRUD laporan keuangan manual
- [ ] Validasi `amount` tidak boleh negatif (Zod)

### Task 5.4 — Frontend: Donasi Statis + Halaman Identitas Publik

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/donasi`, `/about`, `/sejarah`, `/visi`, `/kilas-balik`
**Target Database / Tech Stack:** Next.js Static/Server Component, CMS-driven content (dari modul Content jika sudah tersedia, atau hardcoded sementara)
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Halaman Donasi menampilkan QRIS image, nomor rekening, kontak — data statis dari admin-editable content (CRUD sederhana, bisa pinjam pola `Content` model jika modul CMS di Sprint 6 belum siap, gunakan placeholder data untuk sementara).
- Halaman identitas publik (About, Sejarah, dll) sesuai wireframe Sprint 1.
  **Acceptance Criteria (DoD):**
- [ ] Halaman Donasi tampil dengan data QRIS/rekening (placeholder boleh, struktur harus final)
- [ ] Seluruh halaman identitas publik ter-render sesuai desain
- [ ] Responsive di seluruh breakpoint

### Task 5.5 — Frontend: Implementasi i18n (ID/EN) Rollout Publik

**Scope Utama:** Frontend Infrastructure
**Endpoint / Path / Artifact:** `next-intl` atau setara (pilihan library — konfirmasi tim FE), seluruh route group `(public)`
**Target Database / Tech Stack:** Next.js App Router i18n routing, Content `lang` field (untuk konten dinamis nanti di Sprint 6)
**RBAC & Middleware Guard:** Public
**Detail Alur Logic / Design / Test Scope:**

- Setup library i18n, terjemahkan seluruh string statis di halaman publik yang sudah ada sampai Sprint 5 (Home, About, Peminjaman, Event, Lost&Found, Donasi, Laporan Keuangan).
- Language switcher persisten (tersimpan preference, mis. cookie) sesuai desain Task 5.2.
  **Acceptance Criteria (DoD):**
- [ ] Toggle ID/EN berfungsi di seluruh halaman publik yang sudah dibangun
- [ ] Preference bahasa persisten antar-halaman (tidak reset saat navigasi)
- [ ] Tidak ada string statis yang ter-lewat (hardcoded tanpa terjemahan)

### Task 5.6 — Backend: Financial Reports Repository/Service

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `GET/POST/PATCH/DELETE /api/financial-reports`
**Target Database / Tech Stack:** `FinancialReport` table, Prisma, Zod
**RBAC & Middleware Guard:** Read = Public; Create/Update/Delete = `withAuth` + `withRbac({ requiredPermission: { module: 'financial_reports', action: 'create' } })`
**Detail Alur Logic / Design / Test Scope:**

- Implementasi CRUD standar mengikuti pola Repository-Service (CODING_CONVENTIONS.md Section 3.1–3.2).
- Query publik menggunakan index `idx_financial_report_period` untuk filter periode.
  **Acceptance Criteria (DoD):**
- [ ] CRUD lengkap berfungsi sesuai kontrak API_CONTRACT.md Section 8
- [ ] Filter periode di endpoint publik berjalan efisien (verifikasi query plan)
- [ ] Validasi `amount` (harus positif) tervalidasi di layer Zod

### Task 5.7 — Backend: OTP Tracking Service (Rate Limit 3/10 Menit)

**Scope Utama:** Backend Service Layer
**Endpoint / Path / Artifact:** `POST /api/room-bookings/track/request-otp`, `POST /api/room-bookings/track`, `POST /api/item-bookings/track/request-otp`, `POST /api/item-bookings/track`
**Target Database / Tech Stack:** Redis atau in-memory rate limiter (disesuaikan infra tersedia), `notificationService` (kirim OTP via WA)
**RBAC & Middleware Guard:** Public, dengan rate limiting per nomor telepon
**Detail Alur Logic / Design / Test Scope:**

- Implementasi rate limit: maksimal 3 request OTP per 10 menit per nomor WA (keputusan terkunci) — response `429 RATE_LIMITED` jika melebihi.
- OTP dikirim via `notificationService` (WA), verifikasi OTP untuk return riwayat booking terkait nomor tsb.
- OTP expired setelah durasi tertentu (disarankan 5 menit, dikonfirmasi tim jika perlu presisi lebih lanjut).
  **Acceptance Criteria (DoD):**
- [ ] Request OTP ke-4 dalam 10 menit ditolak `429 RATE_LIMITED`
- [ ] OTP valid berhasil menampilkan riwayat booking terkait nomor
- [ ] OTP expired tidak bisa dipakai verifikasi (ditolak dengan pesan jelas)

### Task 5.8 — Backend: Performance Pass (Query Optimization & Index Verification)

**Scope Utama:** Backend Optimization
**Endpoint / Path / Artifact:** Seluruh repository yang sudah dibuat sampai Sprint 5
**Target Database / Tech Stack:** Prisma `select`/`include` audit, PostgreSQL `EXPLAIN ANALYZE`
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Audit seluruh query `findMany` di repository layer — pastikan menggunakan `select` eksplisit, tidak menarik relasi yang tidak perlu.
- Verifikasi index yang didefinisikan di DATABASE_SCHEMA.md benar-benar dipakai (`EXPLAIN ANALYZE` pada query kritis: overlap-check, listing publik dengan filter).
- Dokumentasikan temuan performa (jika ada query lambat) untuk perbaikan di Sprint 7.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh `findMany` kritis menggunakan `select` eksplisit
- [ ] Index pada tabel booking & content terverifikasi dipakai oleh query planner
- [ ] Laporan performa (temuan + rekomendasi) terdokumentasi untuk sprint berikutnya

### Task 5.9 — QA: Test Financial Reports CRUD & OTP Rate Limit

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** `src/__tests__/financial-reports/`, `src/__tests__/otp-tracking/`
**Target Database / Tech Stack:** Jest/Vitest
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Test case: CRUD financial report lengkap dengan role yang benar/salah.
- Test case: request OTP ke-4 dalam window 10 menit ditolak, request ke-1 di window baru (setelah 10 menit) diterima kembali.
- Test case: OTP salah/expired ditolak saat verifikasi.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 5 test case tertulis dan PASS
- [ ] Rate limit terverifikasi konsisten (tidak flaky pada re-run)
- [ ] Regresi Lost & Found/Shortlink dari Sprint 4 tetap PASS

### Task 5.10 — QA: Test i18n & Regresi Halaman Publik

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** Manual + automated test seluruh halaman publik
**Target Database / Tech Stack:** Playwright (E2E, jika sudah disetup) atau manual testing checklist
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Toggle ID/EN di setiap halaman publik yang sudah dibangun, verifikasi tidak ada string ter-lewat/rusak.
- Regression pass menyeluruh terhadap seluruh modul publik yang sudah selesai sampai Sprint 5 (booking, event, lost&found, shortlink redirect, finance, donasi).
  **Acceptance Criteria (DoD):**
- [ ] Checklist i18n selesai untuk seluruh halaman publik, 0 string ter-lewat
- [ ] Regression checklist seluruh modul publik PASS
- [ ] Bug list terkonsolidasi dan diprioritaskan untuk Sprint 6/7

---

## MICRO-SPRINT 6 (HARI 11–12): CMS Content Admin & Edge Case Polish

### Task 6.1 — Design Audit: Konsistensi Seluruh Halaman vs Design System

**Scope Utama:** Design Audit
**Endpoint / Path / Artifact:** Seluruh halaman yang sudah dibangun (Sprint 1-5), Figma Design System v1
**Target Database / Tech Stack:** Figma, browser DevTools
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Review seluruh halaman production-ready terhadap token warna/tipografi/spacing di Design System — catat penyimpangan (mis. warna hardcoded yang tidak pakai token, spacing tidak konsisten).
- Buat daftar temuan dengan prioritas (Critical/Minor) untuk diperbaiki FE1-FE3 di Task 6.4.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh halaman ter-review (checklist per halaman)
- [ ] Daftar temuan inkonsistensi terdokumentasi dengan screenshot & prioritas
- [ ] Temuan Critical dikomunikasikan langsung ke FE terkait

### Task 6.2 — UI Design: Blog/CMS Editor & Component Handoff Documentation

**Scope Utama:** Figma UI & Spec + Dokumentasi
**Endpoint / Path / Artifact:** Figma File: `CMS Blog Editor`, `UI_COMPONENT_MAP.md` (draft)
**Target Database / Tech Stack:** Figma, Design System v1
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Desain admin CMS editor untuk Blog/Konten (title, body rich text, media upload, toggle publish, pilihan bahasa).
- Mulai susun draft `UI_COMPONENT_MAP.md` — daftar komponen reusable yang sudah dibangun sampai titik ini (Button, Modal, Form Field, Card, dll) sebagai referensi bagi FE agar tidak duplikasi komponen.
  **Acceptance Criteria (DoD):**
- [ ] Desain CMS editor selesai, termasuk state draft/published
- [ ] Draft `UI_COMPONENT_MAP.md` mencakup minimal 15 komponen reusable teridentifikasi
- [ ] Handoff spec siap dipakai FE2

### Task 6.3 — Frontend: Content/Blog Public Pages

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/blog`, `/blog/[slug]`
**Target Database / Tech Stack:** TanStack Query, `GET /api/content`, `GET /api/content/:id`
**RBAC & Middleware Guard:** Public (hanya `isPublished: true`)
**Detail Alur Logic / Design / Test Scope:**

- Listing blog dengan filter `type`, `lang` (sinkron dengan i18n toggle dari Sprint 5), pagination.
- Detail artikel menampilkan `body` (render sebagai rich text/HTML aman — sanitasi wajib untuk cegah XSS).
  **Acceptance Criteria (DoD):**
- [ ] Listing & detail blog tampil sesuai bahasa aktif
- [ ] Konten draft (`isPublished: false`) tidak muncul di halaman publik
- [ ] Rich text ter-render aman (tidak vulnerable XSS — verifikasi dengan sanitization library)

### Task 6.4 — Frontend: Content/Blog Admin CMS Editor + Edge Case Polish

**Scope Utama:** Frontend Component
**Endpoint / Path / Artifact:** `/admin/blog`
**Target Database / Tech Stack:** Rich text editor library (sesuai keputusan tim FE — Tiptap/Lexical direkomendasikan), `POST/PATCH /api/content`, `POST /api/content/:id/publish`
**RBAC & Middleware Guard:** Guard permission `content:create` (create/edit), `content:publish` (tombol publish terpisah)
**Detail Alur Logic / Design / Test Scope:**

- Integrasi rich text editor + upload gambar inline (via `POST /api/upload`, `folder: 'content'`).
- Tombol "Publish" terpisah dari "Save Draft" — hanya aktif jika user punya permission `content:publish`.
- Sekaligus perbaiki temuan Critical dari Design Audit (Task 6.1) yang relevan dengan komponen FE1-FE3 kerjakan.
  **Acceptance Criteria (DoD):**
- [ ] Editor rich text berfungsi, upload gambar inline berhasil
- [ ] Tombol Publish hanya aktif untuk user dengan permission `content:publish`
- [ ] Minimal 80% temuan Critical dari Design Audit sudah diperbaiki

### Task 6.5 — Frontend: Edge Case Polish Lintas Modul (Empty/Error/Loading State)

**Scope Utama:** Frontend Polish
**Endpoint / Path / Artifact:** Seluruh halaman publik & admin yang sudah dibangun
**Target Database / Tech Stack:** React Suspense/Skeleton component (existing di `components/`)
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Audit seluruh halaman untuk memastikan ada state: loading (skeleton, bukan blank), empty (pesan jelas + ilustrasi jika ada), error (retry button jika relevan).
- Fokus pada modul yang paling sering diakses Jamaah: booking status, event listing, lost & found.
  **Acceptance Criteria (DoD):**
- [ ] Checklist state (loading/empty/error) terverifikasi untuk minimal 10 halaman utama
- [ ] Tidak ada halaman yang menampilkan blank screen saat data kosong/loading
- [ ] Perbaikan temuan Minor dari Design Audit yang relevan

### Task 6.6 — Backend: Content Repository/Service (Draft/Publish Flow)

**Scope Utama:** Backend API Handler
**Endpoint / Path / Artifact:** `GET/POST/PATCH /api/content`, `POST /api/content/:id/publish`
**Target Database / Tech Stack:** `Content` table, Prisma, Zod
**RBAC & Middleware Guard:** Read published = Public; Create/Update = `withRbac({ requiredPermission: { module: 'content', action: 'create' } })`; Publish = `withRbac({ requiredPermission: { module: 'content', action: 'publish' } })`
**Detail Alur Logic / Design / Test Scope:**

- Implementasi CRUD dengan state `isPublished` default `false`.
- Endpoint publish terpisah dari update biasa — permission `content:publish` sengaja dipisah dari `content:create` (sesuai ARCHITECTURE.md Section 2.4) agar tim bisa punya role "penulis" vs "editor/publisher" jika diperlukan ke depan.
- Query publik menggunakan index `idx_content_listing` (`type, isPublished, lang`).
  **Acceptance Criteria (DoD):**
- [ ] Content baru default draft, tidak muncul di endpoint publik sebelum di-publish
- [ ] User dengan permission `content:create` tapi TANPA `content:publish` tidak bisa publish (ditolak 403)
- [ ] Query listing publik memakai index yang benar (verifikasi `EXPLAIN`)

### Task 6.7 — Backend: Edge Case Polish (Validasi & Error Code Consistency Audit)

**Scope Utama:** Backend Polish
**Endpoint / Path / Artifact:** Seluruh endpoint yang sudah dibuat sampai Sprint 6
**Target Database / Tech Stack:** Zod schema audit, `AppError` code consistency check
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Audit seluruh endpoint terhadap tabel `error.code` standar di API_CONTRACT.md Section 1.3 — pastikan tidak ada endpoint yang melempar error code custom di luar daftar tanpa didokumentasikan.
- Perketat validasi Zod di endpoint yang mungkin masih longgar (mis. field opsional yang seharusnya ada batas panjang string).
  **Acceptance Criteria (DoD):**
- [ ] Seluruh endpoint terverifikasi menggunakan `error.code` yang konsisten dengan API_CONTRACT.md
- [ ] Tidak ada endpoint tanpa validasi Zod pada body/query input
- [ ] Temuan inkonsistensi (jika ada) diperbaiki di sprint ini, bukan ditunda

### Task 6.8 — Backend: Security Pass (Audit RBAC Enforcement Menyeluruh)

**Scope Utama:** Backend Security Audit
**Endpoint / Path / Artifact:** Seluruh endpoint protected yang sudah dibuat sampai Sprint 6
**Target Database / Tech Stack:** Manual code review + automated test bantuan QA2 (Task 6.10)
**RBAC & Middleware Guard:** N/A (ini adalah audit terhadap middleware yang sudah ada)
**Detail Alur Logic / Design / Test Scope:**

- Review setiap route handler memastikan `withAuth` + `withRbac` terpasang dengan `allowedRoles`/`requiredPermission` yang BENAR sesuai API_CONTRACT.md Section 12 (tabel ringkasan otorisasi).
- Cek khusus: endpoint yang seharusnya publik TIDAK tertutup RBAC secara tidak sengaja, dan sebaliknya endpoint admin TIDAK ter-expose publik karena lupa middleware.
- Review rate limiting OTP (Task 5.7) tidak bisa di-bypass (mis. dengan spoof header).
  **Acceptance Criteria (DoD):**
- [ ] Seluruh endpoint protected terverifikasi memiliki middleware yang sesuai tabel API_CONTRACT.md
- [ ] 0 endpoint yang salah expose (publik jadi protected, atau sebaliknya)
- [ ] Temuan celah keamanan (jika ada) diperbaiki sebelum Sprint 7

### Task 6.9 — QA: Full Regression Test Pass Seluruh Modul

**Scope Utama:** QA Test Suite
**Endpoint / Path / Artifact:** Seluruh modul yang sudah dibangun (Sprint 1-6)
**Target Database / Tech Stack:** Jest/Vitest, Playwright (jika ada E2E), manual checklist
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Jalankan seluruh test suite yang sudah ditulis dari Sprint 1-5, plus tambahan test case untuk modul Content/CMS baru.
- Regression checklist manual untuk flow end-to-end lintas modul (mis. submit booking → approve → notifikasi WA terkirim → cek status via OTP).
  **Acceptance Criteria (DoD):**
- [ ] 100% test suite existing tetap PASS setelah perubahan Sprint 6
- [ ] Minimal 3 skenario end-to-end lintas modul terverifikasi manual
- [ ] Bug list terkonsolidasi & diprioritaskan untuk Sprint 7

### Task 6.10 — QA: Security/RBAC Lateral Access Test

**Scope Utama:** QA Test Suite (Security-focused)
**Endpoint / Path / Artifact:** Seluruh endpoint protected
**Target Database / Tech Stack:** Manual API testing (Postman/Insomnia/Vitest dengan token manipulasi)
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Coba akses endpoint admin dengan token role `biro` tanpa permission terkait — pastikan selalu `403`, tidak ada kebocoran data.
- Coba manipulasi request langsung ke API (bypass UI) sebagai role rendah untuk approve booking, publish content, override shortlink — pastikan seluruhnya diblokir sesuai RBAC.
- Verifikasi hasil temuan Task 6.8 (security pass Backend) dengan pengujian independen.
  **Acceptance Criteria (DoD):**
- [ ] Minimal 8 skenario lateral access test dijalankan, seluruhnya berhasil diblokir sistem
- [ ] Laporan security test terdokumentasi (pass/fail per skenario)
- [ ] 0 temuan celah RBAC yang belum diperbaiki sebelum Sprint 7

---

## MICRO-SPRINT 7 (HARI 13–14): Integration Testing, Bug Fixing, Load Test, & Deployment Prep

### Task 7.1 — Assets Export & Design Documentation Handoff

**Scope Utama:** Design Handoff
**Endpoint / Path / Artifact:** `/public` assets folder, `DESIGN_SYSTEM.md` (final)
**Target Database / Tech Stack:** Figma export (SVG/PNG optimized), markdown dokumentasi
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Export seluruh final asset (icon, ilustrasi, logo) dalam format optimized untuk production, taruh di `public/`.
- Finalisasi `DESIGN_SYSTEM.md` dari template placeholder (Sprint 1) menjadi dokumen lengkap dengan nilai token final yang benar-benar dipakai di production.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh asset final ter-export dan ter-commit ke `public/`
- [ ] `DESIGN_SYSTEM.md` terisi lengkap (bukan placeholder lagi)
- [ ] Tidak ada asset yang masih pakai placeholder/dummy image di production build

### Task 7.2 — Usability Testing Support & Final UI QA Pass

**Scope Utama:** Design Audit / Usability Testing
**Endpoint / Path / Artifact:** Staging environment (seluruh halaman)
**Target Database / Tech Stack:** Manual walkthrough, feedback form internal
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Lakukan walkthrough end-to-end sebagai "Jamaah" dan "Admin" di staging, catat friction point UX yang masih ada.
- Final visual QA pass — pastikan tidak ada elemen UI pecah/misaligned di device testing (mobile, tablet, desktop).
  **Acceptance Criteria (DoD):**
- [ ] Walkthrough lengkap sebagai kedua persona selesai dengan catatan temuan
- [ ] Temuan Critical (jika ada) dikomunikasikan & diperbaiki FE sebelum deploy
- [ ] Final visual QA sign-off untuk seluruh halaman utama

### Task 7.3 — Bug Fixing Frontend (Batch 1 — dari Laporan QA)

**Scope Utama:** Frontend Bug Fix
**Endpoint / Path / Artifact:** Sesuai daftar bug dari QA (Task 6.9/6.10 + temuan baru)
**Target Database / Tech Stack:** Sesuai modul terkait masing-masing bug
**RBAC & Middleware Guard:** Sesuai modul terkait
**Detail Alur Logic / Design / Test Scope:**

- Prioritaskan bug Critical & High dari backlog QA terlebih dahulu, ikuti PR Checklist (CODING_CONVENTIONS.md Section 2.3) untuk setiap fix.
- Fokus modul: Booking (Room+Item), Event/RSVP — modul dengan risiko bisnis tertinggi.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh bug Critical dari backlog QA modul Booking & Event ter-fix dan ter-verifikasi ulang
- [ ] Setiap fix disertai PR dengan referensi nomor bug/issue
- [ ] Tidak ada regresi baru dari fix yang dilakukan (verifikasi test suite tetap PASS)

### Task 7.4 — Bug Fixing Frontend (Batch 2) + Cross-Browser/Responsive Check

**Scope Utama:** Frontend Bug Fix + QA Support
**Endpoint / Path / Artifact:** Sesuai daftar bug tersisa + seluruh halaman publik
**Target Database / Tech Stack:** Chrome/Firefox/Safari, mobile device testing
**RBAC & Middleware Guard:** Sesuai modul terkait
**Detail Alur Logic / Design / Test Scope:**

- Fix bug Medium/Low tersisa dari backlog QA — modul Lost&Found, Shortlink, Financial Reports, Content/CMS.
- Cross-browser check khusus halaman publik (Chrome, Firefox, Safari minimal) dan device fisik/emulator mobile.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh bug Medium dari backlog QA ter-fix (Low boleh dicatat sebagai known-issue post-launch jika waktu tidak cukup)
- [ ] Tidak ada broken layout di 3 browser utama & mobile
- [ ] Checklist cross-browser terdokumentasi dengan hasil pass/fail

### Task 7.5 — Final Integration Testing Support & Build Optimization

**Scope Utama:** Frontend Integration + Build
**Endpoint / Path / Artifact:** Next.js production build (`next build`)
**Target Database / Tech Stack:** Next.js bundler, Lighthouse/Web Vitals
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Jalankan `next build` di environment staging, pastikan tidak ada build error/warning signifikan.
- Cek bundle size & Web Vitals dasar (LCP, CLS) untuk halaman publik utama, sesuai NFR-PERF di SRS (target load < 2 detik di 4G).
- Bantu QA1/QA2 dalam integration test lintas modul dari sisi FE (mis. memastikan data konsisten antar halaman setelah aksi tertentu).
  **Acceptance Criteria (DoD):**
- [ ] `next build` sukses tanpa error di staging
- [ ] Web Vitals halaman publik utama memenuhi target dasar (LCP < 2.5s sebagai proxy NFR-PERF-01)
- [ ] Integration test FE-side terverifikasi bersama QA

### Task 7.6 — Bug Fixing Backend (Batch — dari Laporan QA)

**Scope Utama:** Backend Bug Fix
**Endpoint / Path / Artifact:** Sesuai daftar bug dari QA (Task 6.9/6.10 + temuan baru)
**Target Database / Tech Stack:** Sesuai modul terkait masing-masing bug
**RBAC & Middleware Guard:** Sesuai modul terkait
**Detail Alur Logic / Design / Test Scope:**

- Prioritaskan bug Critical & High, terutama terkait RBAC enforcement dan data integrity (booking conflict, RSVP dedup).
- Ikuti PR Checklist penuh, termasuk verifikasi ulang test unit terkait bug yang diperbaiki.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh bug Critical/High Backend ter-fix dan ter-verifikasi
- [ ] Test unit terkait modul yang di-fix di-update/ditambah untuk mencegah regresi bug yang sama
- [ ] CI tetap hijau setelah seluruh fix ter-merge

### Task 7.7 — Load Testing (Concurrent Booking & RSVP Race Condition)

**Scope Utama:** Backend Performance Testing
**Endpoint / Path / Artifact:** `POST /api/room-bookings`, `POST /api/item-bookings`, `POST /api/events/:id/rsvp`
**Target Database / Tech Stack:** k6 / autocannon / Artillery (load testing tool)
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Simulasikan concurrent request tinggi pada endpoint booking & RSVP (mis. 50-100 concurrent request ke slot/kuota yang sama) untuk verifikasi `prisma.$transaction` & unique constraint tetap konsisten di beban tinggi, bukan hanya di test 2-request sederhana sebelumnya.
- Ukur response time di bawah beban, bandingkan dengan target NFR-PERF-02 (validasi bentrok < 1 detik).
  **Acceptance Criteria (DoD):**
- [ ] Load test 50+ concurrent request pada slot booking sama → TETAP hanya 1 yang approved secara data (0 double-booking)
- [ ] Load test RSVP kuota terbatas dengan concurrent request → jumlah RSVP tersimpan TIDAK melebihi `quotaMax`
- [ ] Response time median di bawah beban terdokumentasi, dibandingkan target NFR

### Task 7.8 — Deployment Prep: Env Finalization, Migration Step 5, Production Checklist

**Scope Utama:** Backend DevOps / Deployment
**Endpoint / Path / Artifact:** Environment production (Vercel/Netlify sesuai config existing), `prisma migrate` Step 5 (drop `admins`)
**Target Database / Tech Stack:** Vercel/Netlify Environment Variables, Prisma Migration, Baileys service hosting final
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Finalisasi seluruh environment variable production (`STORAGE_*`, `BAILEYS_SERVICE_URL`, `JWT_SECRET`, dll) di platform hosting — TIDAK di-hardcode di kode.
- **Migrasi destruktif** (`prisma migrate dev --name drop_legacy_admins_table`, ARCHITECTURE.md Section 5.2 Step 5) — HANYA dijalankan setelah Task 7.6/7.7 mengkonfirmasi sistem `users`/RBAC stabil, dan sebaiknya di staging dulu, bukan langsung production di hari terakhir sprint.
- Finalisasi hosting Baileys service (pilihan platform final: Railway/VPS, sesuai keputusan tim di ARCHITECTURE.md Open Decision #7).
- Susun production checklist (rollback plan jika deployment gagal).
  **Acceptance Criteria (DoD):**
- [ ] Seluruh environment variable production terkonfigurasi & terverifikasi (tidak ada yang ter-skip)
- [ ] Migrasi drop `admins` berhasil dijalankan di staging tanpa error, rollback plan tersedia jika diperlukan di production
- [ ] Baileys service berjalan stabil di hosting final yang dipilih

### Task 7.9 — Full E2E Test Suite Run & Sign-Off Report

**Scope Utama:** QA Final Testing
**Endpoint / Path / Artifact:** Seluruh sistem end-to-end
**Target Database / Tech Stack:** Playwright/Cypress (E2E), Jest/Vitest (unit/integration)
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Jalankan seluruh test suite (unit, integration, E2E jika tersedia) sebagai final gate sebelum deployment.
- Susun **Sign-Off Report**: ringkasan modul yang lulus, bug known-issue yang di-defer (dengan justifikasi), dan rekomendasi go/no-go untuk deployment.
  **Acceptance Criteria (DoD):**
- [ ] Seluruh test suite PASS 100% (atau known-issue terdokumentasi eksplisit dengan alasan)
- [ ] Sign-Off Report tersusun dan dibagikan ke tim + stakeholder
- [ ] Rekomendasi go/no-go deployment tersampaikan jelas berdasarkan hasil testing

### Task 7.10 — Load Test Execution Support & Final Bug Verification/Closure

**Scope Utama:** QA Performance & Bug Closure
**Endpoint / Path / Artifact:** Mendukung Task 7.7, seluruh bug backlog dari Sprint 1-7
**Target Database / Tech Stack:** k6/autocannon (bantu eksekusi & analisis hasil bersama BE2)
**RBAC & Middleware Guard:** N/A
**Detail Alur Logic / Design / Test Scope:**

- Bantu eksekusi skenario load test (Task 7.7) dari sisi observasi hasil data (cek langsung ke DB pasca-load-test untuk verifikasi tidak ada data anomali seperti double-booking/over-quota).
- Verifikasi closure seluruh bug dari backlog Sprint 1-7 — pastikan status "Fixed" benar-benar terverifikasi ulang (bukan asumsi dari developer), bukan sekadar ditutup tanpa retest.
  **Acceptance Criteria (DoD):**
- [ ] Hasil load test terverifikasi independen dari sisi data DB (0 anomali data)
- [ ] 100% bug berstatus "Fixed" sudah diverifikasi ulang oleh QA (bukan self-close oleh developer)
- [ ] Final bug closure report disertakan dalam Sign-Off Report (Task 7.9)

---

## RINGKASAN ALOKASI TIM PER MICRO-SPRINT

| Micro-Sprint | UI1 | UI2 | FE1     | FE2 | FE3 | BE1 | BE2 | BE3 | QA1 | QA2  |
| ------------ | --- | --- | ------- | --- | --- | --- | --- | --- | --- | ---- |
| 1 (H1-2)     | 1.1 | 1.2 | 1.3     | 1.4 | 1.5 | 1.6 | 1.7 | 1.8 | 1.9 | 1.10 |
| 2 (H3-4)     | 2.1 | 2.2 | 2.3     | 2.4 | 2.5 | 2.6 | 2.7 | 2.8 | 2.9 | 2.10 |
| 3 (H5-6)     | 3.1 | 3.2 | 3.3     | 3.4 | 3.5 | 3.6 | 3.7 | 3.8 | 3.9 | 3.10 |
| 4 (H7-8)     | 4.1 | 4.2 | 4.3     | 4.4 | 4.5 | 4.6 | 4.7 | 4.8 | 4.9 | 4.10 |
| 5 (H9-10)    | 5.1 | 5.2 | 5.3     | 5.4 | 5.5 | 5.6 | 5.7 | 5.8 | 5.9 | 5.10 |
| 6 (H11-12)   | 6.1 | 6.2 | 6.3     | 6.4 | 6.5 | 6.6 | 6.7 | 6.8 | 6.9 | 6.10 |
| 7 (H13-14)   | 7.1 | 7.2 | 7.3/7.5 | 7.4 | 7.5 | 7.6 | 7.7 | 7.8 | 7.9 | 7.10 |

> **Catatan:** Total 70 task terdistribusi merata — tidak ada anggota tim yang idle di micro-sprint manapun. Task 7.3 & 7.5 sengaja dibagi FE1 (fokus bug fix modul kritis) agar FE3 bisa full fokus integration+build (Task 7.5 murni), sesuaikan pembagian riil saat daily standup jika beban tidak seimbang.

---

## CATATAN KRITIS UNTUK SCRUM MASTER / PROJECT LEAD

1. **Ketergantungan Fase 0 (ARCHITECTURE.md):** Micro-Sprint 1 adalah _hard blocker_ — Task 1.6/1.7/1.8 (migrasi Auth+RBAC) HARUS selesai sebelum Micro-Sprint 2 dimulai penuh, karena hampir seluruh modul berikutnya bergantung pada RBAC middleware.
2. **Task 2.8 (Notification Mock) krusial** — memungkinkan tim tidak blocking menunggu Baileys selesai di Sprint 3, tapi WAJIB benar-benar di-swap ke adapter asli di Task 3.8 (bukan tertinggal sebagai mock permanen).
3. **Task 7.8 (migrasi destruktif drop `admins`)** adalah operasi berisiko tinggi di hari terakhir — sangat disarankan dijalankan H-13 (bukan H-14) untuk menyisakan waktu observasi sebelum deployment final.
4. Dengan timeline 14 hari yang sangat ketat, **daily standup wajib** untuk deteksi dini blocker antar-task (terutama dependency FE↔BE dalam sprint yang sama).

---

_Dokumen selanjutnya: `TEST_PLAN.md` (breakdown test strategy lebih detail per modul, prioritas risiko, dan test scenario regresi penuh) — atau `UI_COMPONENT_MAP.md` jika tim ingin memfinalisasi draft dari Task 6.2 terlebih dahulu._
