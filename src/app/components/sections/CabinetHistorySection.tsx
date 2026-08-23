'use client';

import * as React from 'react';
import NextImage from '@/components/NextImage';

export interface CabinetItem {
  year: string;
  name: string;
  vision: string;
  logo: string;
}

export const cabinetHistoryData: CabinetItem[] = [
  {
    year: '2026',
    name: 'Kabinet Ekselensi',
    vision:
      'Visi: Terwujudnya JMMI sebagai pusat dakwah dan isu keumatan kampus yang Progresif, Akuntabel, Sistematis, dan Resilien melalui tata kelola yang tepat, serta kajian, advokasi, dan pengabdian berdampak.',
    logo: '/images/cabinet/1.png',
  },
  {
    year: '2025',
    name: 'Kabinet Sinergi',
    vision:
      'Visi: Menjadi Rumah Pengabdian sekaligus Wadah Pengembangan bagi Mahasiswa Muslim ITS yang Harmonis, Responsif, dan Proaktif untuk Mendukung Pengoptimalan Peran Lembaga Dakwah Islam Kampus ITS.',
    logo: '/images/cabinet/2.png',
  },
  {
    year: '2024',
    name: 'Kabinet Eksplorasi',
    vision:
      'Visi: Mewujudkan JMMI yang Harmonis dan Progresif menuju Katalisator Dakwah Islam Kampus ITS.',
    logo: '/images/cabinet/3.png',
  },
  {
    year: '2023',
    name: 'Kabinet Resonansi',
    vision:
      'Visi: Terbentuknya mahasiswa muslim ITS yang beraqidah kuat berlandaskan Islam Ahlusunnah Wal Jama’ah untuk memakmurkan Masjid Manarul Ilmi dalam bingkai semangat Kebangsaan dan Bhinneka Tunggal Ika.',
    logo: '/images/cabinet/4.png',
  },
  {
    year: '2022',
    name: 'Kabinet Ekskalasi',
    vision:
      'Visi: Terbentuknya mahasiswa muslim ITS yang beraqidah kuat berlandaskan Islam Ahlusunnah Wal Jama’ah untuk memakmurkan Masjid Manarul Ilmi dalam bingkai semangat Kebangsaan.',
    logo: '/images/cabinet/5.png',
  },
  {
    year: '2021',
    name: 'Kabinet Inklusi',
    vision:
      'Visi: JMMI ITS sebagai pelopor syiar yang responsif dan kooperatif demi terwujudnya kampus ITS yang rabbani.',
    logo: '/images/cabinet/6.png',
  },
];

export default function CabinetHistorySection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [maxTranslateX, setMaxTranslateX] = React.useState(0);

  React.useEffect(() => {
    const calculateMaxTranslate = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const containerWidth = trackRef.current.parentElement?.clientWidth || window.innerWidth;
        const maxScroll = Math.max(0, trackWidth - containerWidth);
        setMaxTranslateX(maxScroll);
      }
    };

    calculateMaxTranslate();
    window.addEventListener('resize', calculateMaxTranslate);
    return () => window.removeEventListener('resize', calculateMaxTranslate);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far container is scrolled through the viewport
      const totalScrollableDistance = rect.height - windowHeight;
      if (totalScrollableDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /* Pinning Container: sticky track that transforms horizontally as user scrolls vertically */
    <section ref={containerRef} className='relative w-full bg-white h-[280vh]'>
      <div className='sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-[1312px] w-full space-y-10'>
          {/* Section Header */}
          <div className='space-y-3 max-w-2xl'>
            <h2 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight'>
              Sejarah Kabinet JMMI
            </h2>
            <p className='font-hanken text-lg sm:text-xl text-slate-600 leading-relaxed'>
              Menelusuri perjalanan JMMI ITS melalui berbagai kabinet, visi, dan kontribusi dari masa ke masa.
            </p>
          </div>

          {/* Horizontal Scroll Track Driven by Scroll Position */}
          <div className='relative w-full overflow-hidden pt-4 pb-6'>
            <div
              ref={trackRef}
              className='flex gap-8 transition-transform duration-150 ease-out will-change-transform pr-16'
              style={{
                transform: `translateX(-${scrollProgress * maxTranslateX}px)`,
              }}
            >
              {cabinetHistoryData.map((item) => (
                <div
                  key={item.year}
                  className='shrink-0 w-[320px] sm:w-[360px] md:w-[380px] rounded-[25px] border border-gray-100 bg-white shadow-lg overflow-hidden flex flex-col justify-between group hover:shadow-2xl hover:border-[#146637]/40 transition-all duration-300'
                >
                  {/* Top Image Box: Full Logo Cover Container matching Figma */}
                  <div className='relative h-[196px] w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 overflow-hidden'>
                    <NextImage
                      src={item.logo}
                      alt={`${item.name} Logo`}
                      width={360}
                      height={196}
                      className='max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110'
                    />
                    {/* Top Right Year Badge Overlay */}
                    <div className='absolute top-4 right-4 rounded-full bg-[#146637] px-3.5 py-1 text-xs font-mono font-bold text-white shadow-md'>
                      {item.year}
                    </div>
                  </div>

                  {/* Bottom Content Area */}
                  <div className='p-7 space-y-4 flex-1 flex flex-col justify-between'>
                    <div className='space-y-2'>
                      <h3 className='font-hanken text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#146637] transition-colors'>
                        {item.name}
                      </h3>
                      <p className='font-hanken text-sm text-slate-600 leading-relaxed line-clamp-5'>
                        {item.vision}
                      </p>
                    </div>

                    <div className='pt-4 border-t border-gray-100 flex items-center justify-between'>
                      <span className='text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#146637] transition-colors'>
                        JMMI ITS {item.year}
                      </span>
                      <span className='h-2 w-2 rounded-full bg-[#146637] opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
