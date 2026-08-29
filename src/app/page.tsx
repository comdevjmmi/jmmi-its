import { Metadata } from 'next';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  HeroSlider,
  AboutSection,
  ProfileVideoSection,
  CabinetHistorySection,
  ContactUsSection,
} from '@/app/components/sections';

export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Halaman utama JMMI ITS berisi profil singkat, sejarah kabinet, dan akses informasi penting.',
};

export default function HomePage() {
  return (
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 space-y-4'>
        {/* Section 1: Hero Photo Slider */}
        <HeroSlider />

        {/* Section 2: About & Vision Section */}
        <AboutSection />

        {/* Section 3: Profile Video Section */}
        <ProfileVideoSection />

        {/* Section 4: Cabinet History Timeline */}
        <CabinetHistorySection />

        {/* Section 5: Contact Us & Social Links */}
        <ContactUsSection />
      </main>

      <Footer />
    </div>
  );
}