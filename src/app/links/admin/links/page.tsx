'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetLinks } from '@/app/links/hook/useLink';

import { buildShortUrl } from '@/lib/link-url';

import { Link } from '@/types/entities/links';

export default function LinksListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action'); // 'edit' or 'delete'

  const { data: links, isLoading, fetchLinks } = useGetLinks();
  const [filteredLinks, setFilteredLinks] = React.useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  React.useEffect(() => {
    if (links) {
      const filtered = links.filter((link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLinks(filtered);
    }
  }, [searchQuery, links]);

  const handleItemClick = (item: Link) => {
    if (action === 'edit') {
      router.push(`/links/admin/links/edit?id=${item.link_id}`);
    } else if (action === 'delete') {
      router.push(`/links/admin/links/delete?id=${item.link_id}`);
    }
  };

  const pageTitle =
    action === 'edit' ? 'Pilih Link untuk Diedit' : 'Pilih Link untuk Dihapus';

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 h-screen'>
        <div className='w-full max-w-lg flex flex-col h-full'>
          {/* Header */}
          <div className='text-center space-y-2 mb-8 shrink-0'>
            <Typography
              as='h2'
              variant='h5'
              className='text-white font-bold tracking-tight'
            >
              {pageTitle}
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          {/* Search */}
          <div className='mb-6 shrink-0'>
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Cari link...'
                className='w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 backdrop-blur-sm transition-all outline-none shadow-sm'
              />
              <svg
                className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
          </div>

          {/* List */}
          <div className='flex-1 overflow-y-auto space-y-3 min-h-0 mb-6 pr-2 custom-scrollbar'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center py-12 space-y-4 text-white/50'>
                <Loading className='border-white/20 border-t-orange-500' />
                <Typography variant='body'>Memuat data...</Typography>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className='bg-white/5 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/10 border-dashed'>
                <Typography variant='body' className='text-gray-300'>
                  Tidak ada data ditemukan.
                </Typography>
              </div>
            ) : (
              filteredLinks.map((item) => (
                <button
                  key={item.link_id}
                  onClick={() => handleItemClick(item)}
                  className='w-full text-left bg-white/5 hover:bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-all duration-300 flex justify-between items-center group border border-white/5 hover:border-white/20 hover:shadow-lg hover:translate-x-1'
                >
                  <div className='min-w-0 pr-4'>
                    <Typography
                      className='text-white font-semibold group-hover:text-amber-400 transition-colors truncate text-lg'
                      variant='body'
                    >
                      {item.title}
                    </Typography>
                    <Typography className='text-gray-400 text-sm mt-0.5 truncate group-hover:text-gray-300'>
                      {item.link}
                    </Typography>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Back Button */}
          <BackButton href='/links/admin' />
        </div>
      </div>
    </>
  );
}
