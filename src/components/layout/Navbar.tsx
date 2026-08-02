'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import NextImage from '@/components/NextImage';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-white/10 bg-brand-green/80 backdrop-blur-md'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white p-1 shadow-md'>
            <NextImage
              src='/images/logo.png'
              alt='JMMI ITS Logo'
              width={36}
              height={36}
              className='h-8 w-8 object-contain'
            />
          </div>
          <div className='text-left'>
            <span className='block text-base font-bold leading-tight text-white'>
              JMMI ITS
            </span>
            <span className='block text-xs text-white/70'>
              Kabinet Ekselensi 2026
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center gap-8 md:flex'>
          <Link
            href='/'
            className='text-sm font-medium text-white transition-colors hover:text-brand-yellow'
          >
            Beranda
          </Link>
          <Link
            href='/about'
            className='text-sm font-medium text-white/80 transition-colors hover:text-brand-yellow'
          >
            Profil & Visi Misi
          </Link>
          <Link
            href='/kalender'
            className='text-sm font-medium text-white/80 transition-colors hover:text-brand-yellow'
          >
            Agenda Kegiatan
          </Link>
          <Link
            href='/finance'
            className='text-sm font-medium text-white/80 transition-colors hover:text-brand-yellow'
          >
            Transparansi Keuangan
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='inline-flex items-center justify-center rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white md:hidden'
          aria-label='Toggle menu'
        >
          {isOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className='border-b border-white/10 bg-brand-green px-4 pb-6 pt-2 md:hidden'>
          <div className='flex flex-col gap-4'>
            <Link
              href='/'
              onClick={() => setIsOpen(false)}
              className='text-sm font-medium text-white hover:text-brand-yellow'
            >
              Beranda
            </Link>
            <Link
              href='/about'
              onClick={() => setIsOpen(false)}
              className='text-sm font-medium text-white/80 hover:text-brand-yellow'
            >
              Profil & Visi Misi
            </Link>
            <Link
              href='/kalender'
              onClick={() => setIsOpen(false)}
              className='text-sm font-medium text-white/80 hover:text-brand-yellow'
            >
              Agenda Kegiatan
            </Link>
            <Link
              href='/finance'
              onClick={() => setIsOpen(false)}
              className='text-sm font-medium text-white/80 hover:text-brand-yellow'
            >
              Transparansi Keuangan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
