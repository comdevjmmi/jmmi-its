'use client';

import { Download, Edit, Plus, QrCode, Trash2, X } from 'lucide-react';
import * as React from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

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

// ─── QR Download Helper ───────────────────────────────────────────────────────
const downloadQRCode = (shortCode: string, shortUrl: string) => {
  const canvas = document.getElementById(`qr-canvas-${shortCode}`) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `qrcode-${shortCode}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// ─── QR Modal ────────────────────────────────────────────────────────────────
type QRModalProps = {
  link: ShortLink;
  shortUrl: string;
  onClose: () => void;
};

function QRModal({ link, shortUrl, onClose }: QRModalProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm'>
      <div className='w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl'>
        <div className='mb-4 flex items-start justify-between'>
          <div>
            <Typography as='h3' variant='h6' weight='bold' className='text-slate-900'>
              QR Code
            </Typography>
            <Typography variant='label' className='text-slate-500'>
              /{link.short_code}
            </Typography>
          </div>
          <button
            onClick={onClose}
            className='p-1 text-slate-400 hover:text-slate-600 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='flex flex-col items-center gap-4'>
          <div className='rounded-xl border border-slate-100 bg-slate-50 p-4'>
            {/* Hidden canvas for download */}
            <QRCodeCanvas
              id={`qr-canvas-${link.short_code}`}
              value={shortUrl}
              size={200}
              className='hidden'
              includeMargin
              level='H'
              imageSettings={{
                src: '/images/jmmi-logo.png',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            {/* Visible SVG */}
            <QRCodeSVG
              value={shortUrl}
              size={200}
              level='H'
              includeMargin
              imageSettings={{
                src: '/images/jmmi-logo.png',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <div className='w-full rounded-lg bg-slate-50 px-3 py-2 text-center'>
            <Typography variant='label' className='break-all text-blue-600 font-mono'>
              {shortUrl}
            </Typography>
          </div>

          <Button
            variant='primary'
            leftIcon={Download}
            onClick={() => downloadQRCode(link.short_code, shortUrl)}
            className='w-full justify-center rounded-xl'
          >
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  // QR success state setelah create/edit
  const [successLink, setSuccessLink] = React.useState<ShortLink | null>(null);
  // QR viewer dari tabel
  const [viewingQRLink, setViewingQRLink] = React.useState<ShortLink | null>(null);

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
      let result: ShortLink | undefined;
      if (editingId) {
        const res = await updateShortLink({ id: editingId, data: formState });
        result = res?.data ?? undefined;
      } else {
        const res = await createShortLink(formState);
        result = res?.data ?? undefined;
      }
      await fetchShortLinks();
      if (result) {
        setSuccessLink(result);
      } else {
        setIsModalOpen(false);
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuccessLink(null);
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
          <Typography variant='body' className='text-slate-500'>
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
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500 text-center'>QR</th>
              <th className='px-6 py-4 text-xs font-semibold uppercase text-slate-500 text-right'>Aksi</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {shortLinks.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-12 text-center text-slate-400'>
                  Belum ada short link.
                </td>
              </tr>
            ) : (
              shortLinks.map((link) => {
                const shortUrl = buildShortUrl(link.short_path);
                return (
                  <tr key={link.short_link_id} className='hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <Typography variant='body' weight='bold' className='text-blue-600'>
                        /{link.short_code}
                      </Typography>
                      <Typography variant='label' className='text-slate-400'>
                        {shortUrl}
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
                    <td className='px-6 py-4 text-center'>
                      <button
                        onClick={() => setViewingQRLink(link)}
                        title='Lihat QR Code'
                        className='mx-auto flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1 transition-all hover:border-blue-300 hover:bg-blue-50'
                      >
                        <QRCodeSVG
                          value={shortUrl}
                          size={36}
                          level='M'
                        />
                      </button>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => setViewingQRLink(link)}
                          className='p-2 text-slate-400 hover:text-indigo-600 transition-colors'
                          title='Lihat QR Code'
                        >
                          <QrCode size={18} />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl'>

            {/* ── SUCCESS STATE: tampilkan QR code setelah berhasil ── */}
            {successLink ? (
              <>
                <div className='mb-6 flex items-start justify-between'>
                  <div>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600'>
                        <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={3}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                        </svg>
                      </span>
                      <Typography as='h3' variant='h6' weight='bold' className='text-slate-900'>
                        Short Link Berhasil Dibuat!
                      </Typography>
                    </div>
                    <Typography variant='label' className='text-slate-500'>
                      Scan QR code di bawah atau download untuk dibagikan.
                    </Typography>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className='p-1 text-slate-400 hover:text-slate-600 transition-colors'
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className='flex flex-col items-center gap-4'>
                  {/* Short URL badge */}
                  <div className='w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-center'>
                    <Typography variant='label' className='text-xs text-slate-500'>Short URL</Typography>
                    <Typography variant='body' weight='bold' className='break-all font-mono text-blue-600'>
                      {buildShortUrl(successLink.short_path)}
                    </Typography>
                  </div>

                  {/* QR Code display */}
                  <div className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm'>
                    {/* Hidden canvas for download */}
                    <QRCodeCanvas
                      id={`qr-canvas-${successLink.short_code}`}
                      value={buildShortUrl(successLink.short_path)}
                      size={220}
                      className='hidden'
                      includeMargin
                      level='H'
                      imageSettings={{
                        src: '/images/jmmi-logo.png',
                        height: 44,
                        width: 44,
                        excavate: true,
                      }}
                    />
                    {/* Visible SVG */}
                    <QRCodeSVG
                      value={buildShortUrl(successLink.short_path)}
                      size={220}
                      level='H'
                      includeMargin
                      imageSettings={{
                        src: '/images/jmmi-logo.png',
                        height: 44,
                        width: 44,
                        excavate: true,
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className='flex w-full gap-3'>
                    <Button
                      variant='outline'
                      onClick={handleCloseModal}
                      className='flex-1 justify-center'
                    >
                      Tutup
                    </Button>
                    <Button
                      variant='primary'
                      leftIcon={Download}
                      onClick={() => downloadQRCode(successLink.short_code, buildShortUrl(successLink.short_path))}
                      className='flex-1 justify-center'
                    >
                      Download QR
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* ── FORM STATE: buat/edit short link ── */
              <>
                <div className='mb-6 flex items-start justify-between'>
                  <div>
                    <Typography as='h3' variant='h6' weight='bold' className='text-slate-900'>
                      {editingId ? 'Edit Short Link' : 'Buat Short Link Baru'}
                    </Typography>
                    <Typography variant='label' className='text-slate-500'>
                      {editingId
                        ? 'Sesuaikan pengaturan tautan pendek Anda.'
                        : 'Buat tautan baru yang lebih ringkas dan mudah dibagikan.'}
                    </Typography>
                  </div>
                  <button
                    onClick={handleCloseModal}
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
                    <Typography variant='label' className='text-slate-400'>
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
                    <Button variant='outline' onClick={handleCloseModal}>
                      Batal
                    </Button>
                    <Button type='submit' variant='primary'>
                      {editingId ? 'Simpan Perubahan' : 'Buat Short Link'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── QR VIEWER MODAL (dari tabel) ── */}
      {viewingQRLink && (
        <QRModal
          link={viewingQRLink}
          shortUrl={buildShortUrl(viewingQRLink.short_path)}
          onClose={() => setViewingQRLink(null)}
        />
      )}
    </div>
  );
}
