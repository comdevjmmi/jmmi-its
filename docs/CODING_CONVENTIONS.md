# CODING_CONVENTIONS.md

## Platform Website Terpadu JMMI ITS — Coding Conventions

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** ARCHITECTURE.md, API_CONTRACT.md, DATABASE_SCHEMA.md (semua v1.0)
**Tim:** 6 Developer (3 Frontend, 3 Backend), pendekatan AI-assisted "vibe coding"

---

## 1. GIT BRANCHING STRATEGY & COMMIT CONVENTIONS

### 1.1 Branch Naming Scheme

```
main                          # production-ready, protected, hanya merge via PR approved
develop                       # integration branch, semua feature branch merge ke sini dulu

feat/<modul>-<deskripsi-singkat>       # fitur baru
fix/<modul>-<deskripsi-singkat>        # bug fix
refactor/<modul>-<deskripsi-singkat>   # refactor tanpa ubah behavior
chore/<deskripsi-singkat>              # tooling, config, dependency update
docs/<deskripsi-singkat>               # perubahan dokumentasi saja
```

**Contoh konkret sesuai modul proyek ini:**

```
feat/room-booking-submit-form
feat/rbac-permission-middleware
fix/shortlink-slug-validation
refactor/auth-service-repository-pattern
chore/add-s3-storage-sdk
docs/update-api-contract-financial-reports
```

**Aturan:**

- Branch dibuat dari `develop`, bukan langsung dari `main`.
- Nama branch huruf kecil, kata dipisah dash (`-`), maksimal ~50 karakter.
- 1 branch = 1 unit kerja logis (idealnya selesai dalam 1-3 hari kerja untuk tim 6 orang, hindari branch raksasa yang hidup >1 minggu).

### 1.2 Commit Convention — Conventional Commits (Enforced via Commitlint, sudah terpasang di repo)

```
<type>(<scope>): <description singkat, present tense, lowercase>

[optional body]

[optional footer]
```

**Type yang dipakai** (mengikuti `commitlint.config.js` existing):
`feat`, `fix`, `docs`, `chore`, `style`, `refactor`, `ci`, `test`, `perf`, `revert`

**Scope** = nama modul (disarankan konsisten dengan nama folder service):
`auth`, `rbac`, `room-booking`, `item-booking`, `event`, `rsvp`, `lost-found`, `financial-report`, `content`, `shortlink`, `storage`, `notification`

**Contoh:**

```
feat(room-booking): add overlap validation via prisma transaction
fix(rbac): correct permission check for biro role on event creation
refactor(auth): migrate adminId references to userId across services
docs(api-contract): add calendar/combined endpoint spec
chore(storage): install @aws-sdk/client-s3
test(rsvp): add unique constraint violation test case
```

**Aturan tambahan:**

- Commit message body (opsional) dipakai untuk menjelaskan **"kenapa"**, bukan **"apa"** (diff sudah menunjukkan "apa").
- Hindari commit raksasa "wip" atau "fix stuff" — setiap commit harus lulus lint-staged (sudah terpasang via Husky pre-commit).
- Breaking change (mis. perubahan JWT payload `adminId` → `userId`) wajib pakai footer `BREAKING CHANGE: <penjelasan>`.

### 1.3 Pull Request Flow

```
1. Branch dibuat dari develop
2. Development + commit sesuai convention di atas
3. Push branch → buka PR ke develop (BUKAN ke main langsung)
4. PR wajib mengisi template (lihat 2.3 di bawah)
5. Minimal 1 approval dari reviewer lain (disarankan: 1 dari role berbeda —
   BE review FE, FE review BE — untuk cross-check integrasi API contract)
6. CI harus hijau (lint, typecheck, test — sudah ada di lint.yml existing)
7. Merge ke develop menggunakan "Squash and merge" (commit history bersih di develop)
8. develop → main dilakukan terjadwal (mis. per sprint), bukan per-PR individual
```

---

## 2. AI-ASSISTED CODING & PR REVIEW WORKFLOW

### 2.1 Prinsip Dasar Vibe Coding untuk Tim Ini

Karena tim menggunakan AI coding agent (Antigravity) secara aktif, dokumen `/docs` (PRD, ARCHITECTURE, DATABASE_SCHEMA, API_CONTRACT, dokumen ini) adalah **satu-satunya sumber kebenaran** yang harus di-reference oleh AI agent — bukan asumsi bebas dari model. Setiap developer wajib memastikan AI agent diberi konteks dokumen yang relevan sebelum generate kode.

### 2.2 Standard Prompt Template untuk AI Agent

Gunakan struktur berikut saat meminta AI agent (Antigravity atau sejenisnya) generate kode fitur baru:

```
KONTEKS:
- Baca /docs/ARCHITECTURE.md section [X] untuk pola layering yang harus diikuti
- Baca /docs/API_CONTRACT.md section [Y] untuk kontrak endpoint yang harus diimplementasikan
- Baca /docs/DATABASE_SCHEMA.md untuk model Prisma terkait

TUGAS:
Implementasikan [nama fitur] sesuai spesifikasi di atas, dengan:
1. Repository layer: [nama-repository].ts di src/lib/api/repositories/
2. Service layer: [nama-service].ts di src/lib/api/services/
3. Route handler: app/api/[path]/route.ts dengan middleware withAuth + withRbac
4. Zod validator: [nama].schema.ts di src/lib/validators/

BATASAN:
- JANGAN memanggil Prisma Client langsung dari service atau route handler —
  wajib lewat repository layer
- JANGAN membuat middleware/pattern baru yang belum ada di ARCHITECTURE.md —
  ikuti withAuth/withRbac yang sudah didefinisikan
- Ikuti response structure standar di API_CONTRACT.md section 1
  (ApiSuccessResponse/ApiErrorResponse)
- Jika ada keputusan desain yang tidak tercakup di dokumen, TANYAKAN dulu,
  jangan berasumsi

OUTPUT YANG DIHARAPKAN:
- Kode lengkap per file di atas
- Sebutkan jika ada migrasi Prisma yang perlu dijalankan
```

**Kenapa template ini penting:** AI agent tanpa batasan eksplisit cenderung "membantu lebih" dengan menambah pattern/library/struktur baru yang tidak konsisten dengan keputusan arsitektur yang sudah dikunci di `ARCHITECTURE.md`. Template di atas memaksa AI tetap dalam batas kontrak yang sudah disepakati tim.

### 2.3 Checklist Sanity Test Sebelum Membuka PR

Setiap developer (baik kode ditulis manual maupun AI-generated) WAJIB cek daftar ini sebelum membuka PR:

```markdown
## PR Checklist

### Kesesuaian Arsitektur

- [ ] Kode mengikuti layering Repository → Service → Route Handler (tidak ada Prisma call langsung di route/service)
- [ ] RBAC middleware (`withAuth` + `withRbac`) terpasang dengan `allowedRoles` & `requiredPermission` yang benar sesuai API_CONTRACT.md
- [ ] Response mengikuti struktur standar (`ApiSuccessResponse`/`ApiErrorResponse`)

### Validasi & Error Handling

- [ ] Semua input body/query divalidasi via Zod schema sebelum masuk ke service layer
- [ ] Error case dari DATABASE_SCHEMA.md/API_CONTRACT.md ditangani (mis. `409 BOOKING_CONFLICT`, `409 DUPLICATE_RSVP`)
- [ ] Tidak ada sensitive data (password hash, token) ter-expose di response

### Testing

- [ ] Unit test minimal untuk business logic kritis di service layer (mis. overlap-check, quota-check)
- [ ] `pnpm run lint:strict`, `pnpm run typecheck`, `pnpm run test` semua PASS lokal sebelum push

### Konsistensi dengan Dokumen

- [ ] Endpoint path & payload SAMA PERSIS dengan yang tertulis di API_CONTRACT.md (jika ada penyesuaian, update dokumen dulu, jangan biarkan kode dan dokumen berbeda)
- [ ] Jika mengambil keputusan teknis baru yang tidak tercakup dokumen, sudah didiskusikan dengan tim (bukan asumsi sepihak AI agent)

### AI-Generated Code (jika relevan)

- [ ] Kode hasil AI sudah dibaca ulang baris-per-baris oleh developer (bukan copy-paste buta)
- [ ] Tidak ada dependency/library baru yang ditambahkan AI tanpa sepengetahuan tim
```

### 2.4 Batasan Wewenang AI Agent

- AI agent **boleh** generate kode implementasi mengikuti kontrak yang sudah ada di `/docs`.
- AI agent **tidak boleh** dianggap sebagai pengambil keputusan arsitektur — keputusan baru (seperti Open Decisions di setiap dokumen kita) tetap harus dikunci manusia (tim), lalu didokumentasikan ulang, baru diimplementasikan.
- Developer bertanggung jawab penuh atas kode yang di-merge, terlepas dari apakah ditulis manual atau AI-generated.

---

## 3. CODE STRUCTURE & BEST PRACTICES

### 3.1 Repository Layer — Konvensi

```typescript
// src/lib/api/repositories/room-booking-repository.ts

import { prisma } from '@/lib/api/db';
import type { RoomBooking, BookingStatus } from '@prisma/client';

export const roomBookingRepository = {
  // Naming: verb + noun, deskriptif, tidak generic seperti "get" atau "find" saja
  async findOverlappingBookings(
    roomId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.roomBooking.findMany({
      where: {
        roomId,
        status: { in: ['pending', 'approved'] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });
  },

  async create(data: Omit<RoomBooking, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.roomBooking.create({ data });
  },

  async updateStatus(
    id: string,
    status: BookingStatus,
    extra?: { approverId?: string; rejectionReason?: string }
  ) {
    return prisma.roomBooking.update({
      where: { id },
      data: { status, ...extra },
    });
  },

  async findByPhone(phone: string) {
    return prisma.roomBooking.findMany({
      where: { jamaahPhone: phone },
      orderBy: { createdAt: 'desc' },
    });
  },
};
```

**Aturan Repository Layer:**

- Fungsi bernama deskriptif berdasarkan **apa yang dicari/dilakukan**, bukan generic CRUD (`findOverlappingBookings`, bukan `getBookings`).
- TIDAK ADA business logic di sini — murni query. Kalkulasi/validasi ada di Service layer.
- Selalu return tipe Prisma model langsung (bukan DTO) — mapping ke DTO dilakukan di Service layer.
- Satu file repository per domain/tabel utama.

### 3.2 Service Layer — Konvensi

```typescript
// src/lib/api/services/room-booking-service.ts

import { prisma } from '@/lib/api/db';
import { roomBookingRepository } from '@/lib/api/repositories/room-booking-repository';
import { notificationService } from '@/lib/api/services/notification-service';
import { AppError } from '@/lib/api/errors';

export const roomBookingService = {
  async submit(input: SubmitRoomBookingInput) {
    // Overlap check + insert dibungkus prisma.$transaction (keputusan terkunci)
    const booking = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.roomBooking.findMany({
        where: {
          roomId: input.roomId,
          status: { in: ['pending', 'approved'] },
          startDate: { lt: input.endDate },
          endDate: { gt: input.startDate },
        },
      });

      if (overlapping.length > 0) {
        throw new AppError(
          'BOOKING_CONFLICT',
          'Slot waktu ini sudah dipesan.',
          409
        );
      }

      return tx.roomBooking.create({ data: { ...input, status: 'pending' } });
    });

    await notificationService.send({
      recipientPhone: booking.jamaahPhone,
      type: 'booking_pending',
      templateData: { name: booking.jamaahName, itemName: 'Tempat' },
      relatedEntity: `room_bookings:${booking.id}`,
    });

    return mapToRoomBookingDTO(booking);
  },

  async approve(bookingId: string, approverId: string) {
    const booking = await roomBookingRepository.updateStatus(
      bookingId,
      'approved',
      { approverId }
    );
    await notificationService.send({
      recipientPhone: booking.jamaahPhone,
      type: 'booking_approved',
      templateData: { name: booking.jamaahName, itemName: 'Tempat' },
      relatedEntity: `room_bookings:${booking.id}`,
    });
    return mapToRoomBookingDTO(booking);
  },

  // ...reject, track, dll mengikuti pola yang sama
};
```

**Aturan Service Layer:**

- **Satu-satunya layer** yang boleh memanggil `prisma.$transaction` langsung (untuk kasus yang butuh atomicity lintas-repository, seperti overlap-check+insert).
- Untuk query tunggal non-transactional, tetap panggil lewat Repository layer, JANGAN import `prisma` langsung kecuali untuk kebutuhan `$transaction`.
- Orkestrasi antar-service (mis. booking → notification) terjadi di sini, bukan di Repository maupun Route Handler.
- Selalu return DTO yang sudah di-mapping (`mapToRoomBookingDTO`), bukan raw Prisma model, ke Route Handler.
- Error dilempar sebagai `AppError` (custom error class) dengan `code` + `message` + `statusCode`, ditangkap oleh `with-error-handler.ts` middleware (lihat ARCHITECTURE.md) — bukan `throw new Error()` generic.

### 3.3 Error Handling — Custom Error Class

```typescript
// src/lib/api/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Dipakai di with-error-handler.ts middleware:
export function withErrorHandler(handler: (req: any) => Promise<Response>) {
  return async (req: any) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof AppError) {
        return Response.json(
          {
            success: false,
            error: {
              code: err.code,
              message: err.message,
              details: err.details,
            },
          },
          { status: err.statusCode }
        );
      }
      if (err instanceof ZodError) {
        return Response.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Data tidak valid.',
              details: err.flatten().fieldErrors,
            },
          },
          { status: 400 }
        );
      }
      console.error('Unhandled error:', err);
      return Response.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Terjadi kesalahan pada server.',
          },
        },
        { status: 500 }
      );
    }
  };
}
```

### 3.4 Zod Validation — Placement & Konvensi

```typescript
// src/lib/validators/room-booking.schema.ts

import { z } from 'zod';

export const submitRoomBookingSchema = z
  .object({
    roomId: z.string().uuid(),
    jamaahName: z.string().min(3).max(100),
    jamaahPhone: z
      .string()
      .regex(
        /^62\d{9,13}$/,
        'Format nomor harus diawali 62, tanpa spasi/strip'
      ),
    purpose: z.string().min(5).max(500),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  });

// Contoh khusus untuk keputusan terkunci: email/phone nullable di DB,
// wajib salah satu di API layer
export const createUserSchema = z
  .object({
    name: z.string().min(3),
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^62\d{9,13}$/)
      .optional(),
    password: z.string().min(8),
    role: z.enum(['admin', 'biro']),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Salah satu dari email atau nomor HP wajib diisi',
    path: ['email'],
  });
```

**Aturan Zod:**

- Parsing/validasi dilakukan **di Route Handler**, sebelum data diteruskan ke Service layer — Service layer menerima data yang sudah pasti valid (typed, bukan `any`/`unknown`).
- Satu file schema per domain, disimpan di `src/lib/validators/`.
- Gunakan `.refine()` untuk validasi lintas-field (seperti contoh `endDate > startDate` dan `email || phone`).
- Schema JUGA dipakai untuk infer TypeScript type (`z.infer<typeof submitRoomBookingSchema>`) — hindari duplikasi definisi type manual.

### 3.5 Prisma Query Conventions

- **Selalu** gunakan `select`/`include` eksplisit untuk field yang benar-benar dibutuhkan — hindari `findMany()` tanpa filter yang menarik seluruh kolom termasuk relasi tidak perlu (dampak performance, lihat NFR-PERF di SRS).
- Query yang butuh atomicity (overlap-check+insert, quota-check+RSVP-insert) **wajib** `prisma.$transaction`.
- Tidak ada raw SQL (`$queryRaw`) kecuali benar-benar tidak bisa diekspresikan via Prisma Client — jika terpaksa, wajib comment penjelasan alasan.

---

## 4. ENVIRONMENT & TESTING GUIDELINES

### 4.1 .env Safety

```
# .env.example (WAJIB di-commit, berisi key TANPA value asli)
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
STORAGE_ENDPOINT=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
STORAGE_PUBLIC_URL=
BAILEYS_SERVICE_URL=          # internal HTTP endpoint standalone Baileys service
BAILEYS_SERVICE_API_KEY=      # auth internal antara Next.js <-> Baileys service
OTP_RATE_LIMIT_MAX=3          # keputusan terkunci: 3 request
OTP_RATE_LIMIT_WINDOW_MINUTES=10   # keputusan terkunci: per 10 menit
```

**Aturan:**

- `.env` (dengan value asli) **TIDAK PERNAH** di-commit — sudah harus ada di `.gitignore` (verifikasi ulang, existing repo kemungkinan sudah benar).
- `.env.example` WAJIB selalu sinkron — setiap kali developer menambah environment variable baru, update `.env.example` di PR yang sama.
- Secrets production (JWT_SECRET, STORAGE_SECRET_KEY, BAILEYS_SERVICE_API_KEY) dikelola lewat platform hosting (Vercel/Railway Environment Variables), **tidak pernah** di-share via chat/dokumen.

### 4.2 Mock Data Seeding Strategy

```typescript
// prisma/seed.ts — struktur seed untuk development

async function main() {
  await seedRbacDefaults(); // superadmin dev + permissions (lihat DATABASE_SCHEMA.md 5.4)
  await seedRoomsAndItems(); // beberapa Room & ItemAsset dummy untuk testing booking flow
  await seedSampleEvents(); // 2-3 Event dengan quotaMax berbeda (termasuk 1 quota_max: null)
  await seedSampleContent(); // beberapa Content draft+published, lang id+en
  console.log('Seeding completed.');
}

// Jalankan: pnpm prisma db seed
```

**Aturan:**

- Data seed **tidak boleh** berisi data Jamaah/pengurus JMMI asli — gunakan nama/nomor dummy jelas (mis. "Test Jamaah 1", nomor `628111111111`) untuk menghindari kebocoran data pribadi ke environment development/staging.
- Setiap modul baru yang di-develop wajib menambah seed data representatif di `seed.ts` — supaya developer lain langsung bisa test tanpa manual create data.
- Untuk skenario testing edge case (mis. kuota event penuh, stok item habis), buat seed data KHUSUS yang mem-precondition kondisi tsb (mis. event dengan `quotaMax: 1` dan sudah ada 1 RSVP existing).

### 4.3 Testing Guidelines

- **Unit test wajib** untuk business logic kritis di Service layer: overlap-check, quota-check, dedup-check RSVP, permission-check.
- **Tidak wajib** 100% coverage untuk seluruh codebase — prioritaskan modul dengan risiko tinggi (booking conflict, RBAC enforcement) sesuai `TEST_PLAN.md` (dokumen berikutnya).
- Test file location: co-located di `__tests__/` sesuai struktur existing repo, penamaan `<nama-file>.test.ts`.
- CI (`lint.yml` existing) sudah menjalankan `pnpm run test` otomatis di setiap PR — pastikan lokal PASS sebelum push untuk hemat waktu iterasi CI.

---

## OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

Tidak ada Open Decision baru dari dokumen ini — seluruh konvensi mengikuti keputusan arsitektur yang sudah dikunci di dokumen-dokumen sebelumnya.

---

_Dokumen selanjutnya: `TEST_PLAN.md` (strategi testing per modul, prioritas test case berdasarkan risiko, dan test scenario untuk edge case kritis seperti double-booking dan quota race condition)._
