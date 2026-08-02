import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Globe2,
  Instagram,
  Linkedin,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export const metadata: Metadata = {
  title: 'Beranda',
  description:
    'Website resmi JMMI ITS untuk mengenal visi-misi, memantau kegiatan, dan mengakses informasi utama organisasi.',
};

const highlights = [
  {
    title: 'Profil organisasi',
    description:
      'Kenali identitas, arah gerak, dan nilai utama Jamaah Masjid Manarul Ilmi ITS.',
    href: '/about',
    icon: CheckCircle2,
  },
  {
    title: 'Kalender kegiatan',
    description:
      'Lihat agenda publik, kegiatan rutin, dan event JMMI yang sedang berjalan.',
    href: '/kalender',
    icon: CalendarDays,
  },
  {
    title: 'Transparansi keuangan',
    description:
      'Akses ringkasan pengelolaan keuangan untuk memastikan akuntabilitas organisasi.',
    href: '/finance',
    icon: CircleDollarSign,
  },
  {
    title: 'Pusat tautan',
    description:
      'Akses tautan resmi untuk dokumen, layanan, dan informasi terbaru.',
    href: '/links',
    icon: Globe2,
  },
];

const socialLinks = [
  {
    title: 'Instagram',
    href: 'https://www.instagram.com/jmmi.its/',
    icon: Instagram,
  },
  {
    title: 'Google Drive',
    href: 'https://drive.google.com/drive/folders/1XlA28bfRCZKmmMUAnr2VdsXW51M2v-UH?usp=sharing',
    icon: Sparkles,
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/company/jmmi-its/',
    icon: Linkedin,
  },
];

export default function HomePage() {
  return (
    <LinksLayoutWrapper>
      <main className='relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-8'>
        <section className='grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12'>
          <div className='max-w-2xl text-white'>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm'>
              <Sparkles className='h-4 w-4 text-brand-yellow' />
              Jamaah Masjid Manarul Ilmi ITS
            </div>

            <Typography
              as='h1'
              variant='h1'
              font='marquisette'
              className='mt-5 max-w-xl text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]'
            >
              Pusat informasi publik & layanan JMMI ITS.
            </Typography>

            <Typography
              as='p'
              variant='body'
              className='mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg'
            >
              Halaman publik ini menyajikan informasi resmi, profil, agenda kegiatan,
              dan transparansi organisasi Jamaah Masjid Manarul Ilmi ITS.
            </Typography>

            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <Link
                href='/links'
                className='inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-5 py-3 text-sm font-semibold text-brand-black transition-transform hover:-translate-y-0.5 hover:bg-brand-yellow/90'
              >
                Lihat pusat tautan
                <ArrowRight className='h-4 w-4' />
              </Link>
              <Link
                href='/kalender'
                className='inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15'
              >
                Lihat kalender
              </Link>
              <Link
                href='/about'
                className='inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white'
              >
                Tentang JMMI
              </Link>
            </div>

            <div className='mt-8 grid gap-3 sm:grid-cols-3'>
              {[
                'Visi dan misi organisasi',
                'Agenda publik yang terpantau',
                'Informasi resmi dan transparan',
              ].map((item) => (
                <div
                  key={item}
                  className='rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm'
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className='relative mx-auto w-full max-w-xl'>
            <div className='absolute inset-0 rounded-[2rem] bg-gradient-to-br from-brand-yellow/20 via-transparent to-brand-red/20 blur-3xl' />
            <div className='relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-8'>
              <div className='flex flex-col items-center text-center'>
                <div className='flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/90 p-3 shadow-lg'>
                  <NextImage
                    src='/images/logo.png'
                    alt='Logo Jamaah Masjid Manarul Ilmi ITS'
                    width={88}
                    height={88}
                    className='h-20 w-20'
                    useSkeleton
                  />
                </div>

                <Typography
                  as='h2'
                  variant='h5'
                  font='marquisette'
                  className='mt-5 text-white'
                >
                  JMMI ITS
                </Typography>
                <Typography
                  as='p'
                  variant='body'
                  className='mt-2 max-w-sm text-white/80'
                >
                  Kabinet Ekselensi yang bergerak dalam dakwah kampus, advokasi,
                  pengabdian, dan tata kelola yang bertanggung jawab.
                </Typography>

                <div className='mt-6 grid w-full gap-3 sm:grid-cols-2'>
                  <div className='rounded-2xl border border-white/15 bg-black/10 px-4 py-4 text-left text-white'>
                    <div className='text-xs uppercase tracking-[0.2em] text-white/60'>
                      Fokus
                    </div>
                    <div className='mt-1 text-base font-semibold'>Dakwah dan isu keumatan</div>
                  </div>
                  <div className='rounded-2xl border border-white/15 bg-black/10 px-4 py-4 text-left text-white'>
                    <div className='text-xs uppercase tracking-[0.2em] text-white/60'>
                      Arah kerja
                    </div>
                    <div className='mt-1 text-base font-semibold'>Progresif dan akuntabel</div>
                  </div>
                </div>

                <div className='mt-6 w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-white/90'>
                  <div className='inline-flex items-center gap-2 text-sm font-semibold text-brand-yellow'>
                    <CalendarDays className='h-4 w-4' />
                    Akses cepat
                  </div>
                  <div className='mt-3 grid gap-2'>
                    {highlights.slice(0, 2).map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          className='flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 transition-colors hover:bg-black/20'
                        >
                          <Icon className='mt-0.5 h-5 w-5 text-brand-yellow' />
                          <div>
                            <div className='font-semibold text-white'>{item.title}</div>
                            <div className='mt-1 text-sm text-white/75'>{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='pb-10 pt-14 sm:pb-14'>
          <div className='mb-6 flex items-center justify-between gap-4 text-white'>
            <div>
              <Typography as='h2' variant='h6' font='marquisette' className='text-white'>
                Jalur utama
              </Typography>
              <p className='mt-1 text-sm text-white/75'>
                Pilih jalur masuk sesuai kebutuhan informasi.
              </p>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className='group rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-lg backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:bg-white/15'
                >
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <Typography as='h3' variant='h6' font='marquisette' className='mt-4 text-white'>
                    {item.title}
                  </Typography>
                  <p className='mt-2 text-sm leading-relaxed text-white/75'>
                    {item.description}
                  </p>
                  <div className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-yellow'>
                    Buka halaman
                    <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='grid gap-4 pb-10 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-3xl border border-white/15 bg-black/15 p-6 text-white backdrop-blur-sm sm:p-8'>
            <Typography as='h2' variant='h6' font='marquisette' className='text-white'>
              Nilai kerja JMMI
            </Typography>
            <div className='mt-4 space-y-4 text-sm leading-relaxed text-white/80 sm:text-base'>
              <p>
                JMMI dibangun untuk menjadi pusat dakwah dan isu keumatan kampus
                yang matang secara tata kelola, kuat dalam kolaborasi, dan jelas
                dalam dampak program.
              </p>
              <p>
                Dari sini, pengunjung dapat langsung masuk ke profil organisasi,
                memantau agenda publik, dan membuka sumber daya resmi tanpa
                harus mencari halaman yang tersembunyi.
              </p>
            </div>
          </div>

          <div className='rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-sm sm:p-8'>
            <Typography as='h2' variant='h6' font='marquisette' className='text-white'>
              Kanal resmi
            </Typography>
            <div className='mt-4 space-y-3'>
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-white transition-colors hover:bg-black/20'
                  >
                    <span className='inline-flex items-center gap-3 font-medium'>
                      <Icon className='h-5 w-5 text-brand-yellow' />
                      {item.title}
                    </span>
                    <ArrowRight className='h-4 w-4 text-white/60' />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </LinksLayoutWrapper>
  );
}