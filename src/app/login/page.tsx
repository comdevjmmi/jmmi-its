'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAdminLogin } from '../admin/hook/useAdmin';
import { showToast, DANGER_TOAST, SUCCESS_TOAST } from '@/components/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const login = useAuthStore.useLogin();
  const isAuthed = useAuthStore.useIsAuthed();
  const { mutate: adminLogin, isPending } = useAdminLogin();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isAuthed && isClient) {
      router.push('/admin');
    }
  }, [isAuthed, isClient, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Email and password are required', DANGER_TOAST);
      return;
    }

    adminLogin(
      { email, password },
      {
        onSuccess: (data) => {
          const userData = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: 'ADMIN',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          };
          login(userData);
          showToast('Login successful! Redirecting...', SUCCESS_TOAST);
          router.replace('/admin');
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || 'Login failed. Please try again.';
          showToast(message, DANGER_TOAST);
        },
      }
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-8'>
        <div className='w-full max-w-md space-y-8'>
          <div className='text-center space-y-3'>
            <h1 className='font-sora text-3xl sm:text-4xl font-extrabold text-[#146637] tracking-tight'>
              Masuk Admin
            </h1>
            <p className='font-hanken text-base text-slate-600'>
              Portal khusus pengurus JMMI ITS untuk pengelolaan data & laporan.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='rounded-[25px] border border-gray-100 bg-white p-8 shadow-xl space-y-6'
          >
            <div className='space-y-2'>
              <label htmlFor='email' className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                Email Address
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Masukkan email admin'
                className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-3.5 font-sora text-sm text-slate-900 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20 transition-all shadow-sm'
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='password' className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-3.5 pr-12 font-sora text-sm text-slate-900 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20 transition-all shadow-sm'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#146637] transition-colors'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={isPending}
              className='w-full inline-flex items-center justify-center rounded-full bg-[#146637] px-6 py-3.5 font-sora text-xs font-semibold uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#0e4a28] hover:shadow-lg active:scale-95 disabled:opacity-70'
            >
              {isPending ? 'Logging in...' : 'Masuk'}
            </button>
          </form>

          <div className='text-center'>
            <p className='font-hanken text-xs text-slate-400'>
              BPI Kabinet Ekselensi 2026 • JMMI ITS
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

