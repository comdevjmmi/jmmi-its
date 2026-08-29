import { Metadata } from 'next';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactUsSection from '@/app/components/sections/ContactUsSection';

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Hubungi JMMI ITS melalui halaman kontak resmi untuk informasi, kolaborasi, dan layanan organisasi.',
};

export default function ContactPage() {
  return (
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 py-6 sm:py-10'>
        <ContactUsSection />
      </main>

      <Footer />
    </div>
  );
}
