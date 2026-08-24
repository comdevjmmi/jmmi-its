# DESIGN_SYSTEM.md

## Platform Website Terpadu JMMI ITS — Design System

**Versi:** 0.1 (TEMPLATE — BELUM DIISI)
**Status:** ⚠️ PLACEHOLDER — Struktur ini WAJIB diisi lengkap oleh Tim UI/UX (UI1, UI2) sebelum dipakai sebagai referensi final oleh Frontend
**Referensi:** SPRINT_BACKLOG.md Task 1.1 (Design System Foundation), Task 7.1 (Finalisasi)
**Tech Stack Target:** Tailwind CSS v4 (CSS Variables), shadcn/ui

---

## ⚠️ INSTRUKSI PENGISIAN — BACA SEBELUM MENGISI DOKUMEN INI

Dokumen ini adalah **kerangka kosong**, bukan dokumen final. Setiap section di bawah berisi placeholder yang WAJIB diganti dengan nilai definitif hasil kerja Tim UI/UX di Figma (`JMMI-ITS Design System v1`, SPRINT_BACKLOG.md Task 1.1).

**Aturan wajib saat mengisi tiap token:**

1. **Sertakan hex code eksak** untuk setiap warna (mis. `#1E3A5F`) — jangan hanya nama warna ("biru tua") tanpa nilai presisi.
2. **Sertakan nama token Tailwind** yang akan dipakai di kode (mis. `--color-primary-600` atau `primary-600` sesuai konvensi Tailwind v4 CSS Variables) — ini yang akan langsung di-mapping FE ke `tailwind.config.ts`/CSS variable, sesuai ARCHITECTURE.md → SPRINT_BACKLOG.md Task 1.3.
3. **Sertakan contoh penggunaan** (di komponen/konteks apa token ini dipakai) — mis. "Primary 600 dipakai untuk background tombol utama (`Button variant='primary'`), bukan untuk teks body."
4. **Jangan hapus struktur tabel/section** yang sudah ada — isi kolom yang kosong, tambah baris jika perlu, tapi pertahankan format agar mudah di-parse FE/AI Agent.
5. Setelah SELURUH section terisi, ubah **Versi** di header dari `0.1 (TEMPLATE)` menjadi `1.0` dan hapus label ⚠️ PLACEHOLDER dari Status.
6. Jika ada token yang sengaja TIDAK dipakai proyek ini (mis. tidak butuh warna `accent` terpisah), tulis eksplisit `"Tidak dipakai di v1"` — JANGAN biarkan kosong tanpa keterangan (kosong tanpa keterangan akan diasumsikan AI Agent sebagai "belum diisi", bukan "sengaja tidak dipakai").

---

## 1. COLORS

### 1.1 Primary

| Shade       | Hex Code  | Token Tailwind        | Contoh Penggunaan                                 |
| ----------- | --------- | --------------------- | ------------------------------------------------- |
| Primary 50  | `#______` | `--color-primary-50`  | _(isi: mis. background hover state ringan)_       |
| Primary 100 | `#______` | `--color-primary-100` |                                                   |
| Primary 300 | `#______` | `--color-primary-300` |                                                   |
| Primary 500 | `#______` | `--color-primary-500` | _(isi: warna primary "default"/dasar)_            |
| Primary 600 | `#______` | `--color-primary-600` | _(isi: mis. Button variant='primary' background)_ |
| Primary 700 | `#______` | `--color-primary-700` | _(isi: mis. hover/active state Button primary)_   |
| Primary 900 | `#______` | `--color-primary-900` |                                                   |

### 1.2 Secondary

| Shade         | Hex Code  | Token Tailwind          | Contoh Penggunaan                        |
| ------------- | --------- | ----------------------- | ---------------------------------------- |
| Secondary 50  | `#______` | `--color-secondary-50`  |                                          |
| Secondary 500 | `#______` | `--color-secondary-500` |                                          |
| Secondary 600 | `#______` | `--color-secondary-600` | _(isi: mis. Button variant='secondary')_ |
| Secondary 700 | `#______` | `--color-secondary-700` |                                          |

### 1.3 Accent

| Shade      | Hex Code  | Token Tailwind       | Contoh Penggunaan                                                 |
| ---------- | --------- | -------------------- | ----------------------------------------------------------------- |
| Accent 500 | `#______` | `--color-accent-500` | _(isi: mis. highlight badge "Perlu Daftar" di kalender gabungan)_ |
| Accent 600 | `#______` | `--color-accent-600` |                                                                   |

### 1.4 Semantic Colors (Status)

| Nama         | Hex Code  | Token Tailwind    | Contoh Penggunaan                                 |
| ------------ | --------- | ----------------- | ------------------------------------------------- |
| Success      | `#______` | `--color-success` | `StatusBadge` status `approved`/`published`       |
| Warning      | `#______` | `--color-warning` | `StatusBadge` status `pending`                    |
| Danger/Error | `#______` | `--color-danger`  | `StatusBadge` status `rejected`, pesan error form |
| Info         | `#______` | `--color-info`    | `StatusBadge` status `active`                     |
| Neutral      | `#______` | `--color-neutral` | `StatusBadge` status `claimed`/`draft`            |

### 1.5 Background

| Nama               | Hex Code  | Token Tailwind       | Contoh Penggunaan                              |
| ------------------ | --------- | -------------------- | ---------------------------------------------- |
| Background Base    | `#______` | `--color-bg-base`    | Latar belakang halaman utama                   |
| Background Surface | `#______` | `--color-bg-surface` | Latar belakang Card/Modal/DataTable            |
| Background Muted   | `#______` | `--color-bg-muted`   | Latar belakang section sekunder (mis. sidebar) |

### 1.6 Text

| Nama            | Hex Code  | Token Tailwind            | Contoh Penggunaan                                   |
| --------------- | --------- | ------------------------- | --------------------------------------------------- |
| Text Primary    | `#______` | `--color-text-primary`    | Heading, body text utama                            |
| Text Secondary  | `#______` | `--color-text-secondary`  | Caption, helper text, `FormField` hint              |
| Text Disabled   | `#______` | `--color-text-disabled`   | Teks pada elemen disabled                           |
| Text on Primary | `#______` | `--color-text-on-primary` | Teks di atas background primary (mis. label tombol) |

---

## 2. TYPOGRAPHY

### 2.1 Font Family

| Peran                                               | Nama Font               | Token Tailwind   | Fallback Stack       |
| --------------------------------------------------- | ----------------------- | ---------------- | -------------------- |
| Heading                                             | _(isi: mis. "Poppins")_ | `--font-heading` | `______, sans-serif` |
| Body                                                | _(isi: mis. "Inter")_   | `--font-body`    | `______, sans-serif` |
| Monospace (jika perlu, mis. untuk kode/angka tabel) | _(isi jika ada)_        | `--font-mono`    | `______, monospace`  |

> **Catatan:** Jika font dipilih dari Google Fonts, sertakan juga link/import statement yang harus ditambahkan FE ke `layout.tsx`.

### 2.2 Font Sizes & Line Heights

| Token      | Ukuran (px/rem)  | Line Height | Token Tailwind      | Contoh Penggunaan       |
| ---------- | ---------------- | ----------- | ------------------- | ----------------------- |
| Display    | `___px / ___rem` | `___`       | `text-display`      | Hero title landing page |
| H1         | `___px / ___rem` | `___`       | `text-h1`           | Judul halaman utama     |
| H2         | `___px / ___rem` | `___`       | `text-h2`           | Judul section           |
| H3         | `___px / ___rem` | `___`       | `text-h3`           | Sub-judul, judul card   |
| H4         | `___px / ___rem` | `___`       | `text-h4`           |                         |
| H5/H6      | `___px / ___rem` | `___`       | `text-h5`/`text-h6` |                         |
| Body Large | `___px / ___rem` | `___`       | `text-body-lg`      | Paragraf penting/intro  |
| Body Base  | `___px / ___rem` | `___`       | `text-body`         | Paragraf default        |
| Body Small | `___px / ___rem` | `___`       | `text-body-sm`      | Caption, metadata       |
| Caption    | `___px / ___rem` | `___`       | `text-caption`      | Label kecil, timestamp  |

### 2.3 Font Weights

| Nama     | Nilai | Token Tailwind  | Contoh Penggunaan           |
| -------- | ----- | --------------- | --------------------------- |
| Regular  | `400` | `font-normal`   | Body text default           |
| Medium   | `500` | `font-medium`   | Label form, emphasis ringan |
| Semibold | `600` | `font-semibold` | Sub-heading, button text    |
| Bold     | `700` | `font-bold`     | Heading utama               |

---

## 3. SPACING / SIZING

### 3.1 Spacing Scale

| Token    | Nilai (px/rem)   | Token Tailwind                                                                      | Contoh Penggunaan                         |
| -------- | ---------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| Space 1  | `4px / 0.25rem`  | `p-1`/`gap-1` (default Tailwind — konfirmasi apakah dipakai apa adanya atau custom) | Padding elemen sangat kecil (icon button) |
| Space 2  | `8px / 0.5rem`   | `p-2`/`gap-2`                                                                       | Gap antar elemen dalam Molecule           |
| Space 3  | `12px / 0.75rem` | `p-3`/`gap-3`                                                                       |                                           |
| Space 4  | `16px / 1rem`    | `p-4`/`gap-4`                                                                       | Padding Card/Modal standar                |
| Space 6  | `24px / 1.5rem`  | `p-6`/`gap-6`                                                                       | Padding section                           |
| Space 8  | `32px / 2rem`    | `p-8`/`gap-8`                                                                       | Margin antar section besar                |
| Space 12 | `48px / 3rem`    | `p-12`/`gap-12`                                                                     | Margin section hero/landing               |

> **Catatan:** Isi apakah tim UI/UX memakai skala default Tailwind v4 apa adanya, atau ada override custom (mis. skala 4px vs 8px sebagai basis) — WAJIB dikonfirmasi eksplisit agar FE tidak menebak.

### 3.2 Container & Layout Sizing

| Token                            | Nilai    | Token Tailwind | Contoh Penggunaan                    |
| -------------------------------- | -------- | -------------- | ------------------------------------ |
| Container Max Width (Desktop)    | `____px` | `max-w-____`   | Lebar maksimum konten halaman publik |
| Container Padding (Mobile)       | `____px` | `px-____`      | Padding horizontal halaman di mobile |
| Sidebar Width (Admin, Expanded)  | `____px` | `w-____`       | `AdminSidebar` state expanded        |
| Sidebar Width (Admin, Collapsed) | `____px` | `w-____`       | `AdminSidebar` state collapsed       |

---

## 4. BORDER RADIUS

| Token        | Nilai (px/rem) | Token Tailwind | Contoh Penggunaan               |
| ------------ | -------------- | -------------- | ------------------------------- |
| Radius None  | `0px`          | `rounded-none` | Elemen yang sengaja tegas/kotak |
| Radius Small | `___px`        | `rounded-sm`   | Input, Badge kecil              |
| Radius Base  | `___px`        | `rounded`      | Button, Card standar            |
| Radius Large | `___px`        | `rounded-lg`   | Modal, Card besar               |
| Radius Full  | `9999px`       | `rounded-full` | Avatar, Badge pill-shape        |

---

## 5. ELEVATION / SHADOWS

| Token             | CSS box-shadow value                                                | Token Tailwind     | Contoh Penggunaan                                                                        |
| ----------------- | ------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Shadow None       | `none`                                                              | `shadow-none`      | Elemen flat/inline                                                                       |
| Shadow Small      | `___________`                                                       | `shadow-sm`        | Card list item, `FormField` fokus ringan                                                 |
| Shadow Base       | `___________`                                                       | `shadow`           | Card standar, Dropdown                                                                   |
| Shadow Medium     | `___________`                                                       | `shadow-md`        | `Modal`/`ConfirmDialog`                                                                  |
| Shadow Large      | `___________`                                                       | `shadow-lg`        | Popover/Tooltip mengambang                                                               |
| Shadow Focus Ring | `___________` (WAJIB sertakan warna ring, mis. terkait Primary 500) | `ring-2 ring-____` | Focus state Input/Button — krusial untuk accessibility (UI_COMPONENT_MAP.md Section 3.1) |

---

## 6. BREAKPOINTS

Sesuai UI_COMPONENT_MAP.md Section 3.3 — breakpoint SUDAH dikunci mengikuti default Tailwind v4, dokumentasikan ulang di sini untuk referensi cepat tim UI/UX saat mendesain di Figma (samakan frame size):

| Breakpoint    | Lebar Minimum | Token Tailwind             | Konteks Desain di Figma                                                                                                                   |
| ------------- | ------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile (base) | `0px`         | _(tanpa prefix — default)_ | Frame Figma: `375px` (iPhone standar) sebagai basis mobile-first                                                                          |
| `sm`          | `640px`       | `sm:`                      | Frame Figma: `640px` (mobile besar/small tablet)                                                                                          |
| `md`          | `768px`       | `md:`                      | Frame Figma: `768px` (tablet) — **breakpoint kunci untuk switch `CalendarView` Agenda↔Grid, lihat UI_COMPONENT_MAP.md Open Decision #17** |
| `lg`          | `1024px`      | `lg:`                      | Frame Figma: `1024px` (desktop kecil/laptop)                                                                                              |
| `xl`          | `1280px`      | `xl:`                      | Frame Figma: `1280px` (desktop standar) — disarankan sebagai frame utama desain halaman publik                                            |

> **Tidak perlu diisi ulang** — breakpoint ini sudah final/terkunci di dokumen lain. Section ini murni referensi silang agar tim UI/UX mendesain frame Figma dengan lebar yang PERSIS sama dengan breakpoint kode, menghindari mismatch implementasi FE.

---

## 7. ICON SET

_(Section tambahan — isi jika belum tercakup di section lain)_

| Aspek                 | Nilai                                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| Library Icon          | _(isi: konfirmasi tetap `lucide-react` — existing dependency — atau ganti?)_ |
| Ukuran Default Icon   | `___px`                                                                      |
| Ukuran Icon di Button | `___px`                                                                      |
| Stroke Width Default  | `___`                                                                        |

---

## CHECKLIST FINALISASI (Isi Sebelum Mengubah Status Dokumen ke 1.0)

- [ ] Seluruh section Colors (1.1–1.6) terisi hex code + token Tailwind + contoh penggunaan
- [ ] Seluruh section Typography (2.1–2.3) terisi, termasuk keputusan font family final
- [ ] Seluruh section Spacing (3.1–3.2) terisi, termasuk konfirmasi skala custom vs default Tailwind
- [ ] Seluruh section Border Radius (4) terisi
- [ ] Seluruh section Elevation/Shadow (5) terisi, termasuk warna focus ring untuk accessibility
- [ ] Section Breakpoints (6) sudah direview cocok dengan frame Figma yang dipakai
- [ ] Section Icon Set (7) terisi
- [ ] Token warna sudah diverifikasi memenuhi kontras minimum WCAG AA (khususnya `Text Primary` di atas `Background Base`, dan `Text on Primary` di atas `Primary 600`) — relevan dengan ARIA/accessibility requirement di UI_COMPONENT_MAP.md Section 3.1
- [ ] File Figma `JMMI-ITS Design System v1` sudah sinkron 100% dengan nilai di dokumen ini (tidak ada token di Figma yang belum masuk sini, atau sebaliknya)
- [ ] Versi dokumen diubah dari `0.1 (TEMPLATE)` → `1.0`, label ⚠️ PLACEHOLDER dihapus dari Status

---
