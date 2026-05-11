'use client';

import { AxiosError } from 'axios';
import * as React from 'react';
import toast from 'react-hot-toast';

import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';

import AnnouncementForm from '@/app/announcement/components/AnnouncementForm';
import AnnouncementHeader from '@/app/announcement/components/AnnouncementHeader';
import ResultCard from '@/app/announcement/components/ResultCard';
import {
  AnnouncementData,
  useCheckAnnouncement,
} from '@/app/announcement/hook/useCheckAnnouncement';

import { ApiError } from '@/types/api';

export default function AnnouncementPage() {
  const [view, setView] = React.useState<'form' | 'result'>('form');
  const [resultData, setResultData] = React.useState<AnnouncementData | null>(
    null
  );

  const { mutate: checkStatus, isPending } = useCheckAnnouncement();

  const handleCheck = (nrp: string) => {
    checkStatus(
      { nrp },
      {
        onSuccess: (res) => {
          if (res.status === 'success' && res.data) {
            setResultData(res.data);
            setView('result');
          } else {
            // Fallback for unexpected success structure
            toast.error(res.message || 'Terjadi kesalahan pada sistem.');
          }
        },
        onError: (err: AxiosError<ApiError>) => {
          const message =
            (err.response?.data as ApiError)?.message ||
            'Gagal melakukan pengecekan. Silakan coba lagi.';
          toast.error(message);
        },
      }
    );
  };

  return (
    <LinksLayoutWrapper>
      <div className='flex flex-col items-center px-4 py-8 sm:py-12 min-h-screen'>
        <AnnouncementHeader />

        <div className='w-full max-w-md md:max-w-2xl lg:max-w-4xl space-y-8'>
          {view === 'form' ? (
            <AnnouncementForm onSubmit={handleCheck} isLoading={isPending} />
          ) : (
            resultData && <ResultCard data={resultData} />
          )}
        </div>

        <div className='h-12'></div>
      </div>
    </LinksLayoutWrapper>
  );
}
