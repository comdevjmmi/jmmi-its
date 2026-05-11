'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Edit2, MapPin, Plus, Repeat2, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import Button from '@/components/buttons/Button';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useGetAllCalendarEvents,
  useUpdateCalendarEvent,
} from '@/app/admin/hook/useCalendar';
import { CalendarEvent, CalendarRecurrenceType } from '@/types/entities/calendar';

type CalendarFormState = {
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  is_recurring: boolean;
  recurrence_type: CalendarRecurrenceType;
  recurrence_interval: number;
  notes: string;
};

const RECURRENCE_LABELS: Record<CalendarRecurrenceType, string> = {
  weekly: 'Setiap minggu',
  monthly: 'Setiap bulan',
  custom_period: 'Periode tertentu',
};

const PAGE_SIZE = 8;

function formatRecurrenceLabel(type: CalendarRecurrenceType | null, interval: number) {
  if (!type) return 'Berulang';

  if (type === 'weekly') {
    return interval > 1 ? `Setiap ${interval} minggu` : 'Setiap minggu';
  }

  if (type === 'monthly') {
    return interval > 1 ? `Setiap ${interval} bulan` : 'Setiap bulan';
  }

  return RECURRENCE_LABELS[type];
}

const INITIAL_FORM: CalendarFormState = {
  event_name: '',
  event_date: new Date().toISOString().split('T')[0],
  event_time: '08:00',
  location: '',
  is_recurring: false,
  recurrence_type: 'weekly',
  recurrence_interval: 1,
  notes: '',
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminCalendarPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<CalendarFormState>(INITIAL_FORM);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: paginationData, isLoading } = useGetAllCalendarEvents(currentPage, PAGE_SIZE, search);
  const events = paginationData?.data || [];
  const totalEvents = paginationData?.total || 0;
  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  const totalPages = Math.max(1, Math.ceil(totalEvents / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormState(INITIAL_FORM);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormState(INITIAL_FORM);
    setShowForm(true);
  };

  const openEditForm = (event: CalendarEvent) => {
    setEditingId(event.event_id);
    setFormState({
      event_name: event.event_name,
      event_date: event.event_date.split('T')[0],
      event_time: event.event_time,
      location: event.location,
      is_recurring: event.is_recurring,
      recurrence_type: event.recurrence_type ?? 'weekly',
      recurrence_interval: event.recurrence_interval || 1,
      notes: event.notes ?? '',
    });
    setShowForm(true);
  };

  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['calendar-events-admin'] });
    await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.event_name.trim() || !formState.location.trim()) {
      showToast('Nama event dan lokasi wajib diisi', DANGER_TOAST);
      return;
    }

    const payload = {
      event_name: formState.event_name.trim(),
      event_date: formState.event_date,
      event_time: formState.event_time,
      location: formState.location.trim(),
      is_recurring: formState.is_recurring,
      recurrence_type: formState.is_recurring ? formState.recurrence_type : null,
      recurrence_interval: formState.is_recurring ? formState.recurrence_interval : 1,
      notes: formState.notes.trim(),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        showToast('Event berhasil diperbarui', SUCCESS_TOAST);
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Event berhasil ditambahkan', SUCCESS_TOAST);
      }

      await refreshData();
      setSearch('');
      closeForm();
    } catch {
      showToast('Gagal menyimpan event', DANGER_TOAST);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus event ini?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      showToast('Event berhasil dihapus', SUCCESS_TOAST);
      await refreshData();
    } catch {
      showToast('Gagal menghapus event', DANGER_TOAST);
    }
  };

  return (
    <div className='space-y-6'>
      <section className='overflow-hidden rounded-3xl bg-gradient-to-r from-brand-green-700 via-brand-green-700 to-brand-yellow p-6 text-white shadow-lg sm:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/80'>Panel kalender</p>
            <h1 className='mt-2 text-3xl font-semibold tracking-tight'>Kelola event organisasi</h1>
            <p className='mt-2 text-sm text-white/85'>
              Tambahkan event publik, atur jadwal, dan tandai event yang berulang.
            </p>
          </div>
          <Button variant='light' leftIcon={Plus} onClick={openCreateForm}>
            Tambah Event
          </Button>
        </div>
      </section>

      <section className='rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-slate-200 px-6 py-5'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-700'>Daftar event</p>
            <h2 className='mt-1 text-2xl font-semibold text-slate-900'>Agenda kalender</h2>
          </div>
        </div>

        <div className='border-b border-slate-200 px-6 py-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='relative w-full sm:max-w-md'>
              <input
                type='text'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Cari nama event, lokasi, catatan...'
                className='w-full rounded-xl border border-slate-300 px-4 py-2.5 pl-11 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
              />
              <svg
                aria-hidden='true'
                viewBox='0 0 24 24'
                className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400'
              >
                <path
                  fill='currentColor'
                  d='M10 4a6 6 0 104.472 10.028l4.75 4.75 1.414-1.414-4.75-4.75A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z'
                />
              </svg>
            </div>

            <span className='rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700'>
              {totalEvents} event
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className='px-6 py-8 text-center text-slate-500'>Memuat event...</div>
        ) : events.length === 0 ? (
          <div className='px-6 py-8 text-center text-slate-500'>Belum ada event pada kalender.</div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {events.map((event) => (
              <article key={event.event_id} className='px-6 py-5'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-lg font-semibold text-slate-900'>{event.event_name}</h3>
                      {event.is_recurring && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700'>
                          <Repeat2 className='h-3.5 w-3.5' />
                          {formatRecurrenceLabel(event.recurrence_type, event.recurrence_interval)}
                        </span>
                      )}
                    </div>

                    <div className='grid gap-2 text-sm text-slate-600'>
                      <p className='inline-flex items-center gap-2'>
                        <CalendarDays className='h-4 w-4 text-brand-green-700' />
                        {formatDate(event.event_date)}
                      </p>
                      <p className='inline-flex items-center gap-2'>
                        <Clock3 className='h-4 w-4 text-brand-green-700' />
                        {event.event_time} WIB
                      </p>
                      <p className='inline-flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-brand-green-700' />
                        {event.location}
                      </p>
                    </div>

                    {event.notes && (
                      <p className='rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700'>
                        {event.notes}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      leftIcon={Edit2}
                      onClick={() => openEditForm(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      leftIcon={Trash2}
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(event.event_id)}
                      className='border-red-300 text-red-600 hover:bg-red-50'
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalEvents > 0 && (
          <div className='flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-slate-600'>
              Menampilkan {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalEvents)}-
              {Math.min(currentPage * PAGE_SIZE, totalEvents)} dari {totalEvents} event
            </p>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Sebelumnya
              </Button>

              <span className='rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700'>
                {currentPage} / {totalPages}
              </span>

              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
          onClick={closeForm}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='calendar-event-form-title'
            className='w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl'
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id='calendar-event-form-title' className='mb-4 text-lg font-semibold text-slate-900'>
              {editingId ? 'Edit Event' : 'Tambah Event Baru'}
            </h3>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700'>Nama event</label>
                <input
                  type='text'
                  value={formState.event_name}
                  onChange={(event) => setFormState({ ...formState, event_name: event.target.value })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                  placeholder='Contoh: Kajian rutin pekanan'
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-slate-700'>Tanggal</label>
                  <input
                    type='date'
                    value={formState.event_date}
                    onChange={(event) => setFormState({ ...formState, event_date: event.target.value })}
                    className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700'>Waktu</label>
                  <input
                    type='time'
                    value={formState.event_time}
                    onChange={(event) => setFormState({ ...formState, event_time: event.target.value })}
                    className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Lokasi</label>
                <input
                  type='text'
                  value={formState.location}
                  onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                  placeholder='Contoh: Masjid Manarul Ilmi'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Catatan</label>
                <textarea
                  value={formState.notes}
                  onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                  placeholder='Catatan tambahan (opsional)'
                  rows={3}
                />
              </div>

              <label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
                <input
                  type='checkbox'
                  checked={formState.is_recurring}
                  onChange={(event) => setFormState({ ...formState, is_recurring: event.target.checked })}
                  className='h-4 w-4 rounded border-slate-300 text-brand-green-700 focus:ring-brand-green-700/30'
                />
                Event berulang
              </label>

              {formState.is_recurring && (
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700'>Tipe perulangan</label>
                    <select
                      value={formState.recurrence_type}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          recurrence_type: event.target.value as CalendarRecurrenceType,
                        })
                      }
                      className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                    >
                      <option value='weekly'>Mingguan</option>
                      <option value='monthly'>Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-slate-700'>Interval</label>
                    <input
                      type='number'
                      min={1}
                      step={1}
                      value={formState.recurrence_interval}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          recurrence_interval: Number(event.target.value) || 1,
                        })
                      }
                      className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                      placeholder='Contoh: 2'
                    />
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-3 pt-2'>
                <Button type='button' variant='outline' onClick={closeForm}>
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? 'Simpan perubahan' : 'Tambah event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
