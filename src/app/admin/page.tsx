'use client';

import { useMemo } from 'react';

import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { useGetFinanceReport } from './hook/useFinance';
import { useGetAllCalendarEvents } from './hook/useCalendar';
import useAuthStore from '@/stores/useAuthStore';

type WeeklyPoint = {
  key: string;
  label: string;
  weekdayLabel: string;
  income: number;
  expenses: number;
  balance: number;
};

type ReminderEvent = {
  id?: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  note: string;
};

interface FinanceTransaction {
  transaction_id: string;
  type: 'income' | 'expenses';
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}



function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function buildWeeklySeries(transactions: FinanceTransaction[]) {
  const today = startOfDay(new Date());
  const lookup = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date);
    if (Number.isNaN(date.getTime())) return;

    const key = getDateKey(startOfDay(date));
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };

    if (transaction.type === 'income') {
      current.income += transaction.amount;
    } else {
      current.expenses += transaction.amount;
    }

    lookup.set(key, current);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = getDateKey(date);
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };

    return {
      key,
      label: formatDateLabel(date),
      weekdayLabel: date
        .toLocaleDateString('id-ID', { weekday: 'short' })
        .replace('.', ''),
      income: current.income,
      expenses: current.expenses,
      balance: current.income - current.expenses,
    };
  });
}

function buildPath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function FinanceLineChart({ data }: { data: WeeklyPoint[] }) {
  const width = 720;
  const height = 300;
  const paddingX = 44;
  const paddingY = 28;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expenses]));
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

  const seriesToPoints = (selector: (item: WeeklyPoint) => number) => {
    return data.map((item, index) => {
      const value = selector(item);
      const x = paddingX + stepX * index;
      const y = height - paddingY - (value / maxValue) * innerHeight;
      return { x, y };
    });
  };

  const incomePoints = seriesToPoints((item) => item.income);
  const expensePoints = seriesToPoints((item) => item.expenses);
  const incomePath = buildPath(incomePoints);
  const expensePath = buildPath(expensePoints);
  const incomeAreaPath = `${incomePath} L ${incomePoints[incomePoints.length - 1]?.x ?? paddingX} ${height - paddingY} L ${incomePoints[0]?.x ?? paddingX} ${height - paddingY} Z`;

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = (index + 1) / 5;
    return height - paddingY - innerHeight * ratio;
  });

  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-700'>
            Grafik keuangan 7 hari
          </p>
          <h2 className='mt-1 text-2xl font-semibold text-slate-900'>Tren pemasukan dan pengeluaran</h2>
        </div>
        <div className='flex flex-wrap gap-3 text-sm'>
          <div className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700'>
            <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
            Pemasukan
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80'>
        <svg viewBox={`0 0 ${width} ${height}`} className='h-auto w-full'>
          <defs>
            <linearGradient id='incomeFill' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='rgb(16 185 129 / 0.26)' />
              <stop offset='100%' stopColor='rgb(16 185 129 / 0.02)' />
            </linearGradient>
          </defs>

          {gridLines.map((lineY) => (
            <line
              key={lineY}
              x1={paddingX}
              x2={width - paddingX}
              y1={lineY}
              y2={lineY}
              stroke='rgb(148 163 184 / 0.35)'
              strokeDasharray='6 6'
            />
          ))}

          <path d={incomeAreaPath} fill='url(#incomeFill)' />
          <path d={incomePath} fill='none' stroke='rgb(5 150 105)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
          <path d={expensePath} fill='none' stroke='rgb(244 63 94)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='12 8' />

          {incomePoints.map((point, index) => (
            <g key={`income-${data[index]?.key ?? index}`}>
              <circle cx={point.x} cy={point.y} r='5.5' fill='white' stroke='rgb(5 150 105)' strokeWidth='3' />
              <text x={point.x} y={height - 10} textAnchor='middle' fill='rgb(71 85 105)' fontSize='12'>
                {data[index]?.weekdayLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {data.map((item) => (
          <div key={item.key} className='rounded-2xl border border-slate-200 bg-white px-4 py-3'>
            <p className='text-sm font-medium text-slate-700'>{item.label}</p>
            <div className='mt-2 space-y-1 text-sm'>
              <p className='text-emerald-700'>Masuk Rp {formatCurrency(item.income)}</p>
              <p className='text-rose-700'>Keluar Rp {formatCurrency(item.expenses)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof BarChart3;
  tone: 'emerald' | 'rose' | 'amber' | 'slate';
}) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
  };

  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-slate-500'>{title}</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>{value}</p>
          <p className='mt-2 text-sm text-slate-500'>{description}</p>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${toneClasses[tone]}`}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </div>
  );
}

function UpcomingEventCard({ events }: { events: ReminderEvent[] }) {
  const nextEvent = events[0];

  if (!nextEvent) {
    return (
      <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-700'>Pengingat event</p>
            <h2 className='mt-1 text-2xl font-semibold text-slate-900'>Agenda terdekat dalam 7 hari</h2>
          </div>
          <div className='rounded-2xl bg-brand-yellow/20 p-3 text-brand-green-700 ring-1 ring-brand-yellow/40'>
            <CalendarClock className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-6 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500'>
          Belum ada agenda dalam 7 hari ke depan.
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-700'>Pengingat event</p>
          <h2 className='mt-1 text-2xl font-semibold text-slate-900'>Agenda terdekat dalam 7 hari</h2>
        </div>
        <div className='rounded-2xl bg-brand-yellow/20 p-3 text-brand-green-700 ring-1 ring-brand-yellow/40'>
          <CalendarClock className='h-5 w-5' />
        </div>
      </div>

      <div className='mt-6 rounded-3xl bg-gradient-to-br from-brand-green-700 to-brand-green-500 p-5 text-white shadow-lg'>
        <p className='text-sm uppercase tracking-[0.18em] text-white/75'>Event berikutnya</p>
        <h3 className='mt-3 text-xl font-semibold'>{nextEvent.title}</h3>
        <div className='mt-4 grid gap-3 text-sm text-white/90 sm:grid-cols-2'>
          <div>
            <p className='text-white/60'>Tanggal</p>
            <p className='mt-1 font-medium'>{nextEvent.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div>
            <p className='text-white/60'>Waktu</p>
            <p className='mt-1 font-medium'>{nextEvent.time}</p>
          </div>
          <div>
            <p className='text-white/60'>Lokasi</p>
            <p className='mt-1 font-medium'>{nextEvent.location}</p>
          </div>
          <div>
            <p className='text-white/60'>Catatan</p>
            <p className='mt-1 font-medium'>{nextEvent.note}</p>
          </div>
        </div>
      </div>

      <div className='mt-5 space-y-3'>
        {events.slice(1).map((event, i) => (
          <div key={event.id || `${event.title}-${i}`} className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='font-medium text-slate-900'>{event.title}</p>
                <p className='mt-1 text-sm text-slate-500'>
                  {event.date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {event.time}
                </p>
              </div>
              <span className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-700 ring-1 ring-brand-green-700/20'>
                Minggu ini
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const user = useAuthStore.useUser();
  const { data: reportData } = useGetFinanceReport();
  const { data: calendarPagination } = useGetAllCalendarEvents(1, 50);

  const transactions = reportData?.transactions || [];
  const calendarEvents = calendarPagination?.data || [];

  const totalIncome = reportData?.total_income || 0;
  const totalExpense = reportData?.total_expense || 0;
  const balance = reportData?.current_balance || 0;

  const weeklySeries = useMemo(() => buildWeeklySeries(transactions), [transactions]);

  const reminderEvents = useMemo(() => {
    const today = startOfDay(new Date());

    return calendarEvents
      .map((event: any) => {
        const baseDate = new Date(event.event_date);
        return {
          id: event.event_id,
          title: event.event_name,
          date: baseDate,
          time: event.event_time,
          location: event.location,
          note: event.notes ?? '',
        };
      })
      .filter((ev) => ev.date.getTime() >= today.getTime() && ev.date.getTime() <= addDays(today, 7).getTime())
      .sort((a, b) => {
         const dateDiff = a.date.getTime() - b.date.getTime();
         if (dateDiff !== 0) return dateDiff;
         return a.time.localeCompare(b.time);
      });
  }, [calendarEvents]);

  return (
    <div className='space-y-8'>
      <section className='overflow-hidden rounded-3xl bg-gradient-to-r from-brand-green-700 via-brand-green-700 to-brand-yellow p-6 text-white shadow-lg sm:p-8'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-3xl'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 ring-1 ring-white/15'>
              <CircleDollarSign className='h-4 w-4' />
              Admin dashboard
            </div>
            <h1 className='mt-4 text-3xl font-semibold tracking-tight sm:text-4xl'>
              Selamat datang{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base'>
              Pantau tren keuangan, cek agenda terdekat, dan akses menu admin yang sedang disiapkan.
            </p>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard
          title='Total pemasukan'
          value={`Rp ${formatCurrency(totalIncome)}`}
          description='Akumulasi seluruh pemasukan yang tercatat.'
          icon={TrendingUp}
          tone='emerald'
        />
        <MetricCard
          title='Total pengeluaran'
          value={`Rp ${formatCurrency(totalExpense)}`}
          description='Akumulasi seluruh pengeluaran yang tercatat.'
          icon={TrendingDown}
          tone='rose'
        />
        <MetricCard
          title='Saldo berjalan'
          value={`Rp ${formatCurrency(balance)}`}
          description='Selisih pemasukan dan pengeluaran saat ini.'
          icon={CircleDollarSign}
          tone='amber'
        />
        <MetricCard
          title='Jumlah transaksi'
          value={String(transactions.length)}
          description='Total transaksi yang sudah tersimpan di sistem.'
          icon={BarChart3}
          tone='slate'
        />
      </section>

      <div className='grid gap-6 xl:grid-cols-[1fr_1.55fr]'>
        <UpcomingEventCard events={reminderEvents} />
        <FinanceLineChart data={weeklySeries} />
      </div>
    </div>
  );
}