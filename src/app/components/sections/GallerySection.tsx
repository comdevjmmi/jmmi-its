import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import NextImage from '@/components/NextImage';

export interface GalleryItem {
  title: string;
  category: string;
  src: string;
  desc: string;
}

interface GallerySectionProps {
  items?: GalleryItem[];
}

const defaultItems: GalleryItem[] = [
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

export default function GallerySection({ items = defaultItems }: GallerySectionProps) {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 border-t border-gray-100'>
      <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4'>
        <div>
          <span className='text-sm font-semibold uppercase tracking-wider text-[#146637]'>
            Dokumentasi Organisasi
          </span>
          <h2 className='mt-2 text-3xl font-bold text-slate-900 font-serif sm:text-4xl'>
            Galeri Kegiatan JMMI
          </h2>
        </div>
        <Link
          href='/kalender'
          className='inline-flex items-center gap-2 text-sm font-semibold text-[#146637] hover:underline'
        >
          Lihat Semua Agenda
          <ChevronRight className='h-4 w-4' />
        </Link>
      </div>

      <div className='grid gap-8 md:grid-cols-3'>
        {items.map((item, idx) => (
          <div
            key={idx}
            className='group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl'
          >
            <div className='relative h-48 w-full overflow-hidden bg-gray-50 flex items-center justify-center p-6'>
              <NextImage
                src={item.src}
                alt={item.title}
                width={300}
                height={200}
                className='max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105'
              />
              <span className='absolute top-3 left-3 rounded-full bg-[#146637] px-3 py-1 text-xs font-bold text-white shadow-md'>
                {item.category}
              </span>
            </div>
            <div className='p-6 text-slate-800 space-y-2'>
              <h3 className='text-lg font-semibold text-slate-900 group-hover:text-[#146637] transition-colors'>
                {item.title}
              </h3>
              <p className='text-xs text-slate-600 leading-relaxed'>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
