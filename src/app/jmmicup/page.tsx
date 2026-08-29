import { Metadata } from 'next';

const title = 'JMMI Cup 2026';
const description = 'Halaman JMMI Cup 2026 JMMI ITS untuk mengakses microsite kompetisi dan informasi kegiatan.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/jmmicup',
  },
  openGraph: {
    title,
    description,
    url: '/jmmicup',
  },
  twitter: {
    title,
    description,
  },
};

export default function JMMICupPage() {
  return (
    <div className='fixed inset-0 z-50 h-screen w-screen bg-white overflow-hidden'>
      <iframe
        src='https://jmmicup2026.vercel.app/'
        title='JMMI Cup 2026'
        className='h-full w-full border-0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  );
}
