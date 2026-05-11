'use client';

import * as React from 'react';

import Loading from '@/components/Loading';
import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import ProfileHeader from '@/components/links/ProfileHeader';
import Typography from '@/components/Typography';

import { IoChevronBack } from 'react-icons/io5';

import { useGetFinanceReport, useGetFinanceTransactions } from '@/app/finance/hook/useFinance';

import { FinanceTransaction } from '@/types/entities/finance';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
});

type WeeklyPoint = {
  key: string;
  label: string;
  weekdayLabel: string;
  income: number;
  expenses: number;
  balance: number;
};

// --- Utilities for Chart ---
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
    <div className='rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm sm:p-6 w-full'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400'>
            Grafik keuangan 7 hari
          </p>
          <h2 className='mt-1 text-2xl font-semibold text-white'>Tren pemasukan dan pengeluaran</h2>
        </div>
        <div className='flex flex-wrap gap-3 text-sm'>
          <div className='inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-emerald-300'>
            <span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />
            Pemasukan
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1.5 text-rose-300'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-400' />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20'>
        <svg viewBox={`0 0 ${width} ${height}`} className='h-auto w-full'>
          <defs>
            <linearGradient id='incomeFillDark' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='rgba(52, 211, 153, 0.25)' />
              <stop offset='100%' stopColor='rgba(52, 211, 153, 0.02)' />
            </linearGradient>
          </defs>

          {gridLines.map((lineY) => (
            <line
              key={lineY}
              x1={paddingX}
              x2={width - paddingX}
              y1={lineY}
              y2={lineY}
              stroke='rgba(255, 255, 255, 0.15)'
              strokeDasharray='6 6'
            />
          ))}

          <path d={incomeAreaPath} fill='url(#incomeFillDark)' />
          <path d={incomePath} fill='none' stroke='rgb(52 211 153)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
          <path d={expensePath} fill='none' stroke='rgb(251 113 133)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='12 8' />

          {incomePoints.map((point, index) => (
            <g key={`income-${data[index]?.key ?? index}`}>
              <circle cx={point.x} cy={point.y} r='5.5' fill='#1e293b' stroke='rgb(52 211 153)' strokeWidth='3' />
              <text x={point.x} y={height - 10} textAnchor='middle' fill='rgba(255, 255, 255, 0.7)' fontSize='12'>
                {data[index]?.weekdayLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {data.map((item) => (
          <div key={item.key} className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
            <p className='text-sm font-medium text-white/90'>{item.label}</p>
            <div className='mt-2 space-y-1 text-sm'>
              <p className='text-emerald-400'>Masuk {currencyFormatter.format(item.income)}</p>
              <p className='text-rose-400'>Keluar {currencyFormatter.format(item.expenses)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceSummaryCard({
  title,
  value,
  className,
}: {
  title: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-xl p-4 shadow-md ${className}`}>
      <Typography as='p' variant='body' className='text-white/90'>
        {title}
      </Typography>
      <Typography as='h3' variant='h6' className='text-white mt-1'>
        {currencyFormatter.format(value)}
      </Typography>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: FinanceTransaction }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className='bg-white/10 rounded-lg p-4 border border-white/15'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <Typography as='p' variant='body' className='text-white font-medium'>
            {transaction.description}
          </Typography>
          <Typography as='p' variant='label' className='text-white/75 mt-1'>
            {dateFormatter.format(new Date(transaction.transaction_date))}
          </Typography>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            isIncome
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </div>

      <Typography
        as='p'
        variant='body'
        className={`mt-3 font-semibold ${isIncome ? 'text-emerald-300' : 'text-rose-300'}`}
      >
        {isIncome ? '+' : '-'} {currencyFormatter.format(transaction.amount)}
      </Typography>
    </div>
  );
}

export default function FinancePage() {
  const { data, isLoading: reportLoading, refetch: refetchReport } = useGetFinanceReport();
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const { transactions, total, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetFinanceTransactions(currentPage, itemsPerPage);

  React.useEffect(() => {
    refetchReport();
  }, [refetchReport]);

  const weeklySeries = React.useMemo(() => {
    return buildWeeklySeries(data?.transactions ?? []);
  }, [data?.transactions]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const isLoading = reportLoading || transactionsLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <LinksLayoutWrapper>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <ProfileHeader />

        <div className='w-full max-w-xl md:max-w-4xl lg:max-w-6xl space-y-6'>
          <div className='text-center'>
            <Typography as='h1' variant='h5' className='text-white'>
              Transparansi Keuangan
            </Typography>
            <Typography as='p' variant='body' className='text-white/80 mt-2'>
              Laporan pemasukan, pengeluaran, dan saldo berjalan.
            </Typography>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <FinanceSummaryCard
              title='Pemasukan'
              value={data?.total_income ?? 0}
              className='bg-gradient-to-r from-emerald-500 to-emerald-600'
            />
            <FinanceSummaryCard
              title='Pengeluaran'
              value={data?.total_expense ?? 0}
              className='bg-gradient-to-r from-rose-500 to-rose-600'
            />
            <FinanceSummaryCard
              title='Saldo Saat Ini'
              value={data?.current_balance ?? 0}
              className='bg-gradient-to-r from-brand-blue-700 to-brand-blue'
            />
          </div>

          <div className='w-full'>
            <FinanceLineChart data={weeklySeries} />
          </div>

          <div className='space-y-3'>
            <Typography as='h2' variant='h6' className='text-white'>
              Riwayat Transaksi
            </Typography>

            {transactions.length ? (
              <div className='space-y-3'>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.transaction_id}
                    transaction={transaction}
                  />
                ))}

                {totalPages > 1 && (
                  <div className='flex items-center justify-between border-t border-white/10 pt-4 mt-2'>
                    <span className='text-sm text-white/70'>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className='px-3 py-1 text-sm rounded border border-white/20 text-white/90 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition'
                      >
                        Sebelumnya
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='px-3 py-1 text-sm rounded border border-white/20 text-white/90 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition'
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-white/10 rounded-lg p-4 border border-white/15'>
                <Typography as='p' variant='body' className='text-white/80'>
                  Belum ada data transaksi keuangan.
                </Typography>
              </div>
            )}
          </div>

          <div className='pt-4'>
            <a
              href='/links'
              className='flex items-center justify-center gap-2 text-white hover:text-gray-300 transition-colors'
            >
              <IoChevronBack className='w-5 h-5' />
              <Typography as='span' variant='body' weight='medium'>
                Kembali
              </Typography>
            </a>
          </div>
        </div>

        <div className='h-12'></div>
      </div>
    </LinksLayoutWrapper>
  );
}
