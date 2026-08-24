# API_CONTRACT.md

## Platform Website Terpadu JMMI ITS — API Contract

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** PRD.md, ARCHITECTURE.md, DATABASE_SCHEMA.md (semua v1.0)
**Base URL:** `/api`
**Locked Decisions:** Overlap-check via `prisma.$transaction`; email/phone nullable di DB, wajib salah satu via Zod

---

## 1. STANDARD RESPONSE STRUCTURE

### 1.1 Success Response

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta; // hanya untuk endpoint list/paginated
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
```

```json
{
  "success": true,
  "data": { "id": "uuid", "name": "..." },
  "meta": { "page": 1, "limit": 20, "totalItems": 87, "totalPages": 5 }
}
```

### 1.2 Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // machine-readable, mis. 'VALIDATION_ERROR', 'BOOKING_CONFLICT'
    message: string; // human-readable, Bahasa Indonesia (untuk ditampilkan ke Jamaah)
    details?: Record<string, string[]>; // field-level validation errors (dari Zod)
  };
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": { "phone": ["Nomor WhatsApp wajib diisi"] }
  }
}
```

### 1.3 Standard HTTP Status & Error Codes

| Status | error.code             | Kapan Dipakai                                    |
| ------ | ---------------------- | ------------------------------------------------ |
| 400    | `VALIDATION_ERROR`     | Payload gagal validasi Zod                       |
| 401    | `UNAUTHORIZED`         | Token tidak ada/invalid/expired                  |
| 403    | `FORBIDDEN_ROLE`       | Role tidak diizinkan akses endpoint              |
| 403    | `FORBIDDEN_PERMISSION` | Role `biro` tanpa permission modul terkait       |
| 404    | `NOT_FOUND`            | Resource tidak ditemukan                         |
| 409    | `BOOKING_CONFLICT`     | Bentrok jadwal (Peminjaman Tempat)               |
| 409    | `STOCK_UNAVAILABLE`    | Stok tidak cukup (Peminjaman Barang)             |
| 409    | `QUOTA_FULL`           | Kuota event penuh                                |
| 409    | `DUPLICATE_RSVP`       | Nomor WA sudah RSVP di event yang sama           |
| 409    | `SLUG_TAKEN`           | Slug shorten link sudah dipakai (non-Superadmin) |
| 429    | `RATE_LIMITED`         | Terlalu banyak request (mis. OTP tracking)       |
| 500    | `INTERNAL_ERROR`       | Error tak terduga                                |

### 1.4 Pagination Query Params (Standar untuk Semua Endpoint List)

```
GET /api/{resource}?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

---

## 2. MODUL: AUTH

### `POST /api/auth/login`

**Akses:** Publik
**Body:**

```typescript
{ email?: string; phone?: string; password: string } // salah satu email/phone wajib (Zod)
```

**Response 200:**

```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    name: string;
    email: string | null;
    role: 'superadmin' | 'admin' | 'biro';
  }
}
```

**Errors:** `401 UNAUTHORIZED` (kredensial salah), `403 FORBIDDEN_ROLE` (`isActive = false`)

### `POST /api/auth/refresh`

**Akses:** Publik (butuh refresh token valid)
**Body:** `{ refreshToken: string }`
**Response 200:** `{ accessToken: string }`

### `POST /api/auth/logout`

**Akses:** Authenticated (semua role)
**Response 200:** `{ message: "Berhasil keluar" }`

---

## 3. MODUL: USERS & RBAC (Superadmin Only)

### `GET /api/users`

**Akses:** `superadmin`
**Query:** `?page&limit&role&isActive`
**Response 200:** `PaginatedResponse<UserSummaryDTO[]>`

```typescript
interface UserSummaryDTO {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}
```

### `POST /api/users`

**Akses:** `superadmin`
**Body:**

```typescript
{
  name: string;
  email?: string;
  phone?: string;   // Zod refine: at least one of email/phone required
  password: string; // min 8 karakter
  role: 'admin' | 'biro'; // superadmin tidak bisa dibuat via endpoint ini (manual DB only)
}
```

**Response 201:** `UserSummaryDTO`
**Errors:** `409` jika email/phone sudah terpakai (`code: 'DUPLICATE_USER'`)

### `PATCH /api/users/:id`

**Akses:** `superadmin`
**Body:** `{ name?: string; isActive?: boolean }`
**Response 200:** `UserSummaryDTO`
**Note:** Menonaktifkan diri sendiri sebagai satu-satunya superadmin aktif → `409 { code: 'LAST_SUPERADMIN' }`

### `GET /api/permissions`

**Akses:** `superadmin`
**Response 200:** `Permission[]` (daftar module+action yang tersedia untuk di-assign)

### `PUT /api/users/:id/permissions`

**Akses:** `superadmin`
**Body:** `{ permissionIds: string[] }` (replace seluruh assignment, bukan append)
**Response 200:** `{ userId: string; permissions: Permission[] }`
**Note:** Hanya berlaku untuk user dengan `role = 'biro'`; request untuk `superadmin`/`admin` → `400 VALIDATION_ERROR`

---

## 4. MODUL: PEMINJAMAN TEMPAT (Room Booking)

### `GET /api/rooms`

**Akses:** Publik
**Response 200:** `Room[]`

### `GET /api/room-bookings/calendar`

**Akses:** Publik
**Query:** `?roomId&month=2026-09`
**Response 200 (Publik — tanpa nama peminjam):**

```typescript
{
  date: string;
  status: 'available' | 'occupied';
}
[];
```

**Response 200 (Authenticated Admin/Approver — via header berbeda atau endpoint terpisah `?detail=true`):**

```typescript
{ date: string; status: 'available' | 'occupied'; bookingId?: string; jamaahName?: string }[]
```

### `POST /api/room-bookings`

**Akses:** Publik (Jamaah, tanpa login)
**Body:**

```typescript
{
  roomId: string;
  jamaahName: string;
  jamaahPhone: string; // format E.164
  purpose: string;
  startDate: string; // ISO 8601
  endDate: string;
}
```

**Response 201:** `RoomBookingDTO`
**Errors:** `409 BOOKING_CONFLICT` (overlap check via `prisma.$transaction` di service layer)

```typescript
interface RoomBookingDTO {
  id: string;
  roomId: string;
  roomName: string;
  jamaahName: string;
  jamaahPhone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
```

### `GET /api/room-bookings` (Approval Queue)

**Akses:** `superadmin`, `admin`, `biro` (permission `room_bookings:view_detail`)
**Query:** `?status&page&limit`
**Response 200:** `PaginatedResponse<RoomBookingDTO[]>`

### `POST /api/room-bookings/:id/approve`

**Akses:** `superadmin`, `admin`, `biro` (permission `room_bookings:approve`)
**Response 200:** `RoomBookingDTO` (status → `approved`) — trigger notifikasi WA `booking_approved`

### `POST /api/room-bookings/:id/reject`

**Akses:** sama seperti approve
**Body:** `{ reason: string }` (wajib)
**Response 200:** `RoomBookingDTO` (status → `rejected`) — trigger notifikasi WA `booking_rejected`

### `POST /api/room-bookings/track`

**Akses:** Publik (dengan verifikasi OTP)
**Body:** `{ phone: string; otp: string }`
**Response 200:** `RoomBookingDTO[]` (riwayat pengajuan terkait nomor tsb)

### `POST /api/room-bookings/track/request-otp`

**Akses:** Publik
**Body:** `{ phone: string }`
**Response 200:** `{ message: "OTP terkirim via WhatsApp" }`
**Errors:** `429 RATE_LIMITED` (maks N request per menit per nomor)

---

## 5. MODUL: PEMINJAMAN BARANG (Item Booking)

Struktur endpoint identik dengan Room Booking, dengan penyesuaian domain:

### `GET /api/items`

**Akses:** Publik — `{ id, name, totalStock, description, availableStock? }[]`

### `POST /api/item-bookings`

**Akses:** Publik
**Body:**

```typescript
{
  itemId: string;
  jamaahName: string;
  jamaahPhone: string;
  quantity: number;
  purpose: string;
  borrowDate: string;
  returnDate: string;
}
```

**Response 201:** `ItemBookingDTO`
**Errors:** `409 STOCK_UNAVAILABLE` — response detail: `{ requested: number; available: number }`

### `GET /api/item-bookings`, `POST /api/item-bookings/:id/approve`, `POST /api/item-bookings/:id/reject`

**Akses:** sama pola dengan Room Booking, permission `item_bookings:approve`

### `POST /api/item-bookings/:id/mark-returned`

**Akses:** `superadmin`, `admin`, `biro` (permission `item_bookings:approve`)
**Response 200:** `ItemBookingDTO` (`returnedAt` diisi)

### `POST /api/item-bookings/track` & `POST /api/item-bookings/track/request-otp`

Sama pola dengan Room Booking.

---

## 6. MODUL: EVENT & RSVP

### `GET /api/events`

**Akses:** Publik
**Query:** `?upcoming=true&page&limit`
**Response 200:**

```typescript
interface EventDTO {
  id: string;
  title: string;
  description: string;
  eventDatetime: string;
  location: string;
  posterUrl: string | null;
  quotaMax: number | null;
  rsvpCount: number;
  isQuotaFull: boolean;
}
```

### `GET /api/events/:id`

**Akses:** Publik — `EventDTO`

### `POST /api/events`

**Akses:** `superadmin`, `admin`, `biro` (permission `events:create`)
**Body:** `{ title: string; description: string; eventDatetime: string; location: string; posterUrl?: string; quotaMax?: number }`
**Response 201:** `EventDTO`

### `PATCH /api/events/:id`

**Akses:** sama seperti create, permission `events:create`

### `POST /api/events/:id/rsvp`

**Akses:** Publik (Jamaah, tanpa login)
**Body:** `{ name: string; phone: string; gender: string }`
**Response 201:** `{ id: string; eventId: string; name: string; createdAt: string }`
**Errors:**

- `409 QUOTA_FULL` — jika `quotaMax` tercapai
- `409 DUPLICATE_RSVP` — jika `(eventId, phone)` sudah ada (unique constraint di DB, ditangkap di service layer)

### `GET /api/events/:id/rsvp-entries`

**Akses:** `superadmin`, `admin`, `biro` (permission `events:export_rsvp`)
**Query:** `?page&limit`
**Response 200:** `PaginatedResponse<RsvpEntryDTO[]>`

### `GET /api/events/:id/rsvp-entries/export`

**Akses:** sama seperti di atas
**Response 200:** File CSV (`Content-Type: text/csv`)

---

## 7. MODUL: LOST AND FOUND

### `GET /api/lost-found`

**Akses:** Publik
**Query:** `?page&limit` (hanya menampilkan `status: 'active'` untuk publik)
**Response 200:** `PaginatedResponse<LostFoundItemDTO[]>`

### `GET /api/lost-found/:id`

**Akses:** Publik — `LostFoundItemDTO` (termasuk `claimProcedure` lengkap)

### `POST /api/lost-found`

**Akses:** `superadmin`, `admin`, `biro` (permission `lost_found:create`)
**Body:**

```typescript
{
  itemName: string;
  description: string;
  photoUrl: string; // dari hasil /api/upload
  locationFound: string;
  dateFound: string;
  claimProcedure: string;
}
```

**Response 201:** `LostFoundItemDTO`

### `PATCH /api/lost-found/:id/mark-claimed`

**Akses:** sama seperti create
**Response 200:** `LostFoundItemDTO` (status → `claimed`, tidak muncul lagi di listing publik)

---

## 8. MODUL: FINANCIAL REPORTS

### `GET /api/financial-reports`

**Akses:** Publik
**Query:** `?period&page&limit`
**Response 200:** `PaginatedResponse<FinancialReportDTO[]>`

### `POST /api/financial-reports`

**Akses:** `superadmin`, `admin`, `biro` (permission `financial_reports:create`)
**Body:** `{ period: string; category: string; amount: number; description?: string }`
**Response 201:** `FinancialReportDTO`

### `PATCH /api/financial-reports/:id`, `DELETE /api/financial-reports/:id`

**Akses:** sama seperti create

---

## 9. MODUL: CONTENT (Blog/Galeri/dll)

### `GET /api/content`

**Akses:** Publik (hanya `isPublished: true`)
**Query:** `?type=blog&lang=id&page&limit`
**Response 200:** `PaginatedResponse<ContentDTO[]>`

### `GET /api/content/:id`

**Akses:** Publik (published) / Authenticated (draft, jika author/permission sesuai)

### `POST /api/content`

**Akses:** `superadmin`, `admin`, `biro` (permission `content:create`)
**Body:** `{ type: 'blog'|'gallery'|'profile'|'achievement'|'alumni'; title: string; body?: string; mediaUrl?: string; lang: 'id'|'en' }`
**Response 201:** `ContentDTO` (`isPublished: false` default)

### `PATCH /api/content/:id`

**Akses:** sama seperti create (permission `content:create` mencakup update)

### `POST /api/content/:id/publish`

**Akses:** `superadmin`, `admin`, `biro` (permission `content:publish` — terpisah dari `create`)
**Response 200:** `ContentDTO` (`isPublished: true`)

---

## 10. MODUL: SHORTEN LINK (Extension dari Existing)

### `GET /api/shortlinks` _(existing, disesuaikan RBAC)_

**Akses:** `superadmin`, `admin` (semua link) / `biro` dengan permission `short_links:create` (**hanya link miliknya**, difilter otomatis di service layer by `createdBy`)

### `POST /api/shortlinks` _(existing, disesuaikan RBAC)_

**Body:** `{ targetUrl: string; slug?: string }`
**Response 201:** `ShortLinkDTO`
**Errors:** `409 SLUG_TAKEN`

### `PUT /api/shortlinks/:id/override` **(BARU)**

**Akses:** `superadmin` ONLY
**Body:** `{ newTargetUrl: string }` (mengubah target URL pada slug yang sudah ada/dipakai)
**Response 200:** `ShortLinkDTO`

### `GET /api/shortlinks/:id/analytics` **(BARU)**

**Akses:** `superadmin`, `admin` (semua) / `biro` (hanya link miliknya, dicek `createdBy === userId`)
**Response 200:**

```typescript
{
  shortLinkId: string;
  slug: string;
  totalClicks: number;
  clicksOverTime: {
    date: string;
    count: number;
  }
  [];
}
```

---

## 11. MODUL: UPLOAD (File Storage)

### `POST /api/upload`

**Akses:** `superadmin`, `admin`, `biro` (semua role internal — validasi lebih lanjut per konteks pemanggil, mis. permission `content:create` jika folder=`content`)
**Body:** `multipart/form-data` — `{ file: File; folder: 'lost-found' | 'content' | 'events' | 'gallery' }`
**Validasi:** max 5MB, tipe `image/jpeg`, `image/png`, `image/webp` saja
**Response 200:** `{ url: string; key: string }`
**Errors:** `400 VALIDATION_ERROR` (file terlalu besar/tipe tidak didukung)

---

## 12. RINGKASAN AUTORISASI PER ENDPOINT (QUICK REFERENCE)

| Endpoint Group                     |        Publik        | Superadmin | Admin |       Biro (scoped)       |
| ---------------------------------- | :------------------: | :--------: | :---: | :-----------------------: |
| Auth                               | login/refresh/logout |     ✓      |   ✓   |             ✓             |
| Users/RBAC                         |          ✗           |   ✓ Full   |   ✗   |             ✗             |
| Room/Item Booking — submit & track |          ✓           |     —      |   —   |             —             |
| Room/Item Booking — approve/reject |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Event — read & RSVP                |          ✓           |     —      |   —   |             —             |
| Event — create/manage              |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Lost & Found — read                |          ✓           |     —      |   —   |             —             |
| Lost & Found — create/manage       |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Financial Reports — read           |          ✓           |     —      |   —   |             —             |
| Financial Reports — create/manage  |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Content — read published           |          ✓           |     —      |   —   |             —             |
| Content — create/manage            |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Shortlink — create                 |          ✗           |     ✓      |   ✓   | Jika di-assign permission |
| Shortlink — override slug          |          ✗           |   ✓ ONLY   |   ✗   |             ✗             |
| Upload                             |          ✗           |     ✓      |   ✓   |      ✓ (kontekstual)      |

---

## OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

| #   | Keputusan Terbuka                                                                                                                                                             | Urgensi                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 11  | Rate limit untuk `POST /api/room-bookings/track/request-otp` — berapa request per menit/jam per nomor untuk mencegah abuse OTP?                                               | Sedang                                           |
| 12  | Endpoint kalender publik gabungan (`calendar_events` + `events`) — apakah ini endpoint baru `GET /api/calendar/combined`, atau digabung di frontend dengan 2x fetch terpisah? | Sedang — berdampak ke desain UI_COMPONENT_MAP.md |

---

_Dokumen selanjutnya: `CODING_CONVENTIONS.md` (branching strategy, PR review flow, dan konvensi kode detail — krusial mengingat tim 6 orang dengan pendekatan AI-assisted coding)._

```

```
