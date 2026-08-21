import * as React from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';

import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function ProfileHeader() {
  return (
    <div className='flex flex-col items-center mb-8'>
      <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white mb-3 overflow-hidden shadow-lg border-2 border-white/20'>
        <NextImage
          src='/images/logo.png'
          alt="Jama'ah Masjid Manarul Ilmi"
          width={96}
          height={96}
          className='w-full h-full object-cover'
          useSkeleton
        />
      </div>

      <Typography
        as='h1'
        variant='h6'
        className='text-white text-center mb-2 font-serif tracking-wide'
      >
        Jamaah Masjid Manarul Ilmi
      </Typography>

      <div className='bg-brand-red px-6 py-1.5 rounded-sm shadow-md mb-4'>
        <Typography
          as='span'
          variant='body'
          className='text-white font-bold tracking-wide'
        >
          Kabinet Ekselensi
        </Typography>
      </div>

      <div className='flex gap-4 items-center text-white'>
        <a
          href='https://www.instagram.com/jmmi.its/'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-gray-300 transition-colors'
        >
          <FaInstagram className='w-6 h-6' />
        </a>
        <a
          href='https://www.linkedin.com/company/jmmi-its/'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-gray-300 transition-colors'
        >
          <FaLinkedin className='w-6 h-6' />
        </a>
      </div>
    </div>
  );
}
