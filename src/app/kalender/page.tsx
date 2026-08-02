'use client';

import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutGrid, List, MapPin, Repeat2 } from 'lucide-react';

import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';
import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import ProfileHeader from '@/components/links/ProfileHeader';
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
    <LinksLayoutWrapper>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <ProfileHeader />

        <div className='w-full max-w-6xl space-y-6'>
          <div className='rounded-2xl border border-white/20 bg-white/10 p-5 text-white backdrop-blur-sm sm:p-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <div className='flex items-center gap-2 text-brand-yellow'>
                  <CalendarDays className='h-5 w-5' />
                  <Typography as='h1' variant='h6' className='text-white'>
                    Kalender Kegiatan
                  </Typography>
                </div>
                <Typography as='p' variant='body' className='mt-2 text-white/80'>
                  Agenda kegiatan JMMI yang bisa dipantau oleh seluruh publik.
                </Typography>
              </div>

              <button
                type='button'
                onClick={() => setViewMode((mode) => (mode === 'list' ? 'calendar' : 'list'))}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-black transition-colors hover:bg-brand-yellow/90'
              >
                {viewMode === 'list' ? (
                  <>
                    <LayoutGrid className='h-4 w-4' />
                    Lihat tampilan kalender
                  </>
                ) : (
                  <>
                    <List className='h-4 w-4' />
                    Lihat tampilan daftar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            {filterOptions.map((option) => {
              const isActive = activeFilter === option.key;

              return (
                <button
                  key={option.key}
                  type='button'
                  onClick={() => setActiveFilter(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-yellow text-brand-black shadow-sm'
                      : 'bg-white/10 text-white/85 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {viewMode === 'list' ? (
            filteredEvents.length === 0 ? (
              <div className='rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-white/80 backdrop-blur-sm'>
                Belum ada event terjadwal.
              </div>
            ) : (
              <div className='space-y-4'>
                {filteredEvents.map((event) => (
                  <article
                    key={event.event_id}
                    className='rounded-2xl border border-white/20 bg-white/10 p-5 text-white shadow-md backdrop-blur-sm'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <Typography as='h2' variant='h6' className='text-white'>
                        {event.event_name}
                      </Typography>
                      {event.is_recurring && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-300/20 px-2.5 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/40'>
                          <Repeat2 className='h-3.5 w-3.5' />
                          {formatRecurrenceLabel(event.recurrence_type, event.recurrence_interval)}
                        </span>
                      )}
                    </div>

                    <div className='mt-4 grid gap-2 text-sm text-white/85'>
                      <div className='inline-flex items-center gap-2'>
                        <CalendarDays className='h-4 w-4 text-brand-yellow' />
                        {formatDate(event.event_date)}
                      </div>
                      <div className='inline-flex items-center gap-2'>
                        <Clock3 className='h-4 w-4 text-brand-yellow' />
                        {formatTime(event.event_time)} WIB
                      </div>
                      <div className='inline-flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-brand-yellow' />
                        {event.location}
                      </div>
                    </div>

                    {event.notes && (
                      <p className='mt-4 rounded-xl bg-black/20 px-3 py-2 text-sm text-white/85'>
                        {event.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )
          ) : (
            <div className='grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px] lg:gap-5'>
              <div className='rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-md backdrop-blur-sm sm:p-5'>
                <div className='flex items-center justify-between gap-3 border-b border-white/15 pb-4'>
                  <button
                    type='button'
                    onClick={goToPreviousMonth}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'
                    aria-label='Bulan sebelumnya'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>

                  <Typography as='h2' variant='h6' className='text-center text-white'>
                    {monthLabel}
                  </Typography>

                  <button
                    type='button'
                    onClick={goToNextMonth}
                    className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20'
                    aria-label='Bulan berikutnya'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </div>

                <div className='mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 sm:gap-2 sm:text-xs sm:tracking-[0.18em]'>
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className='mt-3 grid grid-cols-7 gap-1.5 sm:gap-2'>
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className='min-h-24 rounded-xl bg-white/5 sm:min-h-28 sm:rounded-2xl' />;
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
                        className={`min-h-24 cursor-pointer rounded-xl border p-1.5 text-left transition-colors hover:border-brand-yellow/70 hover:bg-brand-yellow/10 sm:min-h-28 sm:rounded-2xl sm:p-2 ${
                          isToday ? 'border-brand-yellow bg-brand-yellow/10' : 'border-white/10 bg-white/5'
                        } ${selectedDateKey === dateKey ? 'ring-2 ring-brand-yellow/60' : ''}`}
                      >
                        <div className='flex items-center justify-between gap-1 sm:gap-2'>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-sm ${
                              isToday ? 'bg-brand-yellow text-brand-black' : 'text-white'
                            }`}
                          >
                            {day.getDate()}
                          </span>

                          {dayEvents.length > 0 && (
                            <span className='rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-white/75 sm:px-2 sm:text-[11px]'>
                              {dayEvents.length} event
                            </span>
                          )}
                        </div>

                        <div className='mt-1.5 space-y-1 sm:mt-2 sm:space-y-1.5'>
                          {dayEvents.slice(0, 3).map((occurrence) => (
                            <div
                              key={`${occurrence.event.event_id}-${occurrence.dateKey}`}
                              className={`rounded-lg px-1.5 py-1 text-[10px] leading-tight text-white sm:rounded-xl sm:px-2 sm:py-1.5 sm:text-[11px] sm:leading-snug ${
                                occurrence.event.is_recurring ? 'bg-emerald-400/20 ring-1 ring-emerald-200/40' : 'bg-sky-400/20 ring-1 ring-sky-200/40'
                              }`}
                            >
                              <div className='flex items-center gap-1'>
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    occurrence.event.is_recurring ? 'bg-emerald-300' : 'bg-sky-300'
                                  }`}
                                />
                                <p className='truncate font-semibold'>{occurrence.event.event_name}</p>
                              </div>
                              <p className='truncate text-white/70'>{formatTime(occurrence.event.event_time)} WIB</p>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <p className='px-0.5 text-[10px] text-white/70 sm:px-1 sm:text-[11px]'>+{dayEvents.length - 3} event lainnya</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className='space-y-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-md backdrop-blur-sm sm:p-5'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow'>Ringkasan bulan</p>
                  <h3 className='mt-2 text-xl font-semibold'>{monthLabel}</h3>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='rounded-2xl bg-black/15 p-3'>
                    <p className='text-xs text-white/65'>Occurrence</p>
                    <p className='mt-1 text-2xl font-semibold'>{monthSummary.totalOccurrences}</p>
                  </div>
                  <div className='rounded-2xl bg-black/15 p-3'>
                    <p className='text-xs text-white/65'>Hari aktif</p>
                    <p className='mt-1 text-2xl font-semibold'>{monthSummary.uniqueDays}</p>
                  </div>
                  <div className='rounded-2xl bg-black/15 p-3'>
                    <p className='text-xs text-white/65'>Berulang</p>
                    <p className='mt-1 text-2xl font-semibold'>{monthSummary.recurringOccurrences}</p>
                  </div>
                  <div className='rounded-2xl bg-black/15 p-3'>
                    <p className='text-xs text-white/65'>Filter aktif</p>
                    <p className='mt-1 text-lg font-semibold capitalize'>{activeFilter}</p>
                  </div>
                </div>

                <div className='rounded-2xl bg-black/15 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-white'>Tanggal terpilih</p>
                      <p className='mt-1 text-xs text-white/70'>Klik tanggal di kalender untuk melihat daftarnya.</p>
                    </div>
                    {selectedDay && (
                      <button
                        type='button'
                        onClick={() => setSelectedDateKey(null)}
                        className='rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20'
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {selectedDay ? (
                    <div className='mt-3 space-y-2'>
                      <p className='text-sm font-semibold text-brand-yellow'>{formatShortDate(selectedDay)}</p>

                      {selectedDayEvents.length === 0 ? (
                        <div className='rounded-2xl bg-black/15 p-4 text-sm text-white/75'>
                          Tidak ada event pada tanggal ini.
                        </div>
                      ) : (
                        <div className='space-y-2'>
                          {selectedDayEvents.map((occurrence) => (
                            <div
                              key={`${occurrence.event.event_id}-${occurrence.dateKey}`}
                              className={`rounded-2xl p-3 ${
                                occurrence.event.is_recurring ? 'bg-emerald-400/15 ring-1 ring-emerald-200/30' : 'bg-sky-400/15 ring-1 ring-sky-200/30'
                              }`}
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div>
                                  <p className='font-semibold text-white'>{occurrence.event.event_name}</p>
                                  <p className='mt-1 text-xs text-white/70'>{formatTime(occurrence.event.event_time)} WIB</p>
                                </div>
                                <span className='rounded-full bg-black/20 px-2 py-1 text-[11px] text-white/75'>
                                  {occurrence.event.is_recurring ? 'Berulang' : 'Non-berulang'}
                                </span>
                              </div>

                              <p className='mt-2 text-xs text-white/70'>{occurrence.event.location}</p>

                              {occurrence.event.notes && (
                                <p className='mt-2 rounded-xl bg-black/15 px-3 py-2 text-xs text-white/85'>
                                  {occurrence.event.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='mt-3 rounded-2xl bg-black/15 p-4 text-sm text-white/75'>
                      Belum ada tanggal dipilih.
                    </div>
                  )}
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold text-white'>Event terdekat</p>
                    <span className='text-xs text-white/60'>{monthSummary.upcomingOccurrences.length} item</span>
                  </div>

                  {monthSummary.upcomingOccurrences.length === 0 ? (
                    <div className='rounded-2xl bg-black/15 p-4 text-sm text-white/75'>
                      Tidak ada event berikutnya pada bulan ini.
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {monthSummary.upcomingOccurrences.map((occurrence) => (
                        <div key={`${occurrence.event.event_id}-${occurrence.dateKey}`} className='rounded-2xl bg-black/15 p-3'>
                          <p className='text-sm font-semibold'>{occurrence.event.event_name}</p>
                          <p className='mt-1 text-xs text-white/70'>
                            {formatDateFromDate(occurrence.occurrenceDate)} • {formatTime(occurrence.event.event_time)} WIB
                          </p>
                          {occurrence.event.is_recurring && (
                            <p className='mt-1 text-xs text-emerald-100'>
                              {formatRecurrenceLabel(occurrence.event.recurrence_type, occurrence.event.recurrence_interval)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}

          <BackButton href='/' />
        </div>
      </div>
    </LinksLayoutWrapper>
  );
}
