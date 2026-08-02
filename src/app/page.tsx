import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Beranda | Profil Organisasi',
  description:
    'Website resmi Jamaah Masjid Manarul Ilmi ITS Surabaya - Pusat informasi publik, profil organisasi, kegiatan, dan transparansi.',
};

const pillars = [
  {
    title: 'Dakwah & Syiar',
    description:
      'Menyelenggarakan kajian berkala, syiar keislaman, dan pembinaan spiritual bagi civitas akademika ITS.',
    icon: BookOpen,
  },
  {
    title: 'Advokasi & Kepedulian',
    description:
      'Mendampingi mahasiswa dalam pelayanan keumatan, advokasi kesejahteraan, dan kegiatan sosial.',
    icon: HeartHandshake,
  },
  {
    title: 'Tata Kelola Akuntabel',
    description:
      'Prinsip akuntabilitas publik melalui transparansi laporan keuangan dan publikasi informasi kerja.',
    icon: ShieldCheck,
  },
  {
    title: 'Kemitraan & Kaderisasi',
    description:
      'Membangun jejaring dengan LDF, ormawa ITS, alumni, dan membina generasi intelektual muslim.',
    icon: Users,
  },
];

const stats = [
  { label: 'Departemen & BIRO', value: '12+' },
  { label: 'Kader & Pengurus', value: '150+' },
  { label: 'Program Kerja Utama', value: '40+' },
  { label: 'Jamaah Terjangkau', value: '5000+' },
];

const galleryItems = [
  {
    title: 'Kegiatan Masjid & Kajian Rutin',
    category: 'Syiar Islam',
    src: '/images/logo.png',
    desc: 'Pembinaan spiritual & majelis dakwah Manarul Ilmi',
  },
  {
    title: 'Pengabdian Masyarakat & Sosial',
    category: 'Bakti Ummat',
    src: '/images/og.png',
    desc: 'Aksi kepedulian dan tanggap bantuan bagi sesama',
  },
  {
    title: 'Kaderisasi & Outbound Pengurus',
    category: 'Kaderisasi',
    src: '/images/logo.png',
    desc: 'Penguatan kepemimpinan dan soliditas internal',
  },
];

export default function HomePage() {
  return (
    <LinksLayoutWrapper>
      <div className='flex min-h-screen flex-col'>
        <Navbar />

        <main className='relative z-10 flex-1'>
          {/* Hero Section */}
          <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
            <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
              <div className='space-y-6 text-white'>
                <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm'>
                  <Sparkles className='h-4 w-4 text-brand-yellow' />
                  Kabinet Ekselensi 2026
                </div>

                <Typography
                  as='h1'
                  variant='h1'
                  font='marquisette'
                  className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-md'
                >
                  Jamaah Masjid Manarul Ilmi ITS
                </Typography>

                <p className='text-base sm:text-lg text-white/85 leading-relaxed max-w-xl'>
                  Pusat dakwah, pembinaan moral, dan pelayanan publik civitas akademika Institut Teknologi Sepuluh Nopember Surabaya. Progresif, akuntabel, dan berdampak.
                </p>

                <div className='flex flex-wrap gap-4 pt-2'>
                  <Link
                    href='/about'
                    className='inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3.5 text-sm font-semibold text-brand-black transition-all hover:bg-brand-yellow/90 hover:shadow-lg'
                  >
                    Pelajari Profil Organisasi
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                  <Link
                    href='/kalender'
                    className='inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20'
                  >
                    Agenda & Kegiatan
                  </Link>
                </div>
              </div>

              {/* Hero Image Showcase */}
              <div className='relative mx-auto w-full max-w-lg lg:max-w-none'>
                <div className='absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-brand-yellow/20 via-brand-green/30 to-brand-red/20 blur-3xl' />
                <div className='relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md text-white'>
                  <div className='flex flex-col items-center text-center'>
                    <div className='flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/30 bg-white p-4 shadow-xl'>
                      <NextImage
                        src='/images/logo.png'
                        alt='Logo JMMI ITS'
                        width={96}
                        height={96}
                        className='h-20 w-20 object-contain'
                      />
                    </div>
                    <h2 className='mt-5 text-2xl font-bold font-serif text-white'>LDK JMMI ITS</h2>
                    <p className='mt-2 text-sm text-white/80 max-w-sm'>
                      Wadah perjuangan dakwah kampus ITS yang berlandaskan Al-Qur'an dan As-Sunnah.
                    </p>

                    <div className='mt-8 grid w-full grid-cols-2 gap-4 border-t border-white/15 pt-6 text-left'>
                      <div>
                        <span className='text-xs uppercase tracking-wider text-white/60'>Visi Utama</span>
                        <p className='mt-1 text-sm font-semibold text-brand-yellow'>Pusat Syiar & Intelektual</p>
                      </div>
                      <div>
                        <span className='text-xs uppercase tracking-wider text-white/60'>Prinsip Kerja</span>
                        <p className='mt-1 text-sm font-semibold text-brand-yellow'>Inklusif & Akuntabel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className='border-y border-white/15 bg-black/20 backdrop-blur-sm'>
            <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
              <div className='grid grid-cols-2 gap-6 md:grid-cols-4 text-center'>
                {stats.map((stat) => (
                  <div key={stat.label} className='p-2'>
                    <div className='text-3xl sm:text-4xl font-bold text-brand-yellow font-serif'>{stat.value}</div>
                    <div className='mt-1 text-xs sm:text-sm font-medium text-white/80'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pillars Section */}
          <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
            <div className='text-center max-w-3xl mx-auto mb-12 space-y-3'>
              <h2 className='text-3xl font-bold text-white font-serif sm:text-4xl'>Fokus & Pilar Gerakan</h2>
              <p className='text-base text-white/80'>
                Menjalankan peran komprehensif untuk mendukung dakwah kampus dan pelayanan civitas akademika ITS.
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
              {pillars.map((pilar) => {
                const Icon = pilar.icon;
                return (
                  <div
                    key={pilar.title}
                    className='rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-lg backdrop-blur-sm hover:border-white/30 hover:bg-white/15 transition-all'
                  >
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow text-brand-black shadow-md'>
                      <Icon className='h-6 w-6' />
                    </div>
                    <h3 className='mt-5 text-xl font-semibold text-white'>{pilar.title}</h3>
                    <p className='mt-3 text-sm text-white/75 leading-relaxed'>{pilar.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Photo Gallery & Activity Highlights Section */}
          <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 border-t border-white/10'>
            <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4'>
              <div>
                <span className='text-sm font-semibold uppercase tracking-wider text-brand-yellow'>Dokumentasi Organisasi</span>
                <h2 className='mt-2 text-3xl font-bold text-white font-serif sm:text-4xl'>Galeri Kegiatan JMMI</h2>
              </div>
              <Link
                href='/kalender'
                className='inline-flex items-center gap-2 text-sm font-semibold text-brand-yellow hover:underline'
              >
                Lihat Semua Agenda
                <ChevronRight className='h-4 w-4' />
              </Link>
            </div>

            <div className='grid gap-8 md:grid-cols-3'>
              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className='group overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/30'
                >
                  <div className='relative h-48 w-full overflow-hidden bg-black/30 flex items-center justify-center p-6'>
                    <NextImage
                      src={item.src}
                      alt={item.title}
                      width={300}
                      height={200}
                      className='max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105'
                    />
                    <span className='absolute top-3 left-3 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-black shadow-md'>
                      {item.category}
                    </span>
                  </div>
                  <div className='p-6 text-white space-y-2'>
                    <h3 className='text-lg font-semibold text-white group-hover:text-brand-yellow transition-colors'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-white/75 leading-relaxed'>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Access CTA Section */}
          <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
            <div className='relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-brand-green/90 to-black/60 p-8 sm:p-12 shadow-2xl backdrop-blur-md text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8'>
              <div className='space-y-3 max-w-2xl'>
                <h2 className='text-2xl sm:text-3xl font-bold font-serif'>Ingin Mengenal Lebih Dekat JMMI ITS?</h2>
                <p className='text-sm sm:text-base text-white/80 leading-relaxed'>
                  Jelajahi profil organisasi, struktur Visi-Misi Kabinet Ekselensi 2026, serta jadwal kegiatan terbaru di Kampus ITS.
                </p>
              </div>
              <div className='flex flex-wrap gap-4 shrink-0'>
                <Link
                  href='/about'
                  className='rounded-full bg-brand-yellow px-6 py-3.5 text-sm font-bold text-brand-black hover:bg-brand-yellow/90 shadow-xl transition-all hover:scale-105'
                >
                  Profil Organisasi
                </Link>
                <Link
                  href='/kalender'
                  className='rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 backdrop-blur-sm transition-all'
                >
                  Agenda Kegiatan
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </LinksLayoutWrapper>
  );
}