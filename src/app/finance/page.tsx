'use client';

import * as React from 'react';

import Link from 'next/link';

import Loading from '@/components/Loading';
import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import ProfileHeader from '@/components/links/ProfileHeader';
import Typography from '@/components/Typography';

import { IoChevronBack } from 'react-icons/io5';

import { useGetFinanceReport, useGetFinanceTransactions } from '@/app/finance/hook/useFinance';

import { FinanceTransaction, FundType } from '@/types/entities/finance';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
});

type MonthlyPoint = {
  key: string;
  label: string;
  monthLabel: string;
  income: number;
  expenses: number;
  balance: number;
};

function getFundBadgeLabel(fundType: FundType) {
  if (fundType === 'DANA_KAS') return 'Dana Kas';
  if (fundType === 'DANA_TAKMIR') return 'Dana Takmir';
  return 'Belum Ditentukan';
}

function buildMonthlySeries(transactions: FinanceTransaction[]) {
  const today = new Date();
  const months: { year: number; month: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const lookup = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };

    if (transaction.type === 'income') {
      current.income += transaction.amount;
    } else {
      current.expenses += transaction.amount;
    }

    lookup.set(key, current);
  });

  return months.map(({ year, month }) => {
    const date = new Date(year, month, 1);
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };
    const monthLabel = date.toLocaleDateString('id-ID', { month: 'short' });
    const fullLabel = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    return {
      key,
      label: fullLabel,
      monthLabel,
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

function FinanceLineChart({ data }: { data: MonthlyPoint[] }) {
  const width = 720;
  const height = 300;
  const paddingX = 44;
  const paddingY = 28;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expenses]));
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

  const seriesToPoints = (selector: (item: MonthlyPoint) => number) => {
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
            Grafik Keuangan Bulanan (12 Bulan)
          </p>
          <h2 className='mt-1 text-2xl font-semibold text-white'>Tren Pemasukan dan Pengeluaran</h2>
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
          <path d={incomePath} fill='none' stroke='rgb(52 211 153)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d={expensePath} fill='none' stroke='rgb(251 113 133)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='10 6' />

          {incomePoints.map((point, index) => (
            <g key={`income-${data[index]?.key ?? index}`}>
              <circle cx={point.x} cy={point.y} r='4.5' fill='#1e293b' stroke='rgb(52 211 153)' strokeWidth='2.5' />
              <text x={point.x} y={height - 10} textAnchor='middle' fill='rgba(255, 255, 255, 0.7)' fontSize='11'>
                {data[index]?.monthLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'>
        {data.slice(-6).map((item) => (
          <div key={item.key} className='rounded-xl border border-white/10 bg-white/5 px-3 py-2.5'>
            <p className='text-xs font-semibold text-white/90 truncate'>{item.label}</p>
            <div className='mt-1 space-y-0.5 text-xs'>
              <p className='text-emerald-400'>+{currencyFormatter.format(item.income)}</p>
              <p className='text-rose-400'>-{currencyFormatter.format(item.expenses)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundSectionCard({
  sectionTitle,
  income,
  expense,
  balance,
  headerBg,
}: {
  sectionTitle: string;
  income: number;
  expense: number;
  balance: number;
  headerBg: string;
}) {
  return (
    <div className='rounded-2xl border border-white/15 bg-white/5 overflow-hidden shadow-lg'>
      <div className={`px-4 py-3 font-semibold text-white text-base ${headerBg}`}>
        {sectionTitle}
      </div>
      <div className='p-4 space-y-3'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-white/70'>Pemasukan:</span>
          <span className='font-semibold text-emerald-400'>{currencyFormatter.format(income)}</span>
        </div>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-white/70'>Pengeluaran:</span>
          <span className='font-semibold text-rose-400'>{currencyFormatter.format(expense)}</span>
        </div>
        <div className='border-t border-white/10 pt-2 flex justify-between items-center text-base font-bold'>
          <span className='text-white/90'>Saldo:</span>
          <span className='text-white'>{currencyFormatter.format(balance)}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: FinanceTransaction }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className='bg-white/10 rounded-lg p-4 border border-white/15'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Typography as='p' variant='body' className='text-white font-medium'>
              {transaction.description}
            </Typography>
            <span className='text-[10px] px-2 py-0.5 rounded bg-white/20 text-white/90 font-medium'>
              {getFundBadgeLabel(transaction.fund_type)}
            </span>
          </div>
          <Typography as='p' variant='label' className='text-white/75 mt-1'>
            {dateFormatter.format(new Date(transaction.transaction_date))}
          </Typography>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
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
  const { transactions, total, isLoading: transactionsLoading } = useGetFinanceTransactions(currentPage, itemsPerPage);

  React.useEffect(() => {
    refetchReport();
  }, [refetchReport]);

  const monthlySeries = React.useMemo(() => {
    return buildMonthlySeries(data?.transactions ?? []);
  }, [data?.transactions]);

  const totalPages = Math.ceil(total / itemsPerPage);

  const isLoading = reportLoading || transactionsLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const kasSummary = data?.kas_summary ?? { total_income: 0, total_expense: 0, balance: 0 };
  const takmirSummary = data?.takmir_summary ?? { total_income: 0, total_expense: 0, balance: 0 };
  const unassignedSummary = data?.unassigned_summary ?? { total_income: 0, total_expense: 0, balance: 0 };
  const hasUnassigned = unassignedSummary.total_income > 0 || unassignedSummary.total_expense > 0;

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
              Laporan pemasukan, pengeluaran, dan saldo Dana Kas & Dana Takmir.
            </Typography>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <FundSectionCard
              sectionTitle='Dana Kas'
              income={kasSummary.total_income}
              expense={kasSummary.total_expense}
              balance={kasSummary.balance}
              headerBg='bg-gradient-to-r from-emerald-600 to-teal-600'
            />
            <FundSectionCard
              sectionTitle='Dana Takmir'
              income={takmirSummary.total_income}
              expense={takmirSummary.total_expense}
              balance={takmirSummary.balance}
              headerBg='bg-gradient-to-r from-cyan-600 to-blue-600'
            />
            <FundSectionCard
              sectionTitle='Total Keseluruhan'
              income={data?.total_income ?? 0}
              expense={data?.total_expense ?? 0}
              balance={data?.current_balance ?? 0}
              headerBg='bg-gradient-to-r from-purple-600 to-indigo-600'
            />
          </div>

          <div className='w-full'>
            <FinanceLineChart data={monthlySeries} />
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
            <Link
              href='/'
              className='flex items-center justify-center gap-2 text-white hover:text-gray-300 transition-colors'
            >
              <IoChevronBack className='w-5 h-5' />
              <Typography as='span' variant='body' weight='medium'>
                Kembali ke Beranda
              </Typography>
            </Link>
          </div>
        </div>

        <div className='h-12'></div>
      </div>
    </LinksLayoutWrapper>
  );
}
