# UI_COMPONENT_MAP.md

## Platform Website Terpadu JMMI ITS — UI Component Map

**Versi:** 1.0
**Tipe Dokumen:** Technical Reference (dev team & AI coding agents)
**Referensi:** ARCHITECTURE.md, API_CONTRACT.md, SPRINT_BACKLOG.md Task 6.2 (semua v1.0)
**Tech Stack UI:** Tailwind CSS v4, shadcn/ui, lucide-react (existing), Radix UI primitives (basis shadcn/ui)

---

## 1. ATOMIC DESIGN HIERARCHY

```
Atoms          → Elemen UI terkecil, tidak bisa dipecah lagi, tanpa business logic
                  (Button, Input, Badge, Spinner, Avatar)
   ↓
Molecules      → Kombinasi 2+ Atoms membentuk unit fungsional kecil
                  (FormField = Label+Input+ErrorText, SearchBar = Input+Button)
   ↓
Organisms      → Kombinasi Molecules+Atoms membentuk section UI utuh dengan logic
                  (Navbar, RoomBookingForm, ApprovalQueueTable)
   ↓
Templates      → Layout halaman lengkap yang menyusun Organisms, tanpa data nyata
                  (AdminDashboardTemplate, PublicPageTemplate)
   ↓
Pages          → Template + data nyata (route Next.js — di luar scope dokumen ini,
                  didefinisikan di app/ sesuai ARCHITECTURE.md)
```

**Prinsip penempatan folder** (selaras ARCHITECTURE.md Section 1):

```
src/components/
├── ui/              # Atoms — hasil generate shadcn/ui (button.tsx, input.tsx, dll)
├── shared/          # Molecules & Organisms generik lintas-modul (Navbar, Modal, Table)
├── booking/         # Organisms khusus domain Booking
├── events/          # Organisms khusus domain Event/RSVP
├── lost-found/      # Organisms khusus domain Lost & Found
├── admin/           # Organisms khusus area Admin (Sidebar, existing)
└── layout/          # Templates (existing folder, disesuaikan)
```

**Aturan:** Sebelum membuat komponen baru, cek Component Matrix (Section 2) — jika sudah ada Atom/Molecule yang sesuai, WAJIB reuse, bukan buat versi baru yang mirip (mencegah duplikasi yang jadi temuan Design Audit di SPRINT_BACKLOG.md Task 6.1).

---

## 2. COMPONENT MATRIX

### 2.1 ATOMS

#### `Button`

**Path:** `src/components/ui/button.tsx` (shadcn/ui base, kustomisasi token warna)
**Props Signature:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Variants:** `primary` (aksi utama, mis. Submit), `secondary` (aksi sekunder), `outline` (aksi tersier), `ghost` (aksi minim visual, mis. icon button di tabel), `destructive` (aksi berbahaya, mis. Reject/Delete), `link` (tampil sebagai teks bertaut)
**State Management:** Stateless — `isLoading` dikontrol dari parent (menampilkan spinner + disable interaksi otomatis saat `true`)

#### `Input` / `Textarea`

**Path:** `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`
**Props Signature:**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean; // styling border merah, dikontrol dari FormField parent
}
```

**Variants:** default, `error` (border merah + fokus ring merah)
**State Management:** Stateless — dikontrol via React Hook Form (`register`/`Controller`)

#### `Badge` (dasar untuk `StatusBadge`, lihat Molecule)

**Path:** `src/components/ui/badge.tsx`
**Props Signature:**

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}
```

#### `Spinner`

**Path:** `src/components/ui/spinner.tsx`
**Props Signature:** `{ size?: 'sm' | 'md' | 'lg' }`

#### `Avatar`

**Path:** `src/components/ui/avatar.tsx` (shadcn/ui base)
**Props Signature:** `{ src?: string; fallback: string; size?: 'sm' | 'md' | 'lg' }` — `fallback` = inisial nama jika `src` gagal load

#### `Checkbox` / `RadioGroup` / `Select` / `Switch`

**Path:** `src/components/ui/{checkbox,radio-group,select,switch}.tsx` (shadcn/ui base)
**Catatan:** Dipakai langsung dari shadcn/ui tanpa kustomisasi signifikan, kecuali mapping warna ke token Design System.

---

### 2.2 MOLECULES

#### `FormField`

**Path:** `src/components/shared/FormField.tsx`
**Props Signature:**

```typescript
interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string; // pesan error dari Zod (via React Hook Form formState.errors)
  required?: boolean;
  hint?: string; // helper text di bawah label
  children: React.ReactNode; // Input/Textarea/Select di dalamnya
}
```

**Komposisi:** `Label` (Atom) + `children` (Input dsb) + error text (Atom Text merah) + hint text
**State Management:** Stateless — murni presentational wrapper untuk field form

#### `StatusBadge`

**Path:** `src/components/shared/StatusBadge.tsx`
**Props Signature:**

```typescript
interface StatusBadgeProps {
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'active'
    | 'claimed'
    | 'published'
    | 'draft';
}
```

**Komposisi:** `Badge` (Atom) dengan mapping otomatis `status` → `variant` + label Bahasa Indonesia:

```
pending → variant 'warning', label "Menunggu"
approved → variant 'success', label "Disetujui"
rejected → variant 'danger', label "Ditolak"
active → variant 'info', label "Aktif"
claimed → variant 'neutral', label "Sudah Diklaim"
published → variant 'success', label "Terbit"
draft → variant 'neutral', label "Draft"
```

**Catatan:** Komponen ini WAJIB dipakai di seluruh modul (Booking, Event, Content, Lost&Found) untuk konsistensi visual status — bukan styling manual per modul.

#### `Toast` (Notification)

**Path:** Menggunakan `react-hot-toast` (existing dependency) — wrapper tipis di `src/components/shared/toast.ts`
**Props Signature:**

```typescript
// Helper functions, bukan komponen React langsung
showSuccessToast(message: string): void;
showErrorToast(message: string): void; // otomatis parsing dari ApiErrorResponse.error.message
```

**State Management:** Global via library `react-hot-toast`, tidak perlu state lokal

#### `SearchBar`

**Path:** `src/components/shared/SearchBar.tsx`
**Props Signature:**

```typescript
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceMs?: number;
}
```

**Komposisi:** `Input` (Atom) + icon search (lucide-react) + debounce internal
**State Management:** Controlled dari parent, debounce logic internal (`useDebouncedCallback`)

#### `Pagination`

**Path:** `src/components/shared/Pagination.tsx`
**Props Signature:**

```typescript
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Catatan:** Konsisten dengan `PaginationMeta` di API_CONTRACT.md Section 1.1 — dipakai di SEMUA tabel/list yang memakai pagination backend.

#### `ConfirmDialog`

**Path:** `src/components/shared/ConfirmDialog.tsx` (dibangun di atas `Dialog` shadcn/ui)
**Props Signature:**

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}
```

**Dipakai di:** Reject booking (wajib alasan — dikombinasi dengan Textarea di dalam dialog), Mark-claimed Lost&Found, Override slug Shortlink, Nonaktifkan user.

---

### 2.3 ORGANISMS

#### `Navbar` (Publik)

**Path:** `src/components/layout/Navbar.tsx` (existing, disesuaikan)
**Props Signature:**

```typescript
interface NavbarProps {
  locale: 'id' | 'en';
  onLocaleChange: (locale: 'id' | 'en') => void;
}
```

**Komposisi:** Logo + menu navigasi + `LanguageSwitcher` (Molecule baru) + responsive hamburger menu (mobile)
**State Management:** `locale` dikontrol dari i18n provider (context), bukan local state

#### `AdminSidebar`

**Path:** `src/components/admin/AdminSidebar.tsx` (existing, disesuaikan RBAC)
**Props Signature:**

```typescript
interface AdminSidebarProps {
  userRole: 'superadmin' | 'admin' | 'biro';
  userPermissions?: Permission[];
}
```

**Komposisi:** List menu item, tiap item punya `requiredRole`/`requiredPermission` — di-filter otomatis sebelum render (lihat ARCHITECTURE.md Section 2.5)
**State Management:** Baca dari `useAuthStore` (Zustand), collapse/expand state lokal (`useState`)

#### `Modal` (Generic Container)

**Path:** `src/components/shared/Modal.tsx` (wrapper `Dialog` shadcn/ui)
**Props Signature:**

```typescript
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode; // slot untuk tombol aksi
}
```

**Dipakai sebagai basis:** Detail booking, form create event, form posting Lost & Found (versi non-fullpage), dll.

#### `DataTable`

**Path:** `src/components/shared/DataTable.tsx`
**Props Signature:**

```typescript
interface DataTableProps<T> {
  columns: {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
}
```

**Komposisi:** Table (shadcn/ui base) + `Pagination` (Molecule) + `Spinner`/skeleton saat loading + empty state
**Dipakai di:** Approval Queue (Room/Item Booking), RSVP Entries list, List User (Superadmin), List Shortlink, List Financial Reports.

#### `CalendarView` (Booking — Public & Admin variant)

**Path:** `src/components/booking/CalendarView.tsx`
**Props Signature:**

```typescript
interface CalendarViewProps {
  month: string; // 'YYYY-MM'
  onMonthChange: (month: string) => void;
  slots: {
    date: string;
    status: 'available' | 'occupied';
    bookingId?: string;
    jamaahName?: string;
  }[];
  variant: 'public' | 'admin'; // 'admin' menampilkan jamaahName saat hover/klik, 'public' tidak
  onDateClick?: (date: string) => void;
}
```

**Catatan Kritis:** Variant `public` TIDAK BOLEH menerima props `jamaahName` sama sekali dari parent (bukan hanya disembunyikan di UI) — parent (Page component) wajib memanggil endpoint publik yang memang tidak mengembalikan field tsb, sesuai NFR-USE-03 di SRS. Ini pencegahan di level data-flow, bukan hanya visual.
**State Management:** Controlled — `month` & `slots` dari parent (TanStack Query)

#### `DateRangePicker`

**Path:** `src/components/shared/DateRangePicker.tsx` (dibangun di atas `Calendar` shadcn/ui + `Popover`)
**Props Signature:**

```typescript
interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  disabledDates?: Date[]; // untuk highlight tanggal occupied dari CalendarView
  minDate?: Date;
}
```

**Dipakai di:** Form Room Booking, Form Item Booking (`borrowDate`–`returnDate`)

#### `FileUploader`

**Path:** `src/components/shared/FileUploader.tsx`
**Props Signature:**

```typescript
interface FileUploaderProps {
  folder: 'lost-found' | 'content' | 'events' | 'gallery'; // diteruskan ke POST /api/upload
  accept?: string; // default: 'image/jpeg,image/png,image/webp'
  maxSizeMB?: number; // default: 5
  value?: string; // URL hasil upload (jika edit existing)
  onUploadComplete: (result: { url: string; key: string }) => void;
  onUploadError: (message: string) => void;
}
```

**Komposisi:** Drag-drop zone + preview image + progress indicator + validasi client-side (ukuran & tipe) SEBELUM request ke `/api/upload` (mirror validasi backend, API_CONTRACT.md Section 11)
**State Management:** Internal `useState` untuk progress/preview, callback ke parent saat selesai

#### `RichTextEditor`

**Path:** `src/components/shared/RichTextEditor.tsx` (wrapper Tiptap — pilihan library, SPRINT_BACKLOG.md Task 6.4)
**Props Signature:**

```typescript
interface RichTextEditorProps {
  value: string; // HTML string
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>; // integrasi FileUploader untuk gambar inline
  placeholder?: string;
}
```

**Catatan:** Output HTML WAJIB melalui sanitasi (mis. `DOMPurify`) sebelum disimpan DAN sebelum di-render di halaman publik (defense-in-depth, sesuai TEST_PLAN.md test case 3.3.12).

#### `EmptyState`

**Path:** `src/components/shared/EmptyState.tsx`
**Props Signature:**

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

**Dipakai di:** SEMUA listing (Lost&Found kosong, Event kosong, Booking history kosong) — WAJIB, sesuai SPRINT_BACKLOG.md Task 6.5.

#### `PermissionGate`

**Path:** `src/components/shared/PermissionGate.tsx`
**Props Signature:**

```typescript
interface PermissionGateProps {
  allowedRoles?: ('superadmin' | 'admin' | 'biro')[];
  requiredPermission?: { module: string; action: string };
  fallback?: React.ReactNode; // default: null (tidak render apa-apa)
  children: React.ReactNode;
}
```

**Fungsi:** Wrapper untuk sembunyikan elemen UI (tombol, menu) berdasarkan role/permission dari `useAuthStore` — mirror logic `withRbac` backend, TAPI ini murni UX (proteksi sungguhan tetap di backend, sesuai catatan ARCHITECTURE.md Section 2.5).
**State Management:** Baca `useAuthStore`, tidak ada state lokal

---

### 2.4 TEMPLATES

#### `AdminDashboardTemplate`

**Path:** `src/components/layout/AdminDashboardTemplate.tsx`
**Props Signature:**

```typescript
interface AdminDashboardTemplateProps {
  title: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

**Komposisi:** `AdminSidebar` + topbar (breadcrumb + actions slot) + content area (`children`)

#### `PublicPageTemplate`

**Path:** `src/components/layout/PublicPageTemplate.tsx`
**Props Signature:**

```typescript
interface PublicPageTemplateProps {
  children: React.ReactNode;
  showHero?: boolean;
  heroTitle?: string;
}
```

**Komposisi:** `Navbar` + optional hero section + `children` + Footer (existing)

#### `FormPageTemplate` (untuk form publik panjang: Room/Item Booking submit)

**Path:** `src/components/layout/FormPageTemplate.tsx`
**Props Signature:**

```typescript
interface FormPageTemplateProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}
```

**Komposisi:** Layout 2-kolom (form utama + sidebar info, mis. kalender ketersediaan di sisi form Room Booking) — collapse jadi 1 kolom di mobile (lihat Section 3.3)

---

## 3. ACCESSIBILITY & RESPONSIVE SPEC

### 3.1 ARIA Attributes — Aturan per Kategori Komponen

| Komponen                                             | ARIA Requirement                                                                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` (icon-only, mis. di `DataTable` row action) | WAJIB `aria-label` deskriptif (mis. `aria-label="Setujui pengajuan"`), tidak boleh icon tanpa label untuk screen reader                                                |
| `Modal`/`ConfirmDialog`                              | Otomatis dari shadcn/ui `Dialog` (Radix UI) — `role="dialog"`, `aria-modal="true"`, focus trap saat terbuka, focus kembali ke trigger element saat ditutup             |
| `FormField` dengan error                             | `Input` terkait WAJIB `aria-invalid="true"` dan `aria-describedby` menunjuk ke id elemen error text saat `error` prop terisi                                           |
| `StatusBadge`                                        | `role="status"` agar screen reader mengumumkan perubahan status (mis. saat admin approve booking dan badge berubah live)                                               |
| `DataTable`                                          | Header kolom pakai elemen `<th scope="col">` (bukan `<div>` yang di-styling menyerupai tabel) — struktur semantic HTML table WAJIB dipakai, bukan div-based table      |
| `Toast`                                              | `react-hot-toast` sudah `aria-live="polite"` secara default — TIDAK perlu kustomisasi tambahan                                                                         |
| `CalendarView`                                       | Setiap sel tanggal WAJIB `aria-label` berisi tanggal + status (mis. `aria-label="12 September, Tersedia"`), TIDAK cukup hanya visual warna (color-blind consideration) |
| `LanguageSwitcher`                                   | `aria-current="true"` pada bahasa yang sedang aktif                                                                                                                    |
| `FileUploader`                                       | Drag-drop zone WAJIB alternatif keyboard-accessible (`<input type="file">` yang bisa di-trigger via keyboard/Enter, bukan hanya drag-drop)                             |

### 3.2 Keyboard Navigation

**Prinsip umum:** Seluruh interactive element (button, link, form field) HARUS bisa diakses & dioperasikan murni via keyboard (Tab, Shift+Tab, Enter, Escape, Arrow keys untuk komponen tertentu) — ini bukan opsional, terutama untuk halaman Admin yang dipakai power-user (pengurus JMMI) secara rutin.

| Komponen                         | Keyboard Behavior                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Modal`/`ConfirmDialog`          | `Escape` menutup modal (kecuali sedang `isLoading`, dicegah agar tidak menutup saat proses submit berjalan); `Tab` terperangkap di dalam modal (focus trap, otomatis dari Radix)           |
| `DataTable`                      | `Tab` berpindah antar row action button; Enter pada row (jika `onRowClick` ada) membuka detail                                                                                             |
| `CalendarView`                   | Arrow keys berpindah antar tanggal, Enter memilih tanggal (mengikuti pola native `Calendar` shadcn/ui berbasis Radix)                                                                      |
| `Select`/`RadioGroup`            | Arrow keys berpindah opsi, Enter/Space memilih (native dari Radix UI, tidak perlu implementasi manual)                                                                                     |
| Form panjang (Room Booking, dll) | Urutan `Tab` mengikuti urutan visual logis field (top-to-bottom), submit button dapat di-trigger via `Enter` dari field terakhir                                                           |
| Skip Navigation                  | Halaman publik WAJIB ada "Skip to main content" link (visually hidden, muncul saat fokus keyboard) di awal `Navbar` — membantu user keyboard/screen-reader melewati menu navigasi berulang |

### 3.3 Breakpoint Behavior (Desktop vs Mobile)

**Breakpoint Tailwind v4 yang dipakai (default, dikonfirmasi konsisten seluruh tim):**

```
sm: 640px   → Mobile besar / small tablet
md: 768px   → Tablet
lg: 1024px  → Desktop kecil / laptop
xl: 1280px  → Desktop standar
```

| Komponen/Layout              | Mobile (< md)                                                                                                                                                             | Desktop (≥ lg)                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Navbar`                     | Hamburger menu, logo + toggle saja terlihat; menu full-screen overlay saat dibuka                                                                                         | Menu horizontal penuh terlihat, tidak ada hamburger          |
| `AdminSidebar`               | Collapsed default (icon-only atau hidden di belakang hamburger), overlay saat dibuka                                                                                      | Expanded default, fixed di sisi kiri, tidak overlay konten   |
| `FormPageTemplate` (2-kolom) | Stack 1 kolom (form dulu, sidebar info di bawah)                                                                                                                          | 2 kolom side-by-side (mis. form 60% : kalender info 40%)     |
| `DataTable`                  | Beralih ke **Card List** (setiap row jadi card vertikal dengan label per field) — TABEL HORIZONTAL TIDAK DIPAKAI di mobile karena rawan overflow horizontal yang buruk UX | Table standar dengan kolom penuh                             |
| `CalendarView`               | Grid kalender tetap tampil tapi ukuran sel diperkecil, kemungkinan scroll horizontal untuk bulan (evaluasi saat implementasi jika terlalu padat)                          | Grid kalender penuh, seluruh minggu terlihat tanpa scroll    |
| `Modal`                      | Full-screen (menutupi seluruh viewport) untuk `size: 'lg'/'xl'`, tetap centered-box untuk `size: 'sm'/'md'`                                                               | Selalu centered-box sesuai `size`, tidak pernah full-screen  |
| Event/Content Listing Grid   | 1 kolom                                                                                                                                                                   | 2-3 kolom grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) |

**Prinsip mobile-first:** Seluruh komponen di-develop dengan base style untuk mobile terlebih dahulu, kemudian ditambah `md:`/`lg:` override — BUKAN sebaliknya (desktop-first lalu di-override untuk mobile), sesuai konvensi Tailwind utility-first.

---

## 4. KOMPONEN YANG SUDAH ADA DI REPO EXISTING (VERIFIKASI SEBELUM BUAT BARU)

Berdasarkan struktur folder dari hasil audit Antigravity (`src/components/`), komponen berikut KEMUNGKINAN sudah ada dan perlu diaudit ulang (Task 6.1) untuk disesuaikan dengan Component Matrix di atas, BUKAN dibuat dari nol:

| Komponen Existing (dugaan dari struktur folder) | Tindakan                                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Tombol (`buttons/`)                             | Audit & migrasikan ke `Button` Atom shadcn/ui-based di atas jika belum konsisten         |
| `layout/` (Navbar, Footer)                      | Sesuaikan dengan `Navbar`/`PublicPageTemplate` di atas, tambahkan `LanguageSwitcher`     |
| Modal (existing, disebut di audit)              | Migrasikan ke `Modal` generic di atas jika implementasi lama tidak berbasis Radix/shadcn |
| Skeleton (existing)                             | Reuse sebagai basis loading state `DataTable` dan halaman lain                           |
| Toast (existing, `react-hot-toast`)             | Reuse langsung, cukup buat wrapper helper seperti di Section 2.2                         |
| Typography (existing)                           | Audit kesesuaian dengan token tipografi Design System (Task 1.1)                         |
| `AdminSidebar.tsx` (existing)                   | Extend dengan RBAC filtering sesuai Section 2.3 di atas — JANGAN buat sidebar baru       |

**Instruksi untuk AI Agent (Antigravity):** Sebelum generate komponen baru dari dokumen ini, WAJIB `view`/scan folder `src/components/` existing terlebih dahulu — cek apakah nama/fungsi serupa sudah ada, dan prioritaskan **refactor/extend** komponen existing dibanding membuat file baru yang duplikatif.

---

## OPEN DECISIONS TAMBAHAN (STATUS: SELURUHNYA TERKUNCI)

| #   | Keputusan Terbuka                       | Status Final                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16  | Chart library untuk Shortlink Analytics | **TERKUNCI** — Recharts, dipakai konsisten untuk seluruh kebutuhan dashboard visualisasi lain (bukan hanya Shortlink).                                                                                                                                                                                                |
| 17  | `CalendarView` di mobile                | **TERKUNCI** — Beralih total ke **Agenda/List View per hari** untuk layar Mobile (< md). **Full Grid View** hanya ditampilkan di Desktop (≥ md). Komponen `CalendarView` di Section 2.3 perlu ditambah prop internal untuk switching mode ini secara otomatis berdasarkan breakpoint (bukan opsi manual dari parent). |

---

_Dokumen ini melengkapi seluruh 9 dokumen teknis inti (`PRD.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_CONTRACT.md`, `CODING_CONVENTIONS.md`, `SPRINT_BACKLOG.md`, `TEST_PLAN.md`, `UI_COMPONENT_MAP.md`) yang telah disepakati. Dokumen opsional tersisa dari documentation map awal: `DESIGN_SYSTEM.md` (template placeholder, menunggu isian tim UI/UX sesuai keputusan awal), `ENV_SETUP.md`, dan `GLOSSARY.md`._

```

```
