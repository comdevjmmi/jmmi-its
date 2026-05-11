'use client';

import * as React from 'react';

import BackButton from '@/components/BackButton';
import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import ProfileHeader from '@/components/links/ProfileHeader';
import Typography from '@/components/Typography';

export default function AboutPage() {
  // const router = useRouter();

  return (
    <LinksLayoutWrapper>
      {/* Settings Icon - Top Right */}
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6 z-20'>
        <button className='text-white hover:text-gray-300 transition-colors'>
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
          </svg>
        </button>
      </div>

      <div className='relative z-10 flex flex-col items-center px-6 py-8 sm:py-12 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto'>
        {/* Profile Section Reusable Component */}
        <ProfileHeader />

        {/* Content Section */}
        <div className='w-full space-y-6 text-center text-white'>
          {/* Visi Section */}
          <div className='space-y-4'>
            <div className='bg-[#C84C1E] py-2 rounded-sm shadow-sm'>
              <Typography
                as='h2'
                variant='h6'
                className='font-bold uppercase tracking-widest'
              >
                Visi
              </Typography>
            </div>

            <Typography
              variant='body'
              className='text-sm sm:text-base leading-relaxed px-2'
            >
              Terwujudnya JMMI sebagai pusat dakwah dan isu keumatan kampus yang
              Progresif, Akuntabel, Sistematis, dan Resilien melalui tata kelola
              yang tepat, serta kajian, advokasi, dan pengabdian berdampak.
            </Typography>

            <div className='flex flex-wrap justify-center gap-2 mt-2'>
              {['PROGRESIF', 'AKUNTABEL', 'RESILIEN', 'SISTEMATIS'].map(
                (tag) => (
                  <span
                    key={tag}
                    className='bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide'
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Misi Section */}
          <div className='space-y-4'>
            <div className='bg-[#C84C1E] py-2 rounded-sm shadow-sm'>
              <Typography
                as='h2'
                variant='h6'
                className='font-bold uppercase tracking-widest'
              >
                Misi
              </Typography>
            </div>

            <ol className='text-left text-xs sm:text-sm space-y-3 list-decimal list-outside px-4 leading-relaxed'>
              <li>
                Mengoptimalkan potensi SDM dan kapasitas organisasi melalui
                kolaborasi lintas departemen, komunitas, dan mitra strategis
                guna mewujudkan kinerja organisasi yang berkelanjutan dan
                berdampak.
              </li>
              <li>
                Mewujudkan tata kelola organisasi yang transparan, terukur, dan
                bertanggung jawab melalui penguatan sistem internal serta
                pencapaian output program yang berdampak dan dapat
                dipertanggungjawabkan kepada stakeholder.
              </li>
              <li>
                Membangun citra JMMI sebagai organisasi yang matang, inklusif,
                dan komunikatif melalui interaksi eksternal yang konstruktif,
                sehingga memperkuat persepsi publik dan keberterimaan organisasi
                di lingkungan mahasiswa dan umat.
              </li>
              <li>
                Mengembangkan kebijakan dan tata kelola organisasi JMMI yang
                adaptif dan ramah akademik guna merespons perubahan lingkungan
                kampus serta menjaga keberlanjutan peran dan aktivitas
                organisasi.
              </li>
            </ol>
          </div>
        </div>

        {/* Back Button Reusable Component */}
        <BackButton href='/links' />
      </div>
    </LinksLayoutWrapper>
  );
}
