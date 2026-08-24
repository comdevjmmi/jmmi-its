# ARCHITECTURE.md

## Platform Website Terpadu JMMI ITS — Technical Architecture

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** PRD.md v1.0, SRS v1.0, DBML Schema v1.0
**Locked Decisions:** WhatsApp Provider = Baileys, RSVP dedup = 1 nomor WA/event, Cancellation by Jamaah = out-of-scope v1

---

## 1. STRUKTUR FOLDER (PENYESUAIAN DARI EXISTING)

Struktur existing dipertahankan sebagai basis (Layered Architecture + Service Pattern), dengan penambahan layer **Repository** untuk memisahkan query Prisma dari business logic, dan folder baru untuk domain baru.

```
src/
├── app/
│   ├── (public)/                       # Route group publik, tanpa auth
│   │   ├── about/
│   │   ├── announcement/
│   │   ├── finance/                    # existing — transparansi finance_transactions
│   │   ├── laporan-keuangan/           # BARU — publik view financial_reports
│   │   ├── kalender/                   # existing — gabungan calendar_events + events
│   │   ├── kegiatan/[eventId]/         # BARU — detail event + form RSVP
│   │   ├── peminjaman-tempat/          # BARU — form + kalender publik
│   │   ├── peminjaman-barang/          # BARU — form + katalog barang
│   │   ├── lost-and-found/             # BARU — listing publik
│   │   ├── donasi/                     # BARU — info statis QRIS/rekening
│   │   ├── blog/[slug]/                # BARU — CMS publik
│   │   ├── links/                      # existing — linktree
│   │   └── login/                      # existing
│   ├── admin/                          # Route group admin, wajib auth
│   │   ├── layout.tsx                  # existing — wrap dengan RBAC guard
│   │   ├── users/                      # BARU — Superadmin only, manajemen users+permissions
│   │   ├── kalender/                   # existing
│   │   ├── kegiatan/                   # BARU — CRUD event + export CSV peserta
│   │   ├── peminjaman-tempat/          # BARU — approval queue + kalender detail
│   │   ├── peminjaman-barang/          # BARU — approval queue
│   │   ├── lost-and-found/             # BARU — CRUD posting
│   │   ├── keuangan/                   # existing (finance_transactions)
│   │   ├── laporan-keuangan/           # BARU — CRUD financial_reports
│   │   ├── blog/                       # BARU — CMS editor
│   │   └── links/, shortlinks/         # existing — disesuaikan RBAC scoping
│   ├── api/
│   │   ├── auth/                       # existing — disesuaikan payload users
│   │   ├── users/                      # BARU
│   │   ├── permissions/                # BARU
│   │   ├── rooms/, room-bookings/      # BARU
│   │   ├── items/, item-bookings/      # BARU
│   │   ├── events/, rsvp/              # BARU
│   │   ├── lost-found/                 # BARU
│   │   ├── financial-reports/          # BARU
│   │   ├── content/                    # BARU (blog/gallery/dll)
│   │   ├── upload/                     # BARU — proxy ke storage service
│   │   ├── calendar/, finance/, links/, shortlinks/  # existing
│   │   └── webhooks/whatsapp/          # BARU — callback status Baileys (opsional)
│   └── s/[shortCode]/                  # existing
├── components/                         # existing, tambah subfolder per modul baru
│   ├── booking/                        # BARU — form & kalender komponen shared Tempat+Barang
│   ├── events/                         # BARU
│   ├── lost-found/                     # BARU
│   └── ...
├── lib/
│   ├── api/
│   │   ├── db.ts                       # existing — Prisma client singleton
│   │   ├── auth.ts                     # existing — disesuaikan payload {userId, role}
│   │   ├── config.ts                   # existing
│   │   ├── middleware/                 # BARU
│   │   │   ├── with-auth.ts            # Verifikasi JWT, inject user ke request context
│   │   │   ├── with-rbac.ts            # Cek role + permission per endpoint
│   │   │   └── with-error-handler.ts   # Standardisasi error response
│   │   ├── repositories/               # BARU — query layer, dipanggil oleh services
│   │   │   ├── user-repository.ts
│   │   │   ├── room-booking-repository.ts
│   │   │   ├── item-booking-repository.ts
│   │   │   ├── event-repository.ts
│   │   │   ├── rsvp-repository.ts
│   │   │   ├── lost-found-repository.ts
│   │   │   ├── financial-report-repository.ts
│   │   │   ├── content-repository.ts
│   │   │   └── short-link-repository.ts
│   │   └── services/                   # existing folder, tambah service baru
│   │       ├── auth-service.ts         # existing — disesuaikan
│   │       ├── user-service.ts         # BARU
│   │       ├── permission-service.ts   # BARU
│   │       ├── room-booking-service.ts # BARU
│   │       ├── item-booking-service.ts # BARU
│   │       ├── event-service.ts        # BARU
│   │       ├── rsvp-service.ts         # BARU
│   │       ├── lost-found-service.ts   # BARU
│   │       ├── financial-report-service.ts  # BARU
│   │       ├── content-service.ts      # BARU
│   │       ├── storage-service.ts      # BARU — abstraksi S3
│   │       ├── notification-service.ts # BARU — abstraksi Baileys
│   │       ├── calendar-service.ts     # existing
│   │       ├── finance-service.ts      # existing
│   │       └── shortlinks-service.ts   # existing — disesuaikan RBAC
│   ├── validators/                     # BARU — Zod schema per domain
│   │   ├── room-booking.schema.ts
│   │   ├── item-booking.schema.ts
│   │   ├── event.schema.ts
│   │   ├── rsvp.schema.ts
│   │   └── ...
│   └── cookies.ts                      # existing
├── stores/                             # existing, tambah store per kebutuhan UI baru
│   └── useAuthStore.ts                 # existing — disesuaikan shape user (role, permissions)
├── types/                              # existing — tambah entities & DTO baru sesuai DBML
└── __tests__/                          # existing
```

**Prinsip layering (WAJIB diikuti tim, termasuk AI agent):**

```
Route Handler (app/api/**/route.ts)
   ↓ hanya panggil service, TIDAK ADA business logic di sini
Middleware (with-auth → with-rbac → handler)
   ↓
Service Layer (lib/api/services/*)
   ↓ business logic, validasi, orchestrasi
   ↓ TIDAK boleh langsung import Prisma Client
Repository Layer (lib/api/repositories/*)
   ↓ satu-satunya layer yang boleh import & memanggil Prisma Client
Database (Prisma → PostgreSQL)
```

> **Catatan migrasi:** Service existing (`auth-service.ts`, `calendar-service.ts`, `finance-service.ts`, `shortlinks-service.ts`) saat ini kemungkinan memanggil Prisma langsung tanpa Repository layer. **Tidak wajib di-refactor ulang seluruhnya** di v1 — cukup pastikan service BARU mengikuti pola Repository. Refactor existing service adalah _nice-to-have_, bukan blocking (hindari over-engineering di awal).

---

## 2. RBAC — FLOW & MIDDLEWARE IMPLEMENTATION

### 2.1 JWT Payload Baru

```typescript
// lib/api/auth.ts — struktur payload baru
interface JwtPayload {
  userId: string; // sebelumnya: adminId
  email: string;
  role: 'superadmin' | 'admin' | 'biro';
  type: 'access' | 'refresh';
}
```

### 2.2 Middleware Chain

```typescript
// lib/api/middleware/with-auth.ts
// Tanggung jawab: verifikasi JWT, inject user ke request context
// TIDAK mengecek role/permission di sini — pisahkan dari with-rbac

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/auth';

export type AuthenticatedRequest = NextRequest & {
  user: { userId: string; email: string; role: string };
};

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const payload = verifyToken(token); // existing jwt.verify wrapper
      (req as AuthenticatedRequest).user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      return handler(req as AuthenticatedRequest);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}
```

```typescript
// lib/api/middleware/with-rbac.ts
// Tanggung jawab: cek role langsung ATAU cek permission granular (untuk role 'biro')

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from './with-auth';
import { permissionService } from '@/lib/api/services/permission-service';

type RbacOptions = {
  allowedRoles: Array<'superadmin' | 'admin' | 'biro'>;
  requiredPermission?: { module: string; action: string }; // dicek HANYA jika role === 'biro'
};

export function withRbac(
  options: RbacOptions,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    const { role, userId } = req.user;

    if (!options.allowedRoles.includes(role as any)) {
      return NextResponse.json(
        { error: 'Forbidden: role not allowed' },
        { status: 403 }
      );
    }

    // Superadmin & Admin: akses penuh ke modul yang allowedRoles-nya include mereka
    if (role === 'superadmin' || role === 'admin') {
      return handler(req);
    }

    // Biro: WAJIB cek permission granular
    if (role === 'biro' && options.requiredPermission) {
      const hasPermission = await permissionService.checkUserPermission(
        userId,
        options.requiredPermission.module,
        options.requiredPermission.action
      );
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Forbidden: missing permission for this module' },
          { status: 403 }
        );
      }
    }

    return handler(req);
  };
}
```

### 2.3 Contoh Pemakaian di Route Handler

```typescript
// app/api/room-bookings/[id]/approve/route.ts
import { withAuth } from '@/lib/api/middleware/with-auth';
import { withRbac } from '@/lib/api/middleware/with-rbac';
import { roomBookingService } from '@/lib/api/services/room-booking-service';

export const POST = withAuth((req) =>
  withRbac(
    {
      allowedRoles: ['superadmin', 'admin', 'biro'],
      requiredPermission: { module: 'room_bookings', action: 'approve' },
    },
    async (req) => {
      const { id } = /* extract dari params */;
      const result = await roomBookingService.approve(id, req.user.userId);
      return Response.json(result);
    }
  )(req)
);
```

### 2.4 Permission Mapping (Referensi Awal)

Berikut mapping `module` + `action` yang dipakai `requiredPermission` di atas — ini adalah data seed awal untuk tabel `permissions`, BUKAN hardcoded logic:

| module              | action                            | Digunakan di                                                                                           |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `room_bookings`     | `approve`, `view_detail`          | Approval Peminjaman Tempat                                                                             |
| `item_bookings`     | `approve`, `view_detail`          | Approval Peminjaman Barang                                                                             |
| `events`            | `create`, `update`, `export_rsvp` | Manajemen Event & RSVP                                                                                 |
| `lost_found`        | `create`, `update`                | Posting Lost & Found                                                                                   |
| `content`           | `create`, `update`, `publish`     | Blog/Konten                                                                                            |
| `financial_reports` | `create`, `update`                | Input Laporan Keuangan                                                                                 |
| `short_links`       | `create`                          | Create Shorten Link (override tetap eksklusif Superadmin, dicek terpisah bukan lewat tabel permission) |

> Superadmin & Admin **tidak perlu entry di `user_permissions`** — akses mereka ditentukan langsung dari `role` di middleware (lihat 2.2), bukan permission granular. Tabel `permissions`/`user_permissions` HANYA relevan untuk role `biro`.

### 2.5 Auth Store (Frontend) — Perubahan Shape

```typescript
// stores/useAuthStore.ts — shape baru
interface AuthState {
  user: {
    userId: string;
    email: string;
    name: string;
    role: 'superadmin' | 'admin' | 'biro';
    permissions?: Array<{ module: string; action: string }>; // hanya terisi jika role === 'biro'
  } | null;
  // ... existing methods (login, logout, dll) tetap dipertahankan
}
```

---

## 3. SERVICE LAYER — FILE STORAGE (S3-COMPATIBLE)

### 3.1 Desain: Interface Generic + Implementasi Konkret

Prinsip: route handler & service lain **tidak boleh tahu** detail provider (S3 vs Supabase Storage vs lainnya) — hanya bergantung pada interface.

```typescript
// lib/api/services/storage-service.ts

export interface UploadResult {
  url: string;
  key: string; // path/identifier di storage, untuk keperluan delete nanti
}

export interface StorageService {
  upload(
    file: Buffer,
    options: { folder: string; filename: string; contentType: string }
  ): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}

// Implementasi konkret — S3-compatible (kompatibel Supabase Storage / AWS S3)
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

class S3CompatibleStorageService implements StorageService {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.STORAGE_ENDPOINT, // e.g. Supabase Storage endpoint
      region: process.env.STORAGE_REGION ?? 'auto',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY!,
        secretAccessKey: process.env.STORAGE_SECRET_KEY!,
      },
      forcePathStyle: true, // wajib true untuk sebagian besar provider S3-compatible
    });
    this.bucket = process.env.STORAGE_BUCKET!;
    this.publicBaseUrl = process.env.STORAGE_PUBLIC_URL!;
  }

  async upload(
    file: Buffer,
    options: { folder: string; filename: string; contentType: string }
  ): Promise<UploadResult> {
    const key = `${options.folder}/${Date.now()}-${options.filename}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: options.contentType,
        ACL: 'public-read',
      })
    );
    return { url: `${this.publicBaseUrl}/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}

export const storageService: StorageService = new S3CompatibleStorageService();
```

### 3.2 Endpoint Upload Generic

```typescript
// app/api/upload/route.ts
import { withAuth } from '@/lib/api/middleware/with-auth';
import { withRbac } from '@/lib/api/middleware/with-rbac';
import { storageService } from '@/lib/api/services/storage-service';

export const POST = withAuth((req) =>
  withRbac({ allowedRoles: ['superadmin', 'admin', 'biro'] }, async (req) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string; // 'lost-found' | 'content' | 'events'

    if (!file)
      return Response.json({ error: 'No file provided' }, { status: 400 });
    // Validasi ukuran & tipe file WAJIB dilakukan di sini (mis. max 5MB, hanya image/*)

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storageService.upload(buffer, {
      folder,
      filename: file.name,
      contentType: file.type,
    });
    return Response.json(result);
  })(req)
);
```

**Environment Variables Baru (dicatat juga di ENV_SETUP.md nanti):**

```
STORAGE_ENDPOINT=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
STORAGE_PUBLIC_URL=
```

---

## 4. SERVICE LAYER — NOTIFICATION SERVICE (BAILEYS)

### 4.1 Desain: Interface Generic + Adapter Baileys

Sesuai keputusan tim: Baileys FIX dipakai, tapi **interface tetap generic** — bila suatu saat perlu pindah ke WA Business API resmi, hanya adapter yang diganti, service layer & pemanggil tidak berubah.

```typescript
// lib/api/services/notification-service.ts

export type NotificationType =
  | 'booking_pending'
  | 'booking_approved'
  | 'booking_rejected'
  | 'rsvp_confirmed'
  | 'item_return_reminder';

export interface SendNotificationParams {
  recipientPhone: string; // format E.164, mis. 6281234567890
  type: NotificationType;
  templateData: Record<string, string>; // untuk interpolasi template pesan
  relatedEntity?: string; // mis. 'room_bookings:uuid' — untuk logging
}

export interface NotificationProvider {
  send(
    params: SendNotificationParams
  ): Promise<{ success: boolean; providerMessageId?: string }>;
  isConnected(): Promise<boolean>;
}

// --- Message Templates (terpisah dari logic pengiriman) ---
const MESSAGE_TEMPLATES: Record<
  NotificationType,
  (data: Record<string, string>) => string
> = {
  booking_pending: (d) =>
    `Halo ${d.name}, pengajuan peminjaman ${d.itemName} Anda telah diterima dan sedang menunggu review. Kami akan menghubungi Anda segera.`,
  booking_approved: (d) =>
    `Halo ${d.name}, pengajuan peminjaman ${d.itemName} Anda telah DISETUJUI. ${
      d.additionalInfo ?? ''
    }`,
  booking_rejected: (d) =>
    `Halo ${d.name}, mohon maaf pengajuan peminjaman ${d.itemName} Anda tidak dapat disetujui. Alasan: ${d.reason}`,
  rsvp_confirmed: (d) =>
    `Halo ${d.name}, pendaftaran Anda untuk kegiatan "${d.eventName}" telah terkonfirmasi. Sampai jumpa!`,
  item_return_reminder: (d) =>
    `Halo ${d.name}, ini pengingat bahwa ${d.itemName} yang Anda pinjam sudah jatuh tempo pengembalian pada ${d.returnDate}.`,
};

// --- Adapter Baileys ---
import { notificationLogRepository } from '@/lib/api/repositories/notification-log-repository';
// asumsi: koneksi Baileys socket sudah di-inisialisasi terpisah (lihat 4.2)
import { getBaileysSocket } from '@/lib/api/baileys/socket-manager';

class BaileysNotificationProvider implements NotificationProvider {
  async isConnected(): Promise<boolean> {
    const socket = getBaileysSocket();
    return socket?.user != null;
  }

  async send(params: SendNotificationParams) {
    const jid = `${params.recipientPhone}@s.whatsapp.net`;
    const message = MESSAGE_TEMPLATES[params.type](params.templateData);

    try {
      const socket = getBaileysSocket();
      if (!socket) throw new Error('Baileys socket not connected');

      const result = await socket.sendMessage(jid, { text: message });

      await notificationLogRepository.create({
        recipientPhone: params.recipientPhone,
        notifType: params.type,
        relatedEntity: params.relatedEntity,
        messageBody: message,
        sendStatus: 'sent',
      });

      return { success: true, providerMessageId: result?.key?.id };
    } catch (error) {
      await notificationLogRepository.create({
        recipientPhone: params.recipientPhone,
        notifType: params.type,
        relatedEntity: params.relatedEntity,
        messageBody: message,
        sendStatus: 'failed',
      });
      // PENTING: jangan throw — kegagalan kirim WA tidak boleh menggagalkan
      // proses utama (mis. approval booking tetap harus tersimpan meski notif gagal)
      return { success: false };
    }
  }
}

export const notificationService: NotificationProvider =
  new BaileysNotificationProvider();
```

### 4.2 Catatan Implementasi Baileys (Krusial — Baca Sebelum Implementasi)

Sesuai **NFR-REL-01 di SRS**, Baileys adalah unofficial API dengan risiko disconnect/ban. Beberapa hal WAJIB diperhatikan tim Backend:

- **Socket persistence:** Koneksi Baileys (`socket-manager.ts`) harus berjalan sebagai proses long-lived TERPISAH dari serverless function Next.js API routes (yang stateless/short-lived). Next.js App Router di Vercel/Netlify **tidak cocok** untuk hosting koneksi socket Baileys secara langsung.
  - **Rekomendasi:** jalankan Baileys sebagai service terpisah (mis. small Node process di VPS/Railway/Fly.io) yang expose internal API/queue, dipanggil oleh `notification-service.ts` via HTTP call — bukan Baileys socket langsung di dalam Next.js process.
- **Session persistence:** Simpan auth session Baileys (`multi-file-auth-state` atau setara) di storage persisten, BUKAN filesystem ephemeral platform serverless.
- **Retry & Queue:** Disarankan queue sederhana (mis. tabel `notification_logs` dengan status `pending` → cron job retry) untuk kasus socket sedang disconnect saat pengiriman.
- **Ini adalah keputusan arsitektur terbuka untuk tim Backend** — detail implementasi socket-manager & hosting Baileys perlu dibahas terpisah sebelum sprint Fase 0 dimulai, karena berdampak pada infrastruktur deployment (bukan hanya kode aplikasi).

---

## 5. DATABASE MIGRATION & SEEDING STRATEGY

### 5.1 Migrasi `admins` → `users`

```prisma
// prisma/schema.prisma — perubahan model

enum UserRole {
  superadmin
  admin
  biro
}

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

  userPermissions   UserPermission[]
  roomBookingsApproved RoomBooking[] @relation("RoomBookingApprover")
  itemBookingsApproved ItemBooking[] @relation("ItemBookingApprover")
  eventsCreated     Event[]
  contentsAuthored  Content[]
  financialReports  FinancialReport[]
  shortLinksCreated ShortLink[]
  lostFoundPosted   LostFoundItem[]

  @@map("users")
}

// model Admin { ... } — DIHAPUS setelah migrasi berhasil dan diverifikasi
```

### 5.2 Langkah Migrasi (Urutan WAJIB Diikuti)

```
Step 1 — Buat migrasi Prisma additive (TIDAK menghapus tabel admins dulu):
  npx prisma migrate dev --name add_users_table_with_rbac
  → Ini membuat tabel `users` BARU, tabel `admins` TETAP ADA sementara

Step 2 — Jalankan data migration script (terpisah dari Prisma migration):
  → Script custom (lihat 5.3) yang copy semua row admins ke users
  → role di-set default 'admin' untuk semua row hasil migrasi
  → password_hash di-copy APA ADANYA (tidak perlu re-hash, algoritma bcrypt sama)

Step 3 — Verifikasi manual:
  → Cek jumlah row admins === jumlah row users hasil migrasi
  → Test login dengan salah satu akun admin existing menggunakan sistem baru
  → Assign MINIMAL SATU akun sebagai role 'superadmin' secara manual (lihat 5.4)

Step 4 — Update seluruh kode yang reference tabel/model `admins`:
  → auth-service.ts, auth.ts (JWT payload), semua service existing
  → Deploy & smoke-test di staging environment

Step 5 — SETELAH stabil di production (rekomendasi: tunggu minimal 1 sprint):
  → Baru buat migrasi Prisma untuk DROP tabel admins
  → npx prisma migrate dev --name drop_legacy_admins_table
```

> **PENTING:** Jangan gabungkan Step 1 dan Step 5 dalam satu migrasi. Additive-first, destructive-last — ini mencegah data loss jika ada masalah di tengah proses migrasi.

### 5.3 Data Migration Script (Referensi)

```typescript
// scripts/migrate-admins-to-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAdminsToUsers() {
  const admins = await prisma.admin.findMany();

  console.log(`Found ${admins.length} admin records to migrate.`);

  for (const admin of admins) {
    await prisma.user.create({
      data: {
        // Sesuaikan mapping field persis dengan struktur admin existing
        name: admin.name ?? admin.email.split('@')[0],
        email: admin.email,
        passwordHash: admin.password, // field name existing perlu dicek ulang di schema asli
        role: 'admin', // default — di-upgrade manual ke superadmin pasca-migrasi
        isActive: true,
      },
    });
  }

  console.log(
    'Migration completed. Please manually assign at least one superadmin.'
  );
}

migrateAdminsToUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Jalankan dengan: `npx tsx scripts/migrate-admins-to-users.ts` (sekali jalan, bukan bagian dari `seed.ts` reguler).

### 5.4 Seed Data untuk Development

```typescript
// prisma/seed.ts — tambahan seed baru (di luar migrasi data existing)

async function seedRbacDefaults() {
  // 1. Pastikan ada 1 superadmin untuk development
  await prisma.user.upsert({
    where: { email: 'superadmin@jmmi-its.com' },
    update: {},
    create: {
      name: 'Superadmin Dev',
      email: 'superadmin@jmmi-its.com',
      passwordHash: await bcrypt.hash('dev-password-change-me', 10),
      role: 'superadmin',
      isActive: true,
    },
  });

  // 2. Seed daftar permissions dasar (sesuai mapping di section 2.4)
  const permissionSeeds = [
    { moduleName: 'room_bookings', action: 'approve' },
    { moduleName: 'room_bookings', action: 'view_detail' },
    { moduleName: 'item_bookings', action: 'approve' },
    { moduleName: 'events', action: 'create' },
    { moduleName: 'events', action: 'export_rsvp' },
    { moduleName: 'lost_found', action: 'create' },
    { moduleName: 'content', action: 'create' },
    { moduleName: 'content', action: 'publish' },
    { moduleName: 'financial_reports', action: 'create' },
    { moduleName: 'short_links', action: 'create' },
  ];
  await prisma.permission.createMany({
    data: permissionSeeds,
    skipDuplicates: true,
  });
}
```

---

## 6. RINGKASAN KEPUTUSAN ARSITEKTUR (QUICK REFERENCE)

| Area              | Keputusan                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Auth model        | Extend `admins` → `users`, additive migration, drop legacy setelah stabil                                                  |
| RBAC enforcement  | Middleware chain `withAuth` → `withRbac`, permission granular HANYA untuk role `biro`                                      |
| Query layer       | Repository pattern BARU untuk semua modul baru; existing service TIDAK wajib direfactor                                    |
| File storage      | S3-compatible, interface generic (`StorageService`), implementasi konkret terpisah                                         |
| Notifikasi        | Baileys FIX, interface generic (`NotificationProvider`), socket dijalankan sebagai proses terpisah dari Next.js serverless |
| Events/RSVP       | Tabel baru terpisah dari `calendar_events`, digabung di level query/view untuk `/kalender`                                 |
| Financial reports | Tabel baru terpisah dari `finance_transactions`, tanpa agregasi otomatis di v1                                             |

---

## OPEN DECISIONS TAMBAHAN (MUNCUL DARI DOKUMEN INI)

| #   | Keputusan Terbuka                                                                                                                       | Urgensi                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 7   | Hosting/infrastruktur untuk proses Baileys socket terpisah (VPS/Railway/Fly.io — pilihan mana?)                                         | **Tinggi — blocking implementasi Notification Service** |
| 8   | Apakah existing service (`auth-service.ts`, `calendar-service.ts`, dll) di-refactor ke Repository pattern sekarang atau menyusul di v2? | Rendah                                                  |

---

_Dokumen selanjutnya: `DATABASE_SCHEMA.md` (finalisasi DBML dengan penyesuaian dari keputusan migrasi di atas — termasuk model `User` yang menggantikan `Admin`)._

```

```
