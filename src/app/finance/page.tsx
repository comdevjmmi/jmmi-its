'use client';

import * as React from 'react';

import Link from 'next/link';

import Loading from '@/components/Loading';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

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
      return { x, y, value };
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

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className='rounded-[25px] border border-gray-100 bg-gray-50/50 p-6 shadow-md w-full space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>
            Grafik Keuangan Bulanan (12 Bulan)
          </p>
          <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>
            Tren Pemasukan dan Pengeluaran
          </h2>
        </div>
        <div className='flex flex-wrap gap-3 text-xs sm:text-sm font-sora font-semibold'>
          <div className='inline-flex items-center gap-2 rounded-full bg-[#146637]/10 px-3.5 py-1.5 text-[#146637]'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#146637]' />
            Pemasukan
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3.5 py-1.5 text-rose-600'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-inner'>
        {/* Floating Tooltip Box when hovering over data points */}
        {activeItem && hoveredIndex !== null && incomePoints[hoveredIndex] && (
          <div
            className='pointer-events-none absolute z-20 rounded-2xl border border-gray-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3'
            style={{
              left: `${(incomePoints[hoveredIndex].x / width) * 100}%`,
              top: `${(Math.min(incomePoints[hoveredIndex].y, expensePoints[hoveredIndex]?.y ?? 0) / height) * 100}%`,
            }}
          >
            <p className='font-sora text-xs font-bold text-slate-800 border-b border-gray-100 pb-1.5 mb-1.5'>
              {activeItem.label}
            </p>
            <div className='space-y-1 font-hanken text-xs font-semibold'>
              <p className='text-[#146637] flex items-center justify-between gap-4'>
                <span>Pemasukan:</span>
                <span>{currencyFormatter.format(activeItem.income)}</span>
              </p>
              <p className='text-rose-600 flex items-center justify-between gap-4'>
                <span>Pengeluaran:</span>
                <span>{currencyFormatter.format(activeItem.expenses)}</span>
              </p>
              <p className='text-slate-900 flex items-center justify-between gap-4 border-t border-gray-100 pt-1'>
                <span>Selisih:</span>
                <span>{currencyFormatter.format(activeItem.balance)}</span>
              </p>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className='h-auto w-full'>
          <defs>
            <linearGradient id='incomeFillLight' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='rgba(20, 102, 55, 0.2)' />
              <stop offset='100%' stopColor='rgba(20, 102, 55, 0.01)' />
            </linearGradient>
          </defs>

          {gridLines.map((lineY) => (
            <line
              key={lineY}
              x1={paddingX}
              x2={width - paddingX}
              y1={lineY}
              y2={lineY}
              stroke='rgba(226, 232, 240, 0.8)'
              strokeDasharray='6 6'
            />
          ))}

          <path d={incomeAreaPath} fill='url(#incomeFillLight)' />
          <path d={incomePath} fill='none' stroke='#146637' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d={expensePath} fill='none' stroke='#E11D48' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='10 6' />

          {/* Render Vertical Guideline on Hover */}
          {hoveredIndex !== null && incomePoints[hoveredIndex] && (
            <line
              x1={incomePoints[hoveredIndex].x}
              x2={incomePoints[hoveredIndex].x}
              y1={paddingY}
              y2={height - paddingY}
              stroke='#146637'
              strokeWidth='1.5'
              strokeDasharray='4 4'
              className='transition-all duration-150'
            />
          )}

          {/* Interactive Data Points */}
          {incomePoints.map((point, index) => {
            const expPoint = expensePoints[index];
            const isHovered = hoveredIndex === index;

            return (
              <g key={`point-group-${data[index]?.key ?? index}`}>
                {/* Expense Point Dot */}
                {expPoint && (
                  <circle
                    cx={expPoint.x}
                    cy={expPoint.y}
                    r={isHovered ? '7' : '4.5'}
                    fill='#ffffff'
                    stroke='#E11D48'
                    strokeWidth={isHovered ? '3.5' : '2.5'}
                    className='transition-all duration-200'
                  />
                )}

                {/* Income Point Dot */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? '7' : '4.5'}
                  fill='#ffffff'
                  stroke='#146637'
                  strokeWidth={isHovered ? '3.5' : '2.5'}
                  className='transition-all duration-200'
                />

                {/* Month X-Axis Label */}
                <text
                  x={point.x}
                  y={height - 10}
                  textAnchor='middle'
                  fill={isHovered ? '#146637' : '#64748b'}
                  fontWeight={isHovered ? '700' : '500'}
                  fontSize='11'
                  fontFamily='var(--font-hanken)'
                  className='transition-colors duration-150'
                >
                  {data[index]?.monthLabel}
                </text>

                {/* Invisible Broad Hover Target Hitbox */}
                <rect
                  x={point.x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={height}
                  fill='transparent'
                  className='cursor-pointer'
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className='mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'>
        {data.slice(-6).map((item, idx) => {
          const originalIndex = data.length - 6 + idx;
          const isSelected = hoveredIndex === originalIndex;

          return (
            <div
              key={item.key}
              onMouseEnter={() => setHoveredIndex(originalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`rounded-2xl border p-3.5 shadow-sm cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[#146637] bg-[#146637]/5 shadow-md scale-105'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              }`}
            >
              <p className='font-sora text-xs font-bold text-slate-800 truncate'>{item.label}</p>
              <div className='mt-1.5 space-y-0.5 font-hanken text-xs font-medium'>
                <p className='text-[#146637]'>+{currencyFormatter.format(item.income)}</p>
                <p className='text-rose-600'>-{currencyFormatter.format(item.expenses)}</p>
              </div>
            </div>
          );
        })}
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
    <div className='rounded-[25px] border border-gray-100 bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300'>
      <div className={`px-6 py-4 font-sora font-bold text-white text-base ${headerBg}`}>
        {sectionTitle}
      </div>
      <div className='p-6 space-y-3.5 font-hanken'>
        <div className='flex justify-between items-center text-sm sm:text-base'>
          <span className='text-slate-500'>Pemasukan:</span>
          <span className='font-bold text-[#146637]'>{currencyFormatter.format(income)}</span>
        </div>
        <div className='flex justify-between items-center text-sm sm:text-base'>
          <span className='text-slate-500'>Pengeluaran:</span>
          <span className='font-bold text-rose-600'>{currencyFormatter.format(expense)}</span>
        </div>
        <div className='border-t border-gray-100 pt-3 flex justify-between items-center text-base sm:text-lg font-extrabold'>
          <span className='text-slate-900'>Saldo:</span>
          <span className='text-slate-900'>{currencyFormatter.format(balance)}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: FinanceTransaction }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2.5 flex-wrap'>
            <p className='font-hanken text-base font-semibold text-slate-900'>
              {transaction.description}
            </p>
            <span className='text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 text-slate-600 font-sora font-semibold'>
              {getFundBadgeLabel(transaction.fund_type)}
            </span>
          </div>
          <p className='font-hanken text-xs text-slate-500 mt-1'>
            {dateFormatter.format(new Date(transaction.transaction_date))}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full font-sora font-semibold shrink-0 ${
            isIncome
              ? 'bg-[#146637]/10 text-[#146637]'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </div>

      <p
        className={`mt-3 font-sora font-extrabold text-base ${
          isIncome ? 'text-[#146637]' : 'text-rose-600'
        }`}
      >
        {isIncome ? '+' : '-'} {currencyFormatter.format(transaction.amount)}
      </p>
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
    <div className='flex min-h-screen flex-col bg-white font-primary text-slate-800'>
      <Navbar />

      <main className='relative z-10 flex-1 py-12 px-4 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-[1312px] space-y-10'>
          {/* Header */}
          <div className='space-y-3 max-w-2xl'>
            <h1 className='font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#146637] tracking-tight'>
              Transparansi Keuangan
            </h1>
            <p className='font-hanken text-lg sm:text-xl text-slate-600 leading-relaxed'>
              Laporan akuntabilitas publik, pemasukan, pengeluaran, serta saldo Dana Kas & Dana Takmir JMMI ITS.
            </p>
          </div>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <FundSectionCard
              sectionTitle='Dana Kas'
              income={kasSummary.total_income}
              expense={kasSummary.total_expense}
              balance={kasSummary.balance}
              headerBg='bg-[#146637]'
            />
            <FundSectionCard
              sectionTitle='Dana Takmir'
              income={takmirSummary.total_income}
              expense={takmirSummary.total_expense}
              balance={takmirSummary.balance}
              headerBg='bg-[#0e4a28]'
            />
            <FundSectionCard
              sectionTitle='Total Keseluruhan'
              income={data?.total_income ?? 0}
              expense={data?.total_expense ?? 0}
              balance={data?.current_balance ?? 0}
              headerBg='bg-slate-900'
            />
          </div>

          {/* Chart */}
          <div className='w-full'>
            <FinanceLineChart data={monthlySeries} />
          </div>

          {/* Transaction History */}
          <div className='space-y-6 pt-4'>
            <h2 className='font-sora text-2xl sm:text-3xl font-bold text-slate-900'>
              Riwayat Transaksi
            </h2>

            {transactions.length ? (
              <div className='space-y-3.5'>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.transaction_id}
                    transaction={transaction}
                  />
                ))}

                {totalPages > 1 && (
                  <div className='flex items-center justify-between border-t border-gray-200 pt-6 mt-4'>
                    <span className='font-hanken text-sm text-slate-500'>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className='flex gap-3'>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className='px-4 py-2 text-sm font-sora font-semibold rounded-full border border-gray-200 text-slate-700 hover:border-[#146637] hover:text-[#146637] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                      >
                        Sebelumnya
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className='px-4 py-2 text-sm font-sora font-semibold rounded-full border border-gray-200 text-slate-700 hover:border-[#146637] hover:text-[#146637] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center'>
                <p className='font-hanken text-slate-600'>
                  Belum ada data transaksi keuangan.
                </p>
              </div>
            )}
          </div>

          <div className='pt-6'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 font-sora text-sm font-semibold text-[#146637] hover:underline'
            >
              <IoChevronBack className='w-4 h-4' />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

