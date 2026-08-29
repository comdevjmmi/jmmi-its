import { Metadata } from 'next';

const title = 'J-Fest 2026';
const description = 'Halaman alias J-Fest 2026 JMMI ITS untuk mengakses microsite festival dan agenda kegiatan spesial.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/j-fest',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: '/j-fest',
  },
  twitter: {
    title,
    description,
  },
};

export default function JFestAliasPage() {
  return (
    <div className='fixed inset-0 z-50 h-screen w-screen bg-white overflow-hidden'>
      <iframe
        src='https://jfest2026.vercel.app/'
        title='J-Fest 2026'
        className='h-full w-full border-0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  );
}
