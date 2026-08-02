import Link from 'next/link';
import { Instagram, Linkedin, Mail, MapPin, Globe } from 'lucide-react';
import NextImage from '@/components/NextImage';

export default function Footer() {
  return (
    <footer className='border-t border-white/10 bg-black/40 text-white/80 backdrop-blur-md'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid gap-8 lg:grid-cols-4'>
          {/* Brand Info */}
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white p-1 shadow-md'>
                <NextImage
                  src='/images/logo.png'
                  alt='JMMI ITS Logo'
                  width={36}
                  height={36}
                  className='h-8 w-8 object-contain'
                />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>Jamaah Masjid Manarul Ilmi ITS</h3>
                <p className='text-xs text-white/60'>Kabinet Ekselensi 2026</p>
              </div>
            </div>
            <p className='max-w-md text-sm text-white/75 leading-relaxed'>
              Lembaga Dakwah Kampus (LDK) ITS Surabaya yang berkomitmen menghadirkan dakwah Islam yang inklusif, progresif, akuntabel, dan berdampak nyata bagi seluruh civitas akademika.
            </p>
            <div className='flex gap-4 pt-2'>
              <a
                href='https://www.instagram.com/jmmi.its/'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-yellow hover:text-brand-black transition-colors'
                aria-label='Instagram'
              >
                <Instagram className='h-4 w-4' />
              </a>
              <a
                href='https://www.linkedin.com/company/jmmi-its/'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-yellow hover:text-brand-black transition-colors'
                aria-label='LinkedIn'
              >
                <Linkedin className='h-4 w-4' />
              </a>
              <a
                href='https://drive.google.com/drive/folders/1XlA28bfRCZKmmMUAnr2VdsXW51M2v-UH?usp=sharing'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-yellow hover:text-brand-black transition-colors'
                aria-label='Google Drive'
              >
                <Globe className='h-4 w-4' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-3'>
            <h4 className='text-sm font-semibold uppercase tracking-wider text-brand-yellow'>Navigasi Halaman</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/' className='hover:text-white transition-colors'>Beranda Utama</Link>
              </li>
              <li>
                <Link href='/about' className='hover:text-white transition-colors'>Profil & Visi Misi</Link>
              </li>
              <li>
                <Link href='/kalender' className='hover:text-white transition-colors'>Kalender Kegiatan</Link>
              </li>
              <li>
                <Link href='/finance' className='hover:text-white transition-colors'>Transparansi Keuangan</Link>
              </li>
            </ul>
          </div>

          {/* Contact / Location */}
          <div className='space-y-3'>
            <h4 className='text-sm font-semibold uppercase tracking-wider text-brand-yellow'>Sekretariat</h4>
            <div className='space-y-2 text-sm text-white/75'>
              <div className='flex items-start gap-2.5'>
                <MapPin className='h-4 w-4 shrink-0 text-brand-yellow mt-0.5' />
                <span>Masjid Manarul Ilmi, Kampus ITS Sukolilo, Surabaya, Jawa Timur 60111</span>
              </div>
              <div className='flex items-center gap-2.5'>
                <Mail className='h-4 w-4 shrink-0 text-brand-yellow' />
                <span>jmmi@its.ac.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/60'>
          © {new Date().getFullYear()} Jamaah Masjid Manarul Ilmi ITS (JMMI ITS). All rights reserved.
        </div>
      </div>
    </footer>
  );
}
