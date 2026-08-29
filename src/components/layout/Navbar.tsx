'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import NextImage from '@/components/NextImage';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/finance', label: 'Transparansi Keuangan' },
  { href: '/kalender', label: 'Kalender' },
  { href: '/contact', label: 'Kontak' },
  { href: '/j-fest', label: 'J-Fest', isCustomColor: true, color: '#4320B2' },
  { href: 'https://jmmicup2026.vercel.app/', label: 'JMMI Cup', isExternal: true, isCustomColor: true, color: '#4320B2' },
  { href: 'https://shuttle.jmmi-its.com/', label: 'Shuttle', isExternal: true },
  { href: 'https://www.rdk-its.com/', label: 'RDK', isExternal: true, isCustomColor: true, color: '#9e2a2f' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className='sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 text-slate-800 shadow-sm backdrop-blur-md transition-all'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 lg:px-16'>
        {/* Brand Container: Logo + JMMI ITS Text */}
        <Link href='/' className='flex items-center gap-3 group'>
          <div className='flex items-center justify-center shrink-0'>
            <NextImage
              src='/images/navbar/logo.png'
              alt='JMMI ITS Logo'
              width={34}
              height={31}
              className='h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105'
            />
          </div>
          <span className='font-sora text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-[#146637]'>
            JMMI ITS
          </span>
        </Link>

        {/* Desktop Navigation Links with Underline Hover Animation */}
        <nav className='hidden items-center gap-5 lg:gap-7 md:flex'>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkColor = link.isCustomColor ? link.color : '#146637';

            if (link.isExternal) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: link.isCustomColor ? linkColor : undefined }}
                  className='group relative py-1 font-hanken text-base font-normal hover:opacity-80 transition-colors duration-200'
                >
                  <span>{link.label}</span>
                  <span
                    style={{ backgroundColor: linkColor }}
                    className='absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 ease-out group-hover:w-full'
                  />
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: isActive || link.isCustomColor ? linkColor : undefined }}
                className={`group relative py-1 font-hanken text-base transition-colors duration-200 ${
                  isActive
                    ? 'font-bold'
                    : 'font-normal text-[#494456]'
                } ${link.isCustomColor ? 'font-bold font-sora hover:opacity-80' : 'hover:text-[#146637]'}`}
              >
                <span>{link.label}</span>
                {/* Animated Line Indicator */}
                <span
                  style={{ backgroundColor: linkColor }}
                  className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ease-out ${
                    isActive
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button: Masuk */}
        <div className='hidden items-center md:flex'>
          <Link
            href='/login'
            className='inline-flex items-center justify-center rounded-full bg-[#146637] px-6 py-2 font-sora text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#0e4a28] hover:shadow-lg active:scale-95'
          >
            Masuk
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='inline-flex items-center justify-center rounded-lg p-2 text-[#146637] transition-colors hover:bg-[#146637]/10 md:hidden'
          aria-label='Toggle menu'
        >
          {isOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className='border-t border-gray-200/60 bg-white/95 px-6 pb-6 pt-4 shadow-xl backdrop-blur-lg md:hidden animate-in slide-in-from-top-2'>
          <div className='flex flex-col gap-4'>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const linkColor = link.isCustomColor ? link.color : '#146637';

              if (link.isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: link.isCustomColor ? linkColor : undefined,
                    }}
                    className='relative font-hanken text-base font-normal px-3 py-2 rounded-lg hover:bg-gray-100/80 transition-colors'
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: link.isCustomColor ? linkColor : undefined,
                    backgroundColor: isActive ? (link.isCustomColor ? `${linkColor}15` : '#14663715') : undefined,
                  }}
                  className={`relative font-hanken text-base transition-colors px-3 py-2 rounded-lg ${
                    isActive
                      ? 'font-bold'
                      : link.isCustomColor
                      ? 'font-bold font-sora'
                      : 'font-normal text-[#494456] hover:text-[#146637] hover:bg-gray-100/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className='pt-2 border-t border-gray-100'>
              <Link
                href='/login'
                onClick={() => setIsOpen(false)}
                className='flex w-full items-center justify-center rounded-full bg-[#146637] py-2.5 font-sora text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#0e4a28]'
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
