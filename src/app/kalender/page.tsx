'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutGrid, List, MapPin, Repeat2 } from 'lucide-react';

import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Typography from '@/components/Typography';

import { useGetCalendarEvents } from '@/app/kalender/hook/useCalendar';
import { CalendarEvent } from '@/types/entities/calendar';

const RECURRENCE_LABELS = {
  weekly: 'Setiap minggu',
  monthly: 'Setiap bulan',
  custom_period: 'Periode tertentu',
} as const;

function formatRecurrenceLabel(type: keyof typeof RECURRENCE_LABELS | null, interval: number) {
  if (!type) return 'Berulang';

  if (type === 'weekly') {
    return interval > 1 ? `Setiap ${interval} minggu` : 'Setiap minggu';
  }

  if (type === 'monthly') {
    return interval > 1 ? `Setiap ${interval} bulan` : 'Setiap bulan';
  }

  return RECURRENCE_LABELS[type];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateFromDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getLocalDate(dateString: string) {
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isSameCalendarDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isRecurringOnDate(event: CalendarEvent, candidateDate: Date) {
  const startDate = getLocalDate(event.event_date);

  if (candidateDate.getTime() < startDate.getTime()) {
    return false;
  }

  if (!event.is_recurring || !event.recurrence_type) {
    return isSameCalendarDate(candidateDate, startDate);
  }

  if (event.recurrence_type === 'monthly') {
    const monthDiff =
      (candidateDate.getFullYear() - startDate.getFullYear()) * 12 +
      (candidateDate.getMonth() - startDate.getMonth());

    return monthDiff >= 0 && monthDiff % event.recurrence_interval === 0 && candidateDate.getDate() === startDate.getDate();
  }

  const dayDiff = Math.floor((candidateDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return dayDiff >= 0 && dayDiff % (7 * event.recurrence_interval) === 0;
}

type CalendarOccurrence = {
  event: CalendarEvent;
  occurrenceDate: Date;
  dateKey: string;
};

function getEventDateTime(eventDate: string, eventTime: string) {
  const [datePart] = eventDate.split('T');
  return new Date(`${datePart}T${eventTime}:00`);
}

export default function CalendarPage() {
  const { events, isLoading, refetch } = useGetCalendarEvents(1, 1000);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');
  const [selectedDateKey, setSelectedDateKey] = React.useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredEvents = React.useMemo(() => {
    const now = new Date();

    return [...events]
      .filter((event) => {
        if (activeFilter === 'all') return true;

        const eventDateTime = getEventDateTime(event.event_date, event.event_time);
        if (activeFilter === 'upcoming') {
          return eventDateTime.getTime() >= now.getTime();
        }

        return eventDateTime.getTime() < now.getTime();
      })
      .sort((left, right) => {
        const leftTime = getEventDateTime(left.event_date, left.event_time).getTime();
        const rightTime = getEventDateTime(right.event_date, right.event_time).getTime();
        return leftTime - rightTime;
      });
  }, [activeFilter, events]);

  const filterOptions = [
    { key: 'all' as const, label: 'Semua' },
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'past' as const, label: 'Past' },
  ];

  const monthLabel = React.useMemo(
    () =>
      currentMonth.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth],
  );

  const calendarDays = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - startOffset + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return null;
      }

      return new Date(year, month, dayNumber);
    });
  }, [currentMonth]);

  const calendarOccurrences = React.useMemo<CalendarOccurrence[]>(() => {
    if (viewMode !== 'calendar') {
      return [];
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const occurrences: CalendarOccurrence[] = [];

    filteredEvents.forEach((event) => {
      for (
        let cursor = new Date(monthStart);
        cursor.getTime() <= monthEnd.getTime();
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
      ) {
        if (isRecurringOnDate(event, cursor)) {
          occurrences.push({
            event,
            occurrenceDate: cursor,
            dateKey: getDateKey(cursor),
          });
        }
      }
    });

    return occurrences.sort((left, right) => {
      const leftTime = getEventDateTime(left.occurrenceDate.toISOString(), left.event.event_time).getTime();
      const rightTime = getEventDateTime(right.occurrenceDate.toISOString(), right.event.event_time).getTime();
      return leftTime - rightTime;
    });
  }, [currentMonth, filteredEvents, viewMode]);

  const eventsByDate = React.useMemo(() => {
    const grouped = new Map<string, CalendarOccurrence[]>();

    calendarOccurrences.forEach((occurrence) => {
      const currentEvents = grouped.get(occurrence.dateKey) ?? [];
      grouped.set(occurrence.dateKey, [...currentEvents, occurrence]);
    });

    return grouped;
  }, [calendarOccurrences]);

  const selectedDay = React.useMemo(() => {
    if (!selectedDateKey) {
      return null;
    }

    const [year, month, day] = selectedDateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDateKey]);

  const selectedDayEvents = React.useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return eventsByDate.get(selectedDateKey) ?? [];
  }, [eventsByDate, selectedDateKey]);

  const monthSummary = React.useMemo(() => {
    const totalOccurrences = calendarOccurrences.length;
    const uniqueDays = new Set(calendarOccurrences.map((occurrence) => occurrence.dateKey)).size;
    const recurringOccurrences = calendarOccurrences.filter((occurrence) => occurrence.event.is_recurring).length;
    const upcomingOccurrences = calendarOccurrences
      .filter((occurrence) => {
        const occurrenceDateTime = getEventDateTime(occurrence.occurrenceDate.toISOString(), occurrence.event.event_time);
        return occurrenceDateTime.getTime() >= Date.now();
      })
      .slice(0, 5);

    return {
      totalOccurrences,
      uniqueDays,
      recurringOccurrences,
      upcomingOccurrences,
    };
  }, [calendarOccurrences]);

  const todayKey = React.useMemo(() => getDateKey(new Date()), []);

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
    setSelectedDateKey(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));
    setSelectedDateKey(null);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 py-12 px-4 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-[1312px] space-y-10'>
          {/* Header */}
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='space-y-3 max-w-2xl'>
              <h1 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#146637] tracking-tight'>
                Kalender Kegiatan
              </h1>
              <p className='font-hanken text-lg sm:text-xl text-slate-600 leading-relaxed'>
                Agenda & jadwal kegiatan JMMI ITS yang bisa dipantau secara langsung oleh seluruh publik.
              </p>
            </div>

            <button
              type='button'
              onClick={() => setViewMode((mode) => (mode === 'list' ? 'calendar' : 'list'))}
              className='inline-flex items-center justify-center gap-2 rounded-full bg-[#146637] px-6 py-3 font-sora text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0e4a28] hover:scale-105 active:scale-95 shrink-0'
            >
              {viewMode === 'list' ? (
                <>
                  <LayoutGrid className='h-4 w-4' />
                  Lihat Tampilan Kalender
                </>
              ) : (
                <>
                  <List className='h-4 w-4' />
                  Lihat Tampilan Daftar
                </>
              )}
            </button>
          </div>

          {/* Filter Pills */}
          <div className='flex flex-wrap gap-3'>
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.key;

              return (
                <button
                  key={option.key}
                  type='button'
                  onClick={() => setActiveFilter(option.key)}
                  className={`rounded-full px-5 py-2.5 font-sora text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#146637] text-white shadow-md'
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {viewMode === 'list' ? (
            filteredEvents.length === 0 ? (
              <div className='rounded-[25px] border border-gray-100 bg-gray-50/50 p-8 text-center text-slate-600 font-hanken'>
                Belum ada event terjadwal.
              </div>
            ) : (
              <div className='grid gap-4 sm:gap-6'>
                {filteredEvents.map((event) => (
                  <article
                    key={event.event_id}
                    className='rounded-[25px] border border-gray-100 bg-white p-6 text-slate-800 shadow-sm hover:shadow-xl transition-all duration-300'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <h2 className='font-sora text-xl sm:text-2xl font-bold text-slate-900'>
                        {event.event_name}
                      </h2>
                      {event.is_recurring && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-[#146637]/10 px-3 py-1 font-sora text-xs font-semibold text-[#146637]'>
                          <Repeat2 className='h-3.5 w-3.5' />
                          {formatRecurrenceLabel(event.recurrence_type, event.recurrence_interval)}
                        </span>
                      )}
                    </div>

                    <div className='mt-5 grid gap-3 sm:grid-cols-3 font-hanken text-sm text-slate-600'>
                      <div className='inline-flex items-center gap-2.5'>
                        <CalendarDays className='h-4 w-4 text-[#146637]' />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className='inline-flex items-center gap-2.5'>
                        <Clock3 className='h-4 w-4 text-[#146637]' />
                        <span>{formatTime(event.event_time)} WIB</span>
                      </div>
                      <div className='inline-flex items-center gap-2.5'>
                        <MapPin className='h-4 w-4 text-[#146637]' />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {event.notes && (
                      <p className='mt-4 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 font-hanken text-sm text-slate-600 leading-relaxed'>
                        {event.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]'>
              <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md'>
                <div className='flex items-center justify-between gap-3 border-b border-gray-100 pb-5'>
                  <button
                    type='button'
                    onClick={goToPreviousMonth}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#146637] shadow-sm transition-all hover:border-[#146637] hover:bg-[#146637] hover:text-white active:scale-95'
                    aria-label='Bulan sebelumnya'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>

                  <h2 className='font-sora text-xl font-bold text-slate-900 text-center capitalize'>
                    {monthLabel}
                  </h2>

                  <button
                    type='button'
                    onClick={goToNextMonth}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#146637] shadow-sm transition-all hover:border-[#146637] hover:bg-[#146637] hover:text-white active:scale-95'
                    aria-label='Bulan berikutnya'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </div>

                <div className='mt-5 grid grid-cols-7 gap-2 text-center font-sora text-xs font-bold uppercase tracking-wider text-slate-400'>
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className='mt-4 grid grid-cols-7 gap-2'>
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className='min-h-24 rounded-2xl bg-gray-50/50' />;
                    }

                    const dateKey = getDateKey(day);
                    const dayEvents = eventsByDate.get(dateKey) ?? [];
                    const isToday = dateKey === todayKey;

                    return (
                      <div
                        key={dateKey}
                        role='button'
                        tabIndex={0}
                        onClick={() => setSelectedDateKey(dateKey)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedDateKey(dateKey);
                          }
                        }}
                        className={`min-h-24 cursor-pointer rounded-2xl border p-2 text-left transition-all duration-200 ${
                          isToday ? 'border-[#146637] bg-[#146637]/5' : 'border-gray-100 bg-white hover:border-[#146637]/40'
                        } ${selectedDateKey === dateKey ? 'ring-2 ring-[#146637]' : ''}`}
                      >
                        <div className='flex items-center justify-between gap-1'>
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-sora text-xs font-bold ${
                              isToday ? 'bg-[#146637] text-white' : 'text-slate-700'
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          {dayEvents.length > 0 && (
                            <span className='rounded-full bg-[#146637]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#146637]'>
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        <div className='mt-2 space-y-1.5'>
                          {dayEvents.slice(0, 2).map((occurrence) => (
                            <div
                              key={`${occurrence.event.event_id}-${occurrence.dateKey}`}
                              className={`rounded-xl px-2 py-1 text-[11px] leading-tight font-hanken ${
                                occurrence.event.is_recurring ? 'bg-[#146637]/10 text-[#146637]' : 'bg-sky-50 text-sky-700'
                              }`}
                            >
                              <p className='truncate font-bold'>{occurrence.event.event_name}</p>
                              <p className='truncate text-[10px] text-slate-500'>{formatTime(occurrence.event.event_time)} WIB</p>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <p className='text-[10px] font-semibold text-slate-400'>+{dayEvents.length - 2} lainnya</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Summary */}
              <aside className='space-y-6 rounded-[25px] border border-gray-100 bg-gray-50/60 p-6 shadow-md'>
                <div>
                  <p className='font-sora text-xs font-bold uppercase tracking-wider text-[#146637]'>Ringkasan Bulan</p>
                  <h3 className='font-sora mt-1 text-2xl font-bold text-slate-900 capitalize'>{monthLabel}</h3>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-2xl bg-white border border-gray-100 p-4 shadow-sm'>
                    <p className='font-hanken text-xs text-slate-500'>Occurrence</p>
                    <p className='font-sora mt-1 text-2xl font-extrabold text-slate-900'>{monthSummary.totalOccurrences}</p>
                  </div>
                  <div className='rounded-2xl bg-white border border-gray-100 p-4 shadow-sm'>
                    <p className='font-hanken text-xs text-slate-500'>Hari Aktif</p>
                    <p className='font-sora mt-1 text-2xl font-extrabold text-slate-900'>{monthSummary.uniqueDays}</p>
                  </div>
                  <div className='rounded-2xl bg-white border border-gray-100 p-4 shadow-sm'>
                    <p className='font-hanken text-xs text-slate-500'>Berulang</p>
                    <p className='font-sora mt-1 text-2xl font-extrabold text-slate-900'>{monthSummary.recurringOccurrences}</p>
                  </div>
                  <div className='rounded-2xl bg-white border border-gray-100 p-4 shadow-sm'>
                    <p className='font-hanken text-xs text-slate-500'>Filter</p>
                    <p className='font-sora mt-1 text-base font-bold text-[#146637] capitalize'>{activeFilter}</p>
                  </div>
                </div>

                {/* Selected Day Info */}
                <div className='rounded-2xl bg-white border border-gray-100 p-4 space-y-3 shadow-sm'>
                  <div className='flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5'>
                    <div>
                      <p className='font-sora text-sm font-bold text-slate-900'>Tanggal Terpilih</p>
                    </div>
                    {selectedDay && (
                      <button
                        type='button'
                        onClick={() => setSelectedDateKey(null)}
                        className='rounded-full bg-gray-100 px-3 py-1 font-sora text-xs font-semibold text-slate-600 hover:bg-gray-200 transition-colors'
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {selectedDay ? (
                    <div className='space-y-3'>
                      <p className='font-sora text-sm font-bold text-[#146637]'>{formatShortDate(selectedDay)}</p>

                      {selectedDayEvents.length === 0 ? (
                        <p className='font-hanken text-xs text-slate-500'>Tidak ada event pada tanggal ini.</p>
                      ) : (
                        <div className='space-y-2.5'>
                          {selectedDayEvents.map((occurrence) => (
                            <div
                              key={`${occurrence.event.event_id}-${occurrence.dateKey}`}
                              className='rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1'
                            >
                              <div className='flex items-start justify-between gap-2'>
                                <p className='font-sora text-xs font-bold text-slate-900'>{occurrence.event.event_name}</p>
                                <span className='rounded-full bg-[#146637]/10 px-2 py-0.5 font-sora text-[10px] font-semibold text-[#146637]'>
                                  {occurrence.event.is_recurring ? 'Berulang' : 'Non-berulang'}
                                </span>
                              </div>
                              <p className='font-hanken text-xs text-slate-500'>{formatTime(occurrence.event.event_time)} WIB • {occurrence.event.location}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className='font-hanken text-xs text-slate-500'>Klik tanggal pada kalender untuk melihat rincian agenda.</p>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className='space-y-3'>
                  <p className='font-sora text-sm font-bold text-slate-900'>Event Terdekat</p>
                  {monthSummary.upcomingOccurrences.length === 0 ? (
                    <p className='font-hanken text-xs text-slate-500'>Tidak ada event berikutnya bulan ini.</p>
                  ) : (
                    <div className='space-y-2.5'>
                      {monthSummary.upcomingOccurrences.map((occurrence) => (
                        <div key={`${occurrence.event.event_id}-${occurrence.dateKey}`} className='rounded-2xl bg-white border border-gray-100 p-3.5 shadow-sm space-y-1'>
                          <p className='font-sora text-xs font-bold text-slate-900'>{occurrence.event.event_name}</p>
                          <p className='font-hanken text-xs text-slate-500'>
                            {formatDateFromDate(occurrence.occurrenceDate)} • {formatTime(occurrence.event.event_time)} WIB
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}

          <div className='pt-6'>
            <BackButton href='/' />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
