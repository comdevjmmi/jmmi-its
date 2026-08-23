'use client';

import * as React from 'react';
import { Instagram, Phone, Send, Twitter, Linkedin } from 'lucide-react';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';

export default function ContactUsSection() {
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      setMessage('');
      showToast('Pesan berhasil terkirim! Terima kasih telah menghubungi JMMI ITS.', SUCCESS_TOAST);
    }, 800);
  };

  return (
    <section
      ref={sectionRef}
      className='relative w-full bg-white py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden'
    >
      <div className='mx-auto max-w-[1312px] space-y-12'>
        {/* Section Title */}
        <div
          className={`space-y-3 transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className='font-sora text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight'>
            Contact Us
          </h2>
          <p className='font-hanken text-lg sm:text-xl text-slate-600 max-w-xl'>
            Sampaikan saran, pertanyaan, atau kolaborasi untuk kegiatan dakwah JMMI ITS.
          </p>
        </div>

        {/* Content Layout Grid: Form (Left) & Help Card (Right) */}
        <div className='grid gap-10 lg:grid-cols-12 items-start'>
          {/* Left Column: Interactive Form */}
          <div
            className={`lg:col-span-7 transition-all duration-1000 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Email Input Field */}
              <div className='space-y-2'>
                <label htmlFor='contact-email' className='block font-sora text-sm font-semibold text-slate-800'>
                  Email Anda
                </label>
                <input
                  id='contact-email'
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Tuliskan email anda'
                  className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-4 font-sora text-base text-slate-900 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20 transition-all shadow-sm'
                />
              </div>

              {/* Message Input Field */}
              <div className='space-y-2'>
                <label htmlFor='contact-message' className='block font-sora text-sm font-semibold text-slate-800'>
                  Pesan Anda
                </label>
                <textarea
                  id='contact-message'
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Tuliskan isi pesan anda'
                  className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-4 font-sora text-base text-slate-900 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20 transition-all shadow-sm resize-none'
                />
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-[#146637] px-8 py-4 font-sora text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#0e4a28] hover:scale-105 active:scale-95 disabled:opacity-70'
              >
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}</span>
                <Send className='h-4 w-4' />
              </button>
            </form>
          </div>

          {/* Right Column: Help Info & Social Links Card */}
          <div
            className={`lg:col-span-5 transition-all duration-1000 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className='rounded-[25px] border border-gray-100 bg-gray-50/80 p-8 sm:p-10 shadow-xl backdrop-blur-md space-y-8'>
              <div className='space-y-3'>
                <h3 className='font-hanken text-xl sm:text-2xl font-bold text-slate-900'>
                  Butuh Bantuan Lebih Lanjut?
                </h3>
                <p className='font-hanken text-sm sm:text-base text-slate-600 leading-relaxed'>
                  Tim admin kami siap melayani pertanyaan dan bantuan seputar kegiatan masjid serta organisasi JMMI ITS.
                </p>
              </div>

              {/* Contact Admin Link Button */}
              <a
                href='https://wa.me/6285188661321'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3.5 rounded-2xl bg-white border border-gray-200 px-5 py-4 text-[#146637] font-mono text-sm font-bold shadow-sm transition-all hover:border-[#146637] hover:shadow-md hover:scale-[1.02] active:scale-95 group'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#146637]/10 text-[#146637] group-hover:bg-[#146637] group-hover:text-white transition-colors'>
                  <Phone className='h-5 w-5' />
                </div>
                <div className='flex flex-col text-left'>
                  <span className='text-xs text-slate-500 font-sans font-medium'>WhatsApp Support</span>
                  <span className='text-slate-900 group-hover:text-[#146637] transition-colors'>
                    Hubungi Admin: 0851-8866-1321
                  </span>
                </div>
              </a>

              {/* Social Media Links */}
              <div className='space-y-4 pt-2 border-t border-gray-200/60'>
                <span className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Ikuti Media Sosial Kami
                </span>
                <div className='flex items-center gap-4'>
                  <a
                    href='https://www.instagram.com/jmmi.its/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-800 shadow-sm transition-all hover:border-[#146637] hover:bg-[#146637] hover:text-white hover:scale-110 active:scale-95'
                    aria-label='Instagram'
                  >
                    <Instagram className='h-5 w-5' />
                  </a>
                  <a
                    href='https://x.com/jmmi_its'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-800 shadow-sm transition-all hover:border-[#146637] hover:bg-[#146637] hover:text-white hover:scale-110 active:scale-95'
                    aria-label='Twitter'
                  >
                    <Twitter className='h-5 w-5' />
                  </a>
                  <a
                    href='https://www.linkedin.com/company/jmmi-its/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-800 shadow-sm transition-all hover:border-[#146637] hover:bg-[#146637] hover:text-white hover:scale-110 active:scale-95'
                    aria-label='LinkedIn'
                  >
                    <Linkedin className='h-5 w-5' />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
