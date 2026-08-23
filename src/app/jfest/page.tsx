export const metadata = {
  title: 'J-Fest 2026 | JMMI ITS',
  description: 'Festival & Agenda Spesial JMMI ITS 2026',
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
