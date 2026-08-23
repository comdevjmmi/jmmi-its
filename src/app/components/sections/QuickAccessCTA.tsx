import * as React from 'react';
import Link from 'next/link';

export interface QuickAccessCTAProps {
  title?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnUrl?: string;
}

export default function QuickAccessCTA({
  title = 'Ingin Mengenal Lebih Dekat JMMI ITS?',
  description = 'Jelajahi profil organisasi, struktur Visi-Misi Kabinet Ekselensi 2026, serta jadwal kegiatan terbaru di Kampus ITS.',
  primaryBtnText = 'Profil Organisasi',
  primaryBtnUrl = '/about',
  secondaryBtnText = 'Agenda Kegiatan',
  secondaryBtnUrl = '/kalender',
}: QuickAccessCTAProps) {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
      <div className='relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-r from-[#146637] to-emerald-900 p-8 sm:p-12 shadow-2xl text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8'>
        <div className='space-y-3 max-w-2xl'>
          <h2 className='text-2xl sm:text-3xl font-bold font-serif'>{title}</h2>
          <p className='text-sm sm:text-base text-white/90 leading-relaxed'>
            {description}
          </p>
        </div>
        <div className='flex flex-wrap gap-4 shrink-0'>
          <Link
            href={primaryBtnUrl}
            className='rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#146637] hover:bg-gray-100 shadow-xl transition-all hover:scale-105'
          >
            {primaryBtnText}
          </Link>
          <Link
            href={secondaryBtnUrl}
            className='rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 backdrop-blur-sm transition-all'
          >
            {secondaryBtnText}
          </Link>
        </div>
      </div>
    </section>
  );
}
