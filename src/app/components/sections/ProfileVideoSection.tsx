'use client';

import * as React from 'react';
import NextImage from '@/components/NextImage';
import { Play } from 'lucide-react';

export interface ProfileVideoSectionProps {
  title?: string;
  youtubeEmbedId?: string;
  backgroundImage?: string;
}

export default function ProfileVideoSection({
  title = 'Video Profil JMMI ITS',
  youtubeEmbedId = 'bg9io7WKasw',
  backgroundImage = '/images/profile-video/bg-image.png',
}: ProfileVideoSectionProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-16 overflow-hidden bg-slate-900 text-white min-h-[700px] sm:min-h-[850px] flex items-center justify-center'
    >
      {/* Background Image Asset covering the full section */}
      <div className='absolute inset-0 z-0'>
        <NextImage
          src={backgroundImage}
          alt='Profile Video Background'
          layout='fill'
          className='h-full w-full'
          classNames={{
            image: 'h-full w-full object-cover object-center',
          }}
          priority
        />
        {/* Soft Ambient Overlay for contrast */}
        <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />
      </div>

      <div className='relative z-10 mx-auto max-w-[1000px] w-full flex flex-col items-center gap-8 text-center'>
        {/* Video Player Card Container (Positioned ABOVE the text) */}
        <div
          className={`relative overflow-hidden rounded-[25px] border border-white/20 shadow-2xl bg-black/60 aspect-[16/9] w-full max-w-[872px] transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
          }`}
        >
          {isPlaying ? (
            /* YouTube Embedded Video */
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeEmbedId}?autoplay=1&rel=0`}
              title={title}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='h-full w-full border-0'
            />
          ) : (
            /* Video Cover with Play Switcher */
            <div
              className='relative h-full w-full group cursor-pointer flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors'
              onClick={() => setIsPlaying(true)}
            >
              {/* Play Switcher Button */}
              <div className='relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-[#146637] text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0e4a28] group-active:scale-95'>
                {/* Glowing Pulse Ring */}
                <span className='absolute inset-0 rounded-full bg-[#146637] opacity-75 animate-ping' />
                <Play className='h-8 w-8 sm:h-10 sm:w-10 fill-white translate-x-0.5 relative z-10' />
              </div>
            </div>
          )}
        </div>

        {/* Section Title (Positioned BELOW the video player) */}
        <div
          className={`space-y-2 transition-all duration-1000 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md'>
            {title}
          </h2>
        </div>
      </div>
    </section>
  );
}
