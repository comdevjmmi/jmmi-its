import * as React from 'react';
import { BookOpen, HeartHandshake, ShieldCheck, Users, LucideIcon } from 'lucide-react';

export interface PillarItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface PillarsSectionProps {
  pillars?: PillarItem[];
}

const defaultPillars: PillarItem[] = [
  {
    title: 'Dakwah & Syiar',
    description:
      'Menyelenggarakan kajian berkala, syiar keislaman, dan pembinaan spiritual bagi civitas akademika ITS.',
    icon: BookOpen,
  },
  {
    title: 'Advokasi & Kepedulian',
    description:
      'Mendampingi mahasiswa dalam pelayanan keumatan, advokasi kesejahteraan, dan kegiatan sosial.',
    icon: HeartHandshake,
  },
  {
    title: 'Tata Kelola Akuntabel',
    description:
      'Prinsip akuntabilitas publik melalui transparansi laporan keuangan dan publikasi informasi kerja.',
    icon: ShieldCheck,
  },
  {
    title: 'Kemitraan & Kaderisasi',
    description:
      'Membangun jejaring dengan LDF, ormawa ITS, alumni, dan membina generasi intelektual muslim.',
    icon: Users,
  },
];

export default function PillarsSection({ pillars = defaultPillars }: PillarsSectionProps) {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
      <div className='text-center max-w-3xl mx-auto mb-12 space-y-3'>
        <h2 className='text-3xl font-bold text-slate-900 font-serif sm:text-4xl'>
          Fokus & Pilar Gerakan
        </h2>
        <p className='text-base text-slate-600'>
          Menjalankan peran komprehensif untuk mendukung dakwah kampus dan pelayanan civitas akademika ITS.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {pillars.map((pilar) => {
          const Icon = pilar.icon;
          return (
            <div
              key={pilar.title}
              className='rounded-2xl border border-gray-100 bg-white p-6 text-slate-800 shadow-md hover:shadow-xl transition-all'
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#146637] text-white shadow-md'>
                <Icon className='h-6 w-6' />
              </div>
              <h3 className='mt-5 text-xl font-semibold text-slate-900'>{pilar.title}</h3>
              <p className='mt-3 text-sm text-slate-600 leading-relaxed'>{pilar.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
