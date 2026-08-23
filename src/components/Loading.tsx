import React from 'react';

import { cn } from '@/lib/utils';
import NextImage from '@/components/NextImage';

type LoadingProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
};

export default function Loading({
  className,
  size = 'md',
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-14 h-14 border-4',
    xl: 'w-20 h-20 border-[4px]',
  };

  const spinner = (
    <div
      className={cn(
        'relative animate-spin rounded-full border-gray-200 border-t-[#146637]',
        sizeClasses[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-300'>
        <div className='relative flex flex-col items-center justify-center gap-5 p-10 rounded-[25px] bg-white border border-gray-100 shadow-2xl'>
          {/* Brand Logo in Center */}
          <div className='relative flex items-center justify-center'>
            {spinner}
            <div className='absolute inset-0 flex items-center justify-center'>
              <NextImage
                src='/images/navbar/logo.png'
                alt='JMMI ITS Logo'
                width={28}
                height={26}
                className='h-6 w-auto object-contain animate-pulse'
              />
            </div>
          </div>

          <div className='text-center space-y-1'>
            <p className='font-sora text-sm font-extrabold uppercase tracking-widest text-[#146637] animate-pulse'>
              JMMI ITS
            </p>
            <p className='font-hanken text-xs font-semibold text-slate-400'>
              Memuat Halaman...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return spinner;
}
