import Link from 'next/link';
import NextImage from '@/components/NextImage';

export default function Footer() {
  return (
    <footer className='w-full bg-[#146637] text-white py-6 sm:py-8 border-t border-[#146637]/20'>
      <div className='mx-auto max-w-[1312px] px-4 sm:px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Brand Container: Footer Logo + JMMI ITS Text */}
        <Link href='/' className='flex items-center gap-3 group'>
          <div className='flex items-center justify-center shrink-0'>
            <NextImage
              src='/images/footer/logo.png'
              alt='JMMI ITS Footer Logo'
              width={34}
              height={31}
              className='h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105'
            />
          </div>
          <span className='font-sora text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-white'>
            JMMI ITS
          </span>
        </Link>

        {/* Copyright Text */}
        <p className='font-hanken text-sm sm:text-base text-[#E0E2EA] text-center sm:text-right tracking-wide'>
          © {new Date().getFullYear()} JMMI ITS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
