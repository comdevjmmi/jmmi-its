# DATABASE_SCHEMA.md

## Platform Website Terpadu JMMI ITS — Database Schema

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** PRD.md v1.0, ARCHITECTURE.md v1.0, DBML v1.0

---

## 1. PRISMA SCHEMA (schema.prisma) — LENGKAP

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = []
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =========================================
// ENUMS
// =========================================

enum UserRole {
  superadmin
  admin
  biro
}

enum BookingStatus {
  pending
  approved
  rejected
}

enum LostFoundStatus {
  active
  claimed
}

enum ContentLang {
  id
  en
}

enum ContentType {
  blog
  gallery
  profile
  achievement
  alumni
}

enum NotifStatus {
  pending
  sent
  failed
}

// =========================================
// RBAC — USERS & PERMISSIONS
// =========================================

model User {
  id           String    @id @default(uuid())
  name         String
  email        String?   @unique
  phone        String?   @unique
  passwordHash String    @map("password_hash")
  role         UserRole
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime? @updatedAt @map("updated_at")

  userPermissions       UserPermission[]
  roomBookingsApproved  RoomBooking[]     @relation("RoomBookingApprover")
  itemBookingsApproved  ItemBooking[]     @relation("ItemBookingApprover")
  eventsCreated         Event[]
  contentsAuthored      Content[]
  financialReportsInput FinancialReport[]
  shortLinksCreated     ShortLink[]
  lostFoundPosted       LostFoundItem[]

  @@map("users")
}

model Permission {
  id         String   @id @default(uuid())
  moduleName String   @map("module_name")
  action     String
  createdAt  DateTime @default(now()) @map("created_at")

  userPermissions UserPermission[]

  @@unique([moduleName, action], name: "uniq_module_action")
  @@map("permissions")
}

model UserPermission {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  permissionId String   @map("permission_id")
  createdAt    DateTime @default(now()) @map("created_at")

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([userId, permissionId])
  @@map("user_permissions")
}

// =========================================
// PEMINJAMAN TEMPAT
// =========================================

model Room {
  id          String   @id @default(uuid())
  name        String
  capacity    Int?
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  bookings RoomBooking[]

  @@map("rooms")
}

model RoomBooking {
  id               String        @id @default(uuid())
  roomId           String        @map("room_id")
  jamaahName       String        @map("jamaah_name")
  jamaahPhone      String        @map("jamaah_phone")
  purpose          String?
  startDate        DateTime      @map("start_date")
  endDate          DateTime      @map("end_date")
  status           BookingStatus @default(pending)
  approverId       String?       @map("approver_id")
  rejectionReason  String?       @map("rejection_reason")
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime?     @updatedAt @map("updated_at")

  room     Room  @relation(fields: [roomId], references: [id])
  approver User? @relation("RoomBookingApprover", fields: [approverId], references: [id])

  @@index([roomId, startDate, endDate], name: "idx_room_booking_conflict")
  @@index([jamaahPhone], name: "idx_room_booking_phone_lookup")
  @@map("room_bookings")
}

// =========================================
// PEMINJAMAN BARANG
// =========================================

model ItemAsset {
  id          String   @id @default(uuid())
  name        String
  totalStock  Int      @default(0) @map("total_stock")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  bookings ItemBooking[]

  @@map("item_assets")
}

model ItemBooking {
  id              String        @id @default(uuid())
  itemId          String        @map("item_id")
  jamaahName      String        @map("jamaah_name")
  jamaahPhone     String        @map("jamaah_phone")
  quantity        Int
  purpose         String?
  borrowDate      DateTime      @map("borrow_date")
  returnDate      DateTime      @map("return_date")
  status          BookingStatus @default(pending)
  approverId      String?       @map("approver_id")
  rejectionReason String?       @map("rejection_reason")
  returnedAt      DateTime?     @map("returned_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime?     @updatedAt @map("updated_at")

  item     ItemAsset @relation(fields: [itemId], references: [id])
  approver User?     @relation("ItemBookingApprover", fields: [approverId], references: [id])

  @@index([itemId, borrowDate, returnDate], name: "idx_item_booking_conflict")
  @@index([jamaahPhone], name: "idx_item_booking_phone_lookup")
  @@map("item_bookings")
}

// =========================================
// EVENT & RSVP
// =========================================

model Event {
  id             String    @id @default(uuid())
  title          String
  description    String?
  eventDatetime  DateTime  @map("event_datetime")
  location       String?
  posterUrl      String?   @map("poster_url")
  quotaMax       Int?      @map("quota_max")
  createdBy      String    @map("created_by")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime? @updatedAt @map("updated_at")

  creator     User          @relation(fields: [createdBy], references: [id])
  rsvpEntries RsvpEntry[]

  @@index([eventDatetime], name: "idx_event_datetime")
  @@map("events")
}

model RsvpEntry {
  id        String   @id @default(uuid())
  eventId   String   @map("event_id")
  name      String
  phone     String
  gender    String
  createdAt DateTime @default(now()) @map("created_at")

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // 1 nomor WA = 1 slot RSVP per event (keputusan tim, terkunci)
  @@unique([eventId, phone], name: "uniq_rsvp_per_event_phone")
  @@map("rsvp_entries")
}

// =========================================
// CONTENT / BLOG / CMS
// =========================================

model Content {
  id          String      @id @default(uuid())
  type        ContentType
  title       String
  body        String?
  mediaUrl    String?     @map("media_url")
  authorId    String      @map("author_id")
  lang        ContentLang @default(id)
  isPublished Boolean     @default(false) @map("is_published")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime?   @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])

  @@index([type, isPublished, lang], name: "idx_content_listing")
  @@map("contents")
}

// =========================================
// FINANCIAL REPORTS (terpisah dari finance_transactions existing)
// =========================================

model FinancialReport {
  id          String   @id @default(uuid())
  period      String
  category    String
  amount      Int
  description String?
  inputBy     String   @map("input_by")
  createdAt   DateTime @default(now()) @map("created_at")

  inputter User @relation(fields: [inputBy], references: [id])

  @@index([period], name: "idx_financial_report_period")
  @@map("financial_reports")
}

// =========================================
// SHORTEN LINK (extend dari existing ShortLink)
// =========================================

model ShortLink {
  id         String    @id @default(uuid())
  slug       String    @unique
  targetUrl  String    @map("target_url")
  createdBy  String    @map("created_by")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime? @updatedAt @map("updated_at")

  creator   User            @relation(fields: [createdBy], references: [id])
  clickLogs LinkClickLog[]

  @@map("short_links")
}

model LinkClickLog {
  id          String   @id @default(uuid())
  shortLinkId String   @map("short_link_id")
  clickedAt   DateTime @default(now()) @map("clicked_at")
  referrer    String?

  shortLink ShortLink @relation(fields: [shortLinkId], references: [id], onDelete: Cascade)

  @@index([shortLinkId, clickedAt], name: "idx_link_click_analytics")
  @@map("link_click_logs")
}

// =========================================
// LOST AND FOUND
// =========================================

model LostFoundItem {
  id             String           @id @default(uuid())
  itemName       String           @map("item_name")
  description    String?
  photoUrl       String?          @map("photo_url")
  locationFound  String?          @map("location_found")
  dateFound      DateTime?        @map("date_found") @db.Date
  claimProcedure String?          @map("claim_procedure")
  status         LostFoundStatus  @default(active)
  postedBy       String           @map("posted_by")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime?        @updatedAt @map("updated_at")

  poster User @relation(fields: [postedBy], references: [id])

  @@index([status, createdAt], name: "idx_lost_found_listing")
  @@map("lost_found_items")
}

// =========================================
// NOTIFICATION LOGS
// =========================================

model NotificationLog {
  id              String      @id @default(uuid())
  recipientPhone  String      @map("recipient_phone")
  notifType       String      @map("notif_type")
  relatedEntity   String?     @map("related_entity")
  messageBody     String?     @map("message_body")
  sendStatus      NotifStatus @default(pending) @map("send_status")
  sentAt          DateTime?   @map("sent_at")
  createdAt       DateTime    @default(now()) @map("created_at")

  @@index([recipientPhone, createdAt], name: "idx_notif_log_recipient")
  @@index([relatedEntity], name: "idx_notif_log_related_entity")
  @@map("notification_logs")
}

// =========================================
// EXISTING MODELS — DIPERTAHANKAN TANPA PERUBAHAN
// (Category, Folder, Subheading, Link, StaffAnnouncement,
//  FinanceTransaction, CalendarEvent — lihat schema existing repo)
// =========================================
```

> **Catatan:** Model `Admin` (existing) TIDAK ditulis ulang di sini — mengikuti strategi migrasi additive-first di ARCHITECTURE.md Section 5.2, model `Admin` dihapus dari schema HANYA di migrasi terakhir (Step 5), setelah `User` terverifikasi stabil di production.

---

## 2. RINGKASAN RELASI & MATRIKS TABEL: DBML vs PRISMA vs EXISTING

| Tabel (DBML v1.0)     | Model Prisma                               | Status vs Repo Existing                         | Catatan                                                                                    |
| --------------------- | ------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `users`               | `User`                                     | **BARU** (menggantikan `admins`)                | Migrasi additive, `admins` dipertahankan sementara                                         |
| `permissions`         | `Permission`                               | **BARU**                                        | —                                                                                          |
| `user_permissions`    | `UserPermission`                           | **BARU**                                        | Hanya relevan untuk role `biro`                                                            |
| `rooms`               | `Room`                                     | **BARU**                                        | —                                                                                          |
| `item_assets`         | `ItemAsset`                                | **BARU**                                        | —                                                                                          |
| `room_bookings`       | `RoomBooking`                              | **BARU**                                        | Composite index krusial untuk cegah double-booking                                         |
| `item_bookings`       | `ItemBooking`                              | **BARU**                                        | Composite index krusial untuk cegah over-lending                                           |
| `events`              | `Event`                                    | **BARU** (terpisah dari `calendar_events`)      | Digabung di level query untuk halaman `/kalender`                                          |
| `rsvp_entries`        | `RsvpEntry`                                | **BARU**                                        | Unique constraint `(eventId, phone)` — 1 WA = 1 slot                                       |
| `contents`            | `Content`                                  | **BARU**                                        | —                                                                                          |
| `financial_reports`   | `FinancialReport`                          | **BARU** (terpisah dari `finance_transactions`) | Tanpa agregasi otomatis di v1                                                              |
| `short_links`         | `ShortLink`                                | **EXTEND** dari existing `ShortLink`            | Struktur existing sudah sesuai, tidak ada perubahan kolom                                  |
| `link_click_logs`     | `LinkClickLog`                             | **BARU**                                        | Menambah log per-klik, `click_count` agregat di `ShortLink` tetap dipertahankan (existing) |
| `lost_found_items`    | `LostFoundItem`                            | **BARU**                                        | —                                                                                          |
| `notification_logs`   | `NotificationLog`                          | **BARU**                                        | Dipakai oleh Notification Service (Baileys)                                                |
| _(tidak ada di DBML)_ | `Category`, `Folder`, `Subheading`, `Link` | **EXISTING, tidak berubah**                     | Bagian dari fitur Linktree existing                                                        |
| _(tidak ada di DBML)_ | `StaffAnnouncement`                        | **EXISTING, tidak berubah**                     | Fitur pengumuman staff muda existing                                                       |
| _(tidak ada di DBML)_ | `FinanceTransaction`                       | **EXISTING, tidak berubah**                     | Tetap berjalan paralel dengan `FinancialReport` baru                                       |
| _(tidak ada di DBML)_ | `CalendarEvent`                            | **EXISTING, tidak berubah**                     | Tetap berjalan paralel dengan `Event` baru                                                 |

### Diagram Relasi Ringkas

```
User (1) ──< (N) UserPermission (N) >── (1) Permission
User (1) ──< (N) RoomBooking [as approver]
User (1) ──< (N) ItemBooking [as approver]
User (1) ──< (N) Event [as creator]
User (1) ──< (N) Content [as author]
User (1) ──< (N) FinancialReport [as inputter]
User (1) ──< (N) ShortLink [as creator]
User (1) ──< (N) LostFoundItem [as poster]

Room (1) ──< (N) RoomBooking
ItemAsset (1) ──< (N) ItemBooking
Event (1) ──< (N) RsvpEntry
ShortLink (1) ──< (N) LinkClickLog
```

---

## 3. STRATEGI INDEXING & CONSTRAINTS

### 3.1 Composite Index — Pencegahan Double Booking (Kritis)

**`room_bookings`:**

```prisma
@@index([roomId, startDate, endDate], name: "idx_room_booking_conflict")
```

Dipakai saat validasi overlap sebelum insert booking baru:

```sql
SELECT COUNT(*) FROM room_bookings
WHERE room_id = $1
  AND status IN ('pending', 'approved')
  AND start_date < $3  -- end_date baru
  AND end_date > $2;   -- start_date baru
```

Index ini mempercepat query overlap-check di atas secara signifikan dibanding full table scan.

**`item_bookings`:** pola identik dengan `roomId` → `itemId`, `startDate/endDate` → `borrowDate/returnDate`.

> **PENTING — Race Condition:** Index mempercepat query, TAPI tidak mencegah race condition saat dua request submit bersamaan (lihat edge case di PRD Section 3.2/3.3). Wajib dibungkus dalam **DB transaction** (`prisma.$transaction`) dengan isolation level minimal `Serializable` atau gunakan **row-level lock** (`SELECT ... FOR UPDATE`) pada query overlap-check sebelum insert, bukan hanya mengandalkan index untuk kecepatan baca.

### 3.2 Unique Constraint — RSVP Deduplication

```prisma
@@unique([eventId, phone], name: "uniq_rsvp_per_event_phone")
```

Ini adalah **database-level enforcement** dari keputusan tim (1 nomor WA = 1 slot per event) — bukan hanya validasi di application layer. Insert kedua dengan kombinasi `(eventId, phone)` yang sama akan otomatis gagal di level DB (`P2002` unique constraint violation di Prisma), yang harus ditangkap di service layer dan diterjemahkan jadi pesan error yang jelas ke Jamaah ("Nomor ini sudah terdaftar di kegiatan ini").

### 3.3 Unique Constraint Lainnya

| Constraint                         | Tabel              | Alasan                                                                           |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `slug` unique                      | `short_links`      | Sudah ada di existing, dipertahankan — dasar dari validasi keunikan slug         |
| `email`, `phone` unique (nullable) | `users`            | Mencegah duplikasi akun; nullable karena tidak semua field wajib diisi bersamaan |
| `(moduleName, action)` unique      | `permissions`      | Mencegah duplikasi definisi permission saat seeding                              |
| `(userId, permissionId)` unique    | `user_permissions` | Mencegah assignment permission ganda ke user yang sama                           |

### 3.4 Index untuk Optimasi Query Umum (Non-Kritis tapi Direkomendasikan)

| Index                         | Tabel                            | Tujuan                                                                                                   |
| ----------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `[jamaahPhone]`               | `room_bookings`, `item_bookings` | Mempercepat "Cek Status Peminjaman" via nomor WA                                                         |
| `[eventDatetime]`             | `events`                         | Sorting/filtering listing event berdasarkan tanggal                                                      |
| `[type, isPublished, lang]`   | `contents`                       | Query listing blog/galeri per tipe+bahasa+status publish (query paling sering dipakai di halaman publik) |
| `[period]`                    | `financial_reports`              | Filter laporan keuangan per periode di halaman publik                                                    |
| `[status, createdAt]`         | `lost_found_items`               | Listing publik hanya status `active`, urut terbaru                                                       |
| `[shortLinkId, clickedAt]`    | `link_click_logs`                | Query analytics per link dengan range tanggal                                                            |
| `[recipientPhone, createdAt]` | `notification_logs`              | Debugging/audit riwayat notifikasi per nomor                                                             |
| `[relatedEntity]`             | `notification_logs`              | Lookup cepat riwayat notif terkait entity tertentu (mis. saat debug 1 booking)                           |

### 3.5 Cascade Delete Policy

| Relasi                                                    | Policy                               | Alasan                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UserPermission → User/Permission`                        | `onDelete: Cascade`                  | Permission assignment tidak relevan lagi jika user/permission dihapus                                                                                                             |
| `RsvpEntry → Event`                                       | `onDelete: Cascade`                  | RSVP tidak relevan jika event dihapus                                                                                                                                             |
| `LinkClickLog → ShortLink`                                | `onDelete: Cascade`                  | Log klik tidak relevan jika link dihapus                                                                                                                                          |
| `RoomBooking/ItemBooking → Room/ItemAsset/User(approver)` | **TIDAK cascade** (default restrict) | Data booking harus tetap ada untuk audit trail meski room/item/approver dihapus/nonaktif — gunakan `isActive`/`is_active` flag, bukan hard delete, pada `Room`/`ItemAsset`/`User` |

---

## 4. OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

| #   | Keputusan Terbuka                                                                                                                                                                                                                                                  | Urgensi                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 9   | Isolation level transaction untuk validasi overlap booking — `Serializable` (aman tapi lebih lambat) vs row-level lock manual (`SELECT FOR UPDATE`, lebih cepat tapi lebih kompleks) — perlu keputusan Backend Lead sebelum implementasi `room-booking-service.ts` | Sedang — blocking mulai coding modul Peminjaman Tempat/Barang |
| 10  | Apakah `email` di `users` boleh benar-benar null (untuk akun `biro` yang mungkin hanya pakai `phone`), atau wajib diisi salah satu dari `email`/`phone` minimal — perlu constraint tambahan di level aplikasi                                                      | Rendah                                                        |

---

_Dokumen selanjutnya: `API_CONTRACT.md` (spesifikasi endpoint lengkap — request/response schema per modul, mengikuti Repository+Service pattern di ARCHITECTURE.md)._

```

```
