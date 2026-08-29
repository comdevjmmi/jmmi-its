export const metadata = {
  title: 'JMMI Cup 2026 | JMMI ITS',
  description: 'JMMI Cup Spesial JMMI ITS 2026',
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
