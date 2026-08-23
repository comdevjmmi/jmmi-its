'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

type LinkButtonVariant = 'general' | 'orange' | 'blue';

interface LinkButtonProps {
  title: string;
  url: string;
  variant?: LinkButtonVariant;
  className?: string;
  newTab?: boolean;
}

/**
 * LinkButton component for displaying individual links
 * Opens link in new tab when clicked by default
 */
export default function LinkButton({
  title,
  url,
  variant = 'blue',
  className,
  newTab = true,
}: LinkButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(url);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full rounded-2xl px-6 py-4 text-left font-sora font-semibold text-slate-800 border border-gray-100 bg-white shadow-sm transition-all duration-200',
        'hover:border-[#146637] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between group',
        variant === 'orange' &&
          'bg-[#146637] text-white border-[#146637] hover:bg-[#0e4a28]',
        variant === 'blue' &&
          'bg-gray-50/80 text-slate-900 border-gray-100 hover:border-[#146637]/40',
        variant === 'general' &&
          'bg-white text-slate-800 border-gray-100 hover:border-[#146637]',
        className
      )}
    >
      <span className='text-sm sm:text-base font-bold'>{title}</span>
      <span className='text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity'>→</span>
    </button>
  );
}
