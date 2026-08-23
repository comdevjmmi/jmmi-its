import * as React from 'react';

export interface StatItem {
  label: string;
  value: string;
}

interface StatsBarProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { label: 'Departemen & BIRO', value: '12+' },
  { label: 'Kader & Pengurus', value: '150+' },
  { label: 'Program Kerja Utama', value: '40+' },
  { label: 'Jamaah Terjangkau', value: '5000+' },
];

export default function StatsBar({ stats = defaultStats }: StatsBarProps) {
  return (
    <section className='border-y border-gray-100 bg-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-2 gap-6 md:grid-cols-4 text-center'>
          {stats.map((stat) => (
            <div key={stat.label} className='p-2'>
              <div className='text-3xl sm:text-4xl font-bold text-[#146637] font-serif'>
                {stat.value}
              </div>
              <div className='mt-1 text-xs sm:text-sm font-medium text-slate-600'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
