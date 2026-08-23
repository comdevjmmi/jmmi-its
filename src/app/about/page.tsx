import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tentang Kabinet Ekselensi 2026 | JMMI ITS',
  description: 'Visi, Misi, dan Nilai Utama JMMI ITS Kabinet Ekselensi 2026',
};

export default function AboutPage() {
  return (
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 py-12 px-4 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-[1312px] space-y-12'>
          {/* Header */}
          <div className='space-y-4 max-w-3xl'>
            <h1 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#146637] tracking-tight'>
              Tentang Kabinet Ekselensi 2026
            </h1>
            <p className='font-hanken text-lg sm:text-xl text-slate-600 leading-relaxed'>
              JMMI ITS hadir sebagai wadah mahasiswa muslim ITS untuk bertumbuh dalam keislaman, berkarya, dan berkontribusi secara nyata bagi kampus dan masyarakat.
            </p>
          </div>

          {/* Visi Section */}
          <section className='rounded-[25px] border border-gray-100 bg-white p-8 sm:p-10 shadow-lg space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full bg-[#146637]/10 px-4 py-1.5 font-sora text-xs font-bold uppercase tracking-wider text-[#146637]'>
              Visi Utama
            </div>
            <h2 className='font-sora text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight'>
              Terwujudnya JMMI sebagai pusat dakwah dan isu keumatan kampus yang Progresif, Akuntabel, Sistematis, dan Resilien.
            </h2>
            <p className='font-hanken text-base sm:text-lg text-slate-600 leading-relaxed'>
              Melalui tata kelola yang tepat, serta kajian, advokasi, dan pengabdian berdampak guna memakmurkan Masjid Manarul Ilmi sebagai penggerak Islam rahmatan lil ‘alamin.
            </p>
          </section>

          {/* Misi Section */}
          <section className='rounded-[25px] border border-gray-100 bg-[#146637] p-8 sm:p-10 text-white shadow-xl space-y-8'>
            <div>
              <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-sora text-xs font-bold uppercase tracking-wider text-white'>
                Misi Strategis
              </span>
              <h2 className='font-sora text-2xl sm:text-3xl font-extrabold text-white mt-3'>
                4 Pilar Pergerakan Kabinet
              </h2>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <div className='rounded-2xl bg-white/10 p-6 space-y-2 ring-1 ring-white/15'>
                <span className='font-sora text-sm font-extrabold text-white/70'>01</span>
                <p className='font-hanken text-sm sm:text-base leading-relaxed text-white/95'>
                  Mengoptimalkan potensi SDM dan kapasitas organisasi melalui kolaborasi lintas departemen, komunitas, dan mitra strategis guna mewujudkan kinerja organisasi yang berkelanjutan dan berdampak.
                </p>
              </div>

              <div className='rounded-2xl bg-white/10 p-6 space-y-2 ring-1 ring-white/15'>
                <span className='font-sora text-sm font-extrabold text-white/70'>02</span>
                <p className='font-hanken text-sm sm:text-base leading-relaxed text-white/95'>
                  Mewujudkan tata kelola organisasi yang transparan, terukur, dan bertanggung jawab melalui penguatan sistem internal serta pencapaian output program yang berdampak.
                </p>
              </div>

              <div className='rounded-2xl bg-white/10 p-6 space-y-2 ring-1 ring-white/15'>
                <span className='font-sora text-sm font-extrabold text-white/70'>03</span>
                <p className='font-hanken text-sm sm:text-base leading-relaxed text-white/95'>
                  Membangun citra JMMI sebagai organisasi yang matang, inklusif, dan komunikatif melalui interaksi eksternal yang konstruktif guna memperkuat persepsi publik.
                </p>
              </div>

              <div className='rounded-2xl bg-white/10 p-6 space-y-2 ring-1 ring-white/15'>
                <span className='font-sora text-sm font-extrabold text-white/70'>04</span>
                <p className='font-hanken text-sm sm:text-base leading-relaxed text-white/95'>
                  Mengembangkan kebijakan dan tata kelola organisasi JMMI yang adaptif dan ramah akademik guna merespons perubahan lingkungan kampus serta menjaga keberlanjutan peran.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
