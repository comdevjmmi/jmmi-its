'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NextImage from '@/components/NextImage';

export interface SliderImage {
  src: string;
  alt: string;
}

interface HeroSliderProps {
  images?: SliderImage[];
}

const defaultImages: SliderImage[] = [
  { src: '/images/hero-slider/1.png', alt: 'JMMI ITS Hero Slider 1' },
  { src: '/images/hero-slider/2.png', alt: 'JMMI ITS Hero Slider 2' },
];

export default function HeroSlider({ images = defaultImages }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Auto-play slideshow timer
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <section className='relative w-full px-4 sm:px-6 lg:px-16 py-6 sm:py-10 bg-white'>
      <div className='mx-auto max-w-[1312px]'>
        <div className='relative overflow-hidden rounded-[20px] sm:rounded-[25px] border border-gray-100 shadow-md bg-gray-100 w-full aspect-[1312/870] sm:aspect-auto h-auto sm:h-[500px] md:h-[650px] lg:h-[750px] xl:h-[870px] max-h-[calc(100vh-100px)] flex items-center justify-center group'>
          {/* Active Hero Image */}
          <NextImage
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            width={1312}
            height={870}
            className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102'
            priority
          />

          {/* Overlay Ambient Gradient */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10' />

          {/* Left Switcher Button */}
          <button
            onClick={handlePrev}
            className='absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#146637] shadow-lg backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95'
            aria-label='Previous Image'
          >
            <ChevronLeft className='h-6 w-6' />
          </button>

          {/* Right Switcher Button */}
          <button
            onClick={handleNext}
            className='absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#146637] shadow-lg backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95'
            aria-label='Next Image'
          >
            <ChevronRight className='h-6 w-6' />
          </button>

          {/* Dynamic Dots Pagination Indicator */}
          <div className='absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/40 px-5 py-2.5 backdrop-blur-md'>
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-8 bg-white shadow-md'
                    : 'w-3 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
