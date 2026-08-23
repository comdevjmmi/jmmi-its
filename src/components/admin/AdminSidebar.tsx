'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  Link2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Settings2,
  X,
} from 'lucide-react';

import Button from '@/components/buttons/Button';
import { cn } from '@/lib/utils';

type AdminMenuItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const menuItems: AdminMenuItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    description: 'Ringkasan overview dan event reminder',
    icon: BarChart3,
  },
  {
    label: 'Keuangan',
    href: '/admin/keuangan',
    description: 'Manajemen transaksi dan laporan saldo',
    icon: BarChart3,
  },
  {
    label: 'Link',
    href: '/admin/links',
    description: 'Kategori, folder, dan sumber daya',
    icon: Link2,
  },
  {
    label: 'Shorten Link',
    href: '/admin/shortlinks',
    description: 'URL shortener mandiri',
    icon: Link2,
  },

  {
    label: 'Kalender',
    href: '/admin/kalender',
    description: 'Agenda dan tenggat yang akan datang',
    icon: CalendarDays,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    description: 'Preferensi panel dan kontrol akses',
    icon: Settings2,
    disabled: true,
  },
];

type AdminSidebarProps = {
  userName?: string;
  onLogout: () => void;
};

export default function AdminSidebar({ userName, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedCollapsed = window.localStorage.getItem('admin-sidebar-collapsed');
    if (storedCollapsed) {
      setIsCollapsed(storedCollapsed === 'true');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      'admin-sidebar-collapsed',
      String(isCollapsed)
    );
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const renderNavigation = (collapsed: boolean, onNavigate?: () => void) => {
    return (
      <nav className='space-y-2'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className={cn(
                  'cursor-not-allowed rounded-2xl border border-dashed border-white/10 bg-white/5 opacity-70',
                  collapsed ? 'px-2 py-3' : 'px-4 py-3'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center',
                    collapsed ? 'justify-center gap-0' : 'gap-3'
                  )}
                >
                  <div className='rounded-xl bg-white/10 p-2 text-white/70'>
                    <Icon className='h-4 w-4' />
                  </div>
                  {!collapsed && (
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-white'>{item.label}</p>
                        <span className='rounded-full bg-brand-yellow/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-black'>
                          Segera
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              onClick={onNavigate}
              className={cn(
                'block rounded-2xl border transition-all duration-200',
                collapsed ? 'px-2 py-3' : 'px-4 py-3',
                isActive
                  ? 'border-brand-yellow/40 bg-brand-yellow/20 text-white shadow-[0_0_0_1px_rgba(245,186,110,0.22)]'
                  : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center',
                  collapsed ? 'justify-center gap-0' : 'gap-3'
                )}
              >
                <div
                  className={cn(
                    'rounded-xl p-2',
                    isActive
                      ? 'bg-brand-yellow/30 text-white'
                      : 'bg-white/10 text-white/75'
                  )}
                >
                  <Icon className='h-4 w-4' />
                </div>
                {!collapsed && (
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium'>{item.label}</p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      <div className='sticky top-0 z-30 flex items-center justify-between border-b border-[#146637] bg-[#146637] px-4 py-3 text-white lg:hidden shadow-md'>
        <div className='flex items-center gap-3'>
          <Image src='/images/footer/logo.png' alt='JMMI Logo' width={28} height={28} className='h-7 w-auto object-contain' />
          <span className='font-sora text-base font-extrabold tracking-tight'>JMMI Admin</span>
        </div>

        <Button
          type='button'
          variant='ghost'
          onClick={() => setIsMobileOpen(true)}
          className='h-9 w-9 border-white/20 bg-white/10 p-0 text-white hover:bg-white/20'
          aria-label='Buka menu'
        >
          <Menu className='h-4 w-4' />
        </Button>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <button
          type='button'
          aria-label='Tutup menu'
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity',
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />

        <aside
          className={cn(
            'relative flex h-full w-[82vw] max-w-80 flex-col border-r border-[#146637] bg-[#146637] text-white transition-transform duration-300 ease-out shadow-2xl',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className='flex items-center justify-between border-b border-white/15 px-5 py-4'>
            <div className='flex items-center gap-3'>
              <Image src='/images/footer/logo.png' alt='JMMI Logo' width={30} height={30} className='h-8 w-auto object-contain' />
              <span className='font-sora text-lg font-extrabold tracking-tight'>JMMI Admin</span>
            </div>

            <Button
              type='button'
              variant='ghost'
              onClick={() => setIsMobileOpen(false)}
              className='h-9 w-9 border-white/20 bg-white/10 p-0 text-white hover:bg-white/20'
              aria-label='Tutup menu'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex-1 px-4 py-6 overflow-y-auto space-y-4'>
            <p className='px-2 font-sora text-[11px] font-bold uppercase tracking-wider text-white/60'>
              Navigasi Panel
            </p>
            {renderNavigation(false, () => setIsMobileOpen(false))}
          </div>

          <div className='border-t border-white/15 px-4 py-4'>
            <div className='rounded-2xl bg-white/10 p-4 ring-1 ring-white/15'>
              <p className='font-sora text-[10px] font-bold uppercase tracking-wider text-white/60'>
                Pengurus Terautentikasi
              </p>
              <p className='mt-1 font-sora text-sm font-bold text-white'>{userName || 'Admin JMMI'}</p>
              <Button
                type='button'
                variant='outline'
                onClick={onLogout}
                className='mt-3 w-full justify-center rounded-full border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#146637] font-sora text-xs font-semibold'
              >
                <LogOut className='mr-2 h-3.5 w-3.5' />
                Keluar
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <aside
        className={cn(
          'hidden bg-[#146637] text-white transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-[#146637] shadow-xl',
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        )}
      >
        <div
          className={cn(
            'border-b border-white/15 py-4',
            isCollapsed ? 'flex justify-center px-2' : 'px-4'
          )}
        >
          <Button
            type='button'
            variant='ghost'
            onClick={() => setIsCollapsed((value) => !value)}
            className={cn(
              'border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#146637] font-sora text-xs font-semibold',
              isCollapsed ? 'mx-auto h-10 w-10 p-0 rounded-full' : 'w-full justify-center px-3 rounded-full'
            )}
            aria-label={isCollapsed ? 'Buka sidebar' : 'Minimalkan sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <>
                <ChevronLeft className='mr-2 h-4 w-4' />
                Minimalkan Sidebar
              </>
            )}
          </Button>
        </div>

        <div className={cn('border-b border-white/15 py-6', isCollapsed ? 'px-3' : 'px-6')}>
          {!isCollapsed && (
            <div className='flex items-center justify-center gap-3'>
              <Image
                src='/images/footer/logo.png'
                alt='JMMI Logo'
                width={36}
                height={33}
                className='h-9 w-auto object-contain'
              />
              <span className='font-sora text-xl font-extrabold tracking-tight text-white'>
                JMMI Admin
              </span>
            </div>
          )}

          {isCollapsed && (
            <div className='flex justify-center'>
              <Image
                src='/images/footer/logo.png'
                alt='JMMI Logo'
                width={32}
                height={29}
                className='h-8 w-auto object-contain'
              />
            </div>
          )}
        </div>

        <div className={cn('flex-1 py-6 overflow-y-auto space-y-3', isCollapsed ? 'px-2' : 'px-4')}>
          {!isCollapsed && (
            <div className='px-2 font-sora text-[10px] font-extrabold uppercase tracking-wider text-white/60'>
              Navigasi Panel
            </div>
          )}

          {renderNavigation(isCollapsed)}
        </div>

        <div className='border-t border-white/15 px-4 py-4'>
          <div className={cn('rounded-2xl bg-white/10 ring-1 ring-white/15', isCollapsed ? 'p-2' : 'p-4')}>
            {!isCollapsed && (
              <>
                <p className='font-sora text-[10px] font-extrabold uppercase tracking-wider text-white/60'>
                  Pengurus Terautentikasi
                </p>
                <p className='mt-1 font-sora text-sm font-bold text-white truncate'>{userName || 'Admin JMMI'}</p>
              </>
            )}
            <Button
              type='button'
              variant='outline'
              onClick={onLogout}
              className={cn(
                'border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#146637] font-sora text-xs font-semibold rounded-full',
                isCollapsed ? 'mt-0 h-10 w-full justify-center p-0' : 'mt-3 w-full justify-center py-2'
              )}
            >
              <LogOut className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
              {!isCollapsed && 'Keluar'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}