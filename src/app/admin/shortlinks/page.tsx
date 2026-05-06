'use client';

import { Edit, Plus, Trash2, X } from 'lucide-react';
import * as React from 'react';

import { buildShortUrl } from '@/lib/link-url';

import Button from '@/components/buttons/Button';
import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import {
  useCreateShortLink,
  useDeleteShortLink,
  useGetShortLinks,
  useUpdateShortLink,
} from '@/app/links/hook/useShortLink';

import { ShortLink } from '@/types/entities/links';

export default function ShortLinksAdminPage() {
  const { data: shortLinks, isLoading, fetchShortLinks } = useGetShortLinks();
  const { mutateAsync: createShortLink } = useCreateShortLink();
  const { mutateAsync: updateShortLink } = useUpdateShortLink();
  const { mutateAsync: deleteShortLink } = useDeleteShortLink();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState({
    short_code: '',
    url: '',
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormState({ short_code: '', url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ShortLink) => {
    setEditingId(item.short_link_id);
    setFormState({
      short_code: item.short_code,
      url: item.url,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateShortLink({ id: editingId, data: formState });
      } else {
        await createShortLink(formState);
      }
      setIsModalOpen(false);
      fetchShortLinks();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus short link ini?')) {
      await deleteShortLink(id);
      fetchShortLinks();
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <Typography as='h1' variant='h4' weight='bold' className='text-slate-800'>
            Short Links
          </Typography>
          <Typography variant='body-s' className='text-slate-500'>
            Kelola URL shortener mandiri
          </Typography>
        </div>
        <Button
          variant='primary'
          leftIcon={Plus}
          onClick={handleOpenCreate}
          className='rounded-full shadow-lg shadow-blue-200'
        >
          Buat Short Link
        </Button>
      </div>

      <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
        <table className='w-full text-left'>
          <thead>
            <tr className='bg-slate-50 border-b border-slate-100'>
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500'>Short Code</th>
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500'>Target URL</th>
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500 text-center'>Klik</th>
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500 text-right'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {shortLinks.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-6 py-12 text-center text-slate-400'>
                  Belum ada short link.
                </td>
              </tr>
            ) : (
              shortLinks.map((link) => (
                <tr key={link.short_link_id} className='hover:bg-slate-50 transition-colors'>
                  <td className='px-6 py-4'>
                    <Typography variant='body-s' weight='bold' className='text-blue-600'>
                      /{link.short_code}
                    </Typography>
                    <Typography variant='c-s' className='text-slate-400'>
                      {buildShortUrl(link.short_path)}
                    </Typography>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='max-w-xs truncate text-slate-600' title={link.url}>
                      {link.url}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'>
                      {link.click_count}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right space-x-2'>
                    <button
                      onClick={() => handleOpenEdit(link)}
                      className='p-2 text-slate-400 hover:text-blue-600 transition-colors'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.short_link_id)}
                      className='p-2 text-slate-400 hover:text-red-600 transition-colors'
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'>
            <div className='mb-6 flex items-start justify-between'>
              <div>
                <Typography as='h3' variant='h6' weight='bold' className='text-slate-900'>
                  {editingId ? 'Edit Short Link' : 'Buat Short Link Baru'}
                </Typography>
                <Typography variant='c-s' className='text-slate-500'>
                  {editingId ? 'Sesuaikan pengaturan tautan pendek Anda.' : 'Buat tautan baru yang lebih ringkas dan mudah dibagikan.'}
                </Typography>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className='p-1 text-slate-400 hover:text-slate-600 transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Short Code
                </label>
                <input
                  type='text'
                  value={formState.short_code}
                  onChange={(e) => setFormState({ ...formState, short_code: e.target.value })}
                  className='w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
                  placeholder='e.g. daftar-lomba'
                />
                <Typography variant='c-s' className='text-slate-400'>
                  Kosongkan untuk generate otomatis
                </Typography>
              </div>

              <div className='space-y-2'>
                <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Target URL
                </label>
                <input
                  required
                  type='url'
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  className='w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
                  placeholder='https://example.com'
                />
              </div>

              <div className='flex justify-end space-x-3 pt-6 border-t border-slate-100'>
                <Button variant='outline' onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type='submit' variant='primary'>
                  {editingId ? 'Simpan Perubahan' : 'Buat Short Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
