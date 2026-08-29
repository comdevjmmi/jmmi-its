import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transparansi Keuangan',
  description: 'Laporan keuangan JMMI ITS mencakup pemasukan, pengeluaran, saldo, dan riwayat transaksi organisasi.',
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
