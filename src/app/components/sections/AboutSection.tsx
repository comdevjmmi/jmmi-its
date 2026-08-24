'use client';

import * as React from 'react';
import NextImage from '@/components/NextImage';

export interface AboutSectionProps {
  aboutTitle?: string;
  aboutText?: string;
  aboutImage?: string;
  visionTitle?: string;
  visionText?: string;
  visionImage?: string;
  bannerHeadline?: string;
}

export default function AboutSection({
  aboutTitle = 'Tentang JMMI',
  aboutText = 'JMMI ITS adalah wadah mahasiswa muslim ITS untuk bertumbuh dalam keislaman, berkarya, dan berkontribusi. Berlandaskan nilai Islam Ahlussunnah wal Jama’ah, JMMI hadir untuk memakmurkan Masjid Manarul Ilmi dan menjadi penggerak kebaikan bagi kampus dan masyarakat.',
  aboutImage = '/images/about/1.JPG',
  visionTitle = 'Visi Kami',
  visionText = 'Terbentuknya wadah mahasiswa muslim ITS yang adaptif dan berlandaskan Islam ahlussunnah wal jama’ah untuk memakmurkan Masjid Manarul Ilmi sebagai penggerak Islam rahmatan lil ‘alamin.',
  visionImage = '/images/about/2.JPG',
  bannerHeadline = 'Harmoni Dakwah dalam Sinergi Peradaban',
}: AboutSectionProps) {
  const [isVisibleRow1, setIsVisibleRow1] = React.useState(false);
  const [isVisibleRow2, setIsVisibleRow2] = React.useState(false);
  const [isVisibleRow3, setIsVisibleRow3] = React.useState(false);

  const row1Ref = React.useRef<HTMLDivElement>(null);
  const row2Ref = React.useRef<HTMLDivElement>(null);
  const row3Ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observerOptions = { threshold: 0.2 };

    const observer1 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisibleRow1(true);
    }, observerOptions);

    const observer2 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisibleRow2(true);
    }, observerOptions);

    const observer3 = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisibleRow3(true);
    }, observerOptions);

    if (row1Ref.current) observer1.observe(row1Ref.current);
    if (row2Ref.current) observer2.observe(row2Ref.current);
    if (row3Ref.current) observer3.observe(row3Ref.current);

    return () => {
      observer1.disconnect();
      observer2.disconnect();
      observer3.disconnect();
    };
  }, []);

  return (
    <section className='relative w-full bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden'>
      <div className='mx-auto max-w-[1312px] space-y-24'>
        {/* Row 1: Tentang JMMI */}
        <div ref={row1Ref} className='grid gap-12 lg:grid-cols-12 items-center'>
          {/* Left Column: Content */}
          <div
            className={`lg:col-span-7 space-y-4 transition-all duration-1000 ease-out ${
              isVisibleRow1
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-12'
            }`}
          >
            <h2 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight'>
              {aboutTitle}
            </h2>
            <p className='font-hanken text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed pt-2'>
              {aboutText}
            </p>
          </div>

          {/* Right Column: Image Card */}
          <div
            className={`lg:col-span-5 transition-all duration-1000 ease-out delay-200 ${
              isVisibleRow1
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 translate-x-12 scale-95'
            }`}
          >
            <div className='relative group overflow-hidden rounded-[25px] border border-gray-100 shadow-xl bg-gray-100 w-full aspect-[4/3]'>
              <NextImage
                src={aboutImage}
                alt={aboutTitle}
                width={600}
                height={450}
                className='h-full w-full'
                classNames={{
                  image: 'h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105',
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </div>
        </div>

        {/* Row 2: Visi Kami (Reversed Layout) */}
        <div ref={row2Ref} className='grid gap-12 lg:grid-cols-12 items-center'>
          {/* Left Column: Image Card */}
          <div
            className={`lg:col-span-5 order-2 lg:order-1 transition-all duration-1000 ease-out delay-200 ${
              isVisibleRow2
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-0 -translate-x-12 scale-95'
            }`}
          >
            <div className='relative group overflow-hidden rounded-[25px] border border-gray-100 shadow-xl bg-gray-100 w-full aspect-[4/3]'>
              <NextImage
                src={visionImage}
                alt={visionTitle}
                width={600}
                height={450}
                className='h-full w-full'
                classNames={{
                  image: 'h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105',
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
          </div>

          {/* Right Column: Content */}
          <div
            className={`lg:col-span-7 order-1 lg:order-2 space-y-4 transition-all duration-1000 ease-out ${
              isVisibleRow2
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            <h2 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight'>
              {visionTitle}
            </h2>
            <p className='font-hanken text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed pt-2'>
              {visionText}
            </p>
          </div>
        </div>

        {/* Row 3: Headline Banner */}
        <div
          ref={row3Ref}
          className={`pt-8 text-center transition-all duration-1000 ease-out ${
            isVisibleRow3
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          <div className='relative inline-block rounded-3xl bg-gradient-to-r from-[#146637]/10 via-[#146637]/5 to-[#146637]/10 px-8 py-10 sm:px-16 sm:py-14 border border-[#146637]/15 shadow-sm'>
            <h3 className='font-sora text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#146637] tracking-tight leading-tight'>
              "{bannerHeadline}"
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
