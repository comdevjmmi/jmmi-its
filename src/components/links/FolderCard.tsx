'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FolderCardProps {
  title: string;
  folderId: string;
  isLocked?: boolean;
  className?: string;
}

/**
 * FolderCard component for displaying folder buttons
 * Navigates to folder detail page when clicked
 */
export default function FolderCard({
  title,
  folderId,
  isLocked = false,
  className,
}: FolderCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [inputKey, setInputKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleClick = () => {
    if (isLocked) {
      setInputKey('');
      setShowKey(false);
      setErrorMessage('');
      setIsModalOpen(true);
      return;
    }

    router.push(`/links/view?id=${folderId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInputKey('');
    setShowKey(false);
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleSubmitKey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedKey = inputKey.trim();
    if (!normalizedKey) {
      setErrorMessage('Key folder wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Validate key by fetching the folder
      await api.get(`/links/folders/${folderId}?key=${encodeURIComponent(normalizedKey)}`);
      
      // If success, set session storage and redirect
      sessionStorage.setItem(`folder-key:${folderId}`, normalizedKey);
      handleCloseModal();
      router.push(`/links/view?id=${folderId}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setErrorMessage('Key folder salah');
      } else {
        setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'w-full rounded-2xl px-6 py-4 text-left font-sora font-bold text-slate-900 border border-gray-100 bg-white shadow-sm transition-all duration-200',
          'hover:border-[#146637] hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
          className
        )}
      >
        <span className='inline-flex items-center justify-between w-full text-sm sm:text-base'>
          <span>{title}</span>
          {isLocked && <Lock className='h-4 w-4 text-[#146637]' aria-label='Terkunci' />}
        </span>
      </button>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
          <form
            onSubmit={handleSubmitKey}
            className='w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl'
          >
            <h3 className='text-lg font-semibold text-slate-900'>Folder Terkunci</h3>
            <p className='mt-1 text-sm text-slate-600'>
              Masukkan key untuk membuka folder "{title}".
            </p>

            <div className='mt-4 space-y-1.5'>
              <label htmlFor={`folder-key-${folderId}`} className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Key Folder
              </label>
              <div className='relative'>
                <input
                  id={`folder-key-${folderId}`}
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(event) => {
                    setInputKey(event.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder='Masukkan key'
                  autoFocus
                  className='w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-12 text-sm outline-none transition focus:border-brand-green-500'
                />
                <button
                  type='button'
                  onClick={() => setShowKey((prev) => !prev)}
                  aria-label={showKey ? 'Sembunyikan key folder' : 'Tampilkan key folder'}
                  className='absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green-500'
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errorMessage && (
                <p className='text-xs text-red-600'>{errorMessage}</p>
              )}
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button
                type='button'
                onClick={handleCloseModal}
                className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
              >
                Batal
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className={cn(
                  'rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-orange-700 hover:to-orange-600',
                  isSubmitting && 'opacity-70 cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Memproses...' : 'Buka Folder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
