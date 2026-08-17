'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';

import Button from '@/components/buttons/Button';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import {
  useGetAllFinanceTransactions,
  useCreateFinanceTransaction,
  useUpdateFinanceTransaction,
  useDeleteFinanceTransaction,
  useGetFinanceReport,
} from '../hook/useFinance';
import { FundType } from '@/types/entities/finance';

interface FinanceTransaction {
  transaction_id: string;
  type: 'income' | 'expenses';
  fund_type: FundType;
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}

interface FormData {
  type: 'income' | 'expenses';
  fund_type: 'DANA_KAS' | 'DANA_TAKMIR' | '';
  description: string;
  amount: string;
  transaction_at: string;
}

const INITIAL_FORM: FormData = {
  type: 'income',
  fund_type: 'DANA_KAS',
  description: '',
  amount: '',
  transaction_at: new Date().toISOString().split('T')[0],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatFundType(fundType: FundType) {
  if (fundType === 'DANA_KAS') return 'Dana Kas';
  if (fundType === 'DANA_TAKMIR') return 'Dana Takmir';
  return 'Belum Ditentukan';
}

export default function AdminKeuanganPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: paginationData, isLoading: isTransactionsLoading, refetch } = useGetAllFinanceTransactions(currentPage, itemsPerPage);
  const { data: reportData, isLoading: isReportLoading } = useGetFinanceReport();

  const transactions = paginationData?.data || [];
  const totalTransactions = paginationData?.total || 0;
  const { mutate: createTransaction, isPending: isCreating } = useCreateFinanceTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateFinanceTransaction();
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteFinanceTransaction();

  useEffect(() => {
    if (!showForm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const handleOpenForm = (transaction?: FinanceTransaction) => {
    if (transaction) {
      setEditingId(transaction.transaction_id);
      setFormData({
        type: transaction.type,
        fund_type: transaction.fund_type || '',
        description: transaction.description,
        amount: transaction.amount.toString(),
        transaction_at: transaction.transaction_date.split('T')[0],
      });
    } else {
      setEditingId(null);
      setFormData(INITIAL_FORM);
    }

    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.description || !formData.amount || !formData.transaction_at) {
      showToast('Semua field wajib diisi', DANGER_TOAST);
      return;
    }

    const payload = {
      type: formData.type,
      fund_type: formData.fund_type ? (formData.fund_type as FundType) : null,
      description: formData.description,
      amount: Number(formData.amount),
      transaction_at: formData.transaction_at,
    };

    if (editingId) {
      updateTransaction(
        { id: editingId, ...payload },
        {
          onSuccess: () => {
            showToast('Transaksi berhasil diperbarui', SUCCESS_TOAST);
            handleCloseForm();
            refetch();
          },
          onError: (error: any) => {
            showToast(error.response?.data?.message || 'Gagal memperbarui transaksi', DANGER_TOAST);
          },
        }
      );
      return;
    }

    createTransaction(payload, {
      onSuccess: () => {
        showToast('Transaksi berhasil ditambahkan', SUCCESS_TOAST);
        handleCloseForm();
        refetch();
      },
      onError: (error: any) => {
        showToast(error.response?.data?.message || 'Gagal menambahkan transaksi', DANGER_TOAST);
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    deleteTransaction(id, {
      onSuccess: () => {
        showToast('Transaksi berhasil dihapus', SUCCESS_TOAST);
        refetch();
      },
      onError: (error: any) => {
        showToast(error.response?.data?.message || 'Gagal menghapus transaksi', DANGER_TOAST);
      },
    });
  };

  const kasSummary = reportData?.kas_summary || { total_income: 0, total_expense: 0, balance: 0 };
  const takmirSummary = reportData?.takmir_summary || { total_income: 0, total_expense: 0, balance: 0 };
  const totalIncome = reportData?.total_income || 0;
  const totalExpense = reportData?.total_expense || 0;
  const balance = reportData?.current_balance || 0;

  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl bg-gradient-to-r from-brand-green-700 via-brand-green-700 to-brand-yellow p-6 text-white shadow-lg sm:p-8'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight'>Manajemen Keuangan</h1>
          <p className='mt-3 max-w-2xl text-sm leading-7 text-white/80 sm:text-base'>
            Kelola pemasukan, pengeluaran, dan riwayat transaksi organisasi (Dana Kas & Dana Takmir).
          </p>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wider text-emerald-700'>Dana Kas</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>Rp {formatCurrency(kasSummary.balance)}</p>
          <div className='mt-3 flex flex-col gap-1 text-xs text-slate-500'>
            <span>Pemasukan: Rp {formatCurrency(kasSummary.total_income)}</span>
            <span>Pengeluaran: Rp {formatCurrency(kasSummary.total_expense)}</span>
          </div>
        </div>
        <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wider text-blue-700'>Dana Takmir</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>Rp {formatCurrency(takmirSummary.balance)}</p>
          <div className='mt-3 flex flex-col gap-1 text-xs text-slate-500'>
            <span>Pemasukan: Rp {formatCurrency(takmirSummary.total_income)}</span>
            <span>Pengeluaran: Rp {formatCurrency(takmirSummary.total_expense)}</span>
          </div>
        </div>
        <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wider text-purple-700'>Total Keseluruhan</p>
          <p className='mt-2 text-2xl font-semibold text-slate-900'>Rp {formatCurrency(balance)}</p>
          <div className='mt-3 flex flex-col gap-1 text-xs text-slate-500'>
            <span>Total Masuk: Rp {formatCurrency(totalIncome)}</span>
            <span>Total Keluar: Rp {formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.2em] text-brand-green-700'>Manajemen Transaksi</p>
            <h2 className='mt-1 text-2xl font-semibold text-slate-900'>Riwayat Transaksi Keuangan</h2>
          </div>
          <Button variant='primary' size='sm' leftIcon={Plus} onClick={() => handleOpenForm()}>
            Tambah Transaksi
          </Button>
        </div>

        {isTransactionsLoading || isReportLoading ? (
          <div className='px-6 py-8 text-center text-slate-500'>Memuat transaksi...</div>
        ) : transactions.length === 0 ? (
          <div className='px-6 py-8 text-center text-slate-500'>Belum ada transaksi. Mulai dengan menambahkan transaksi baru.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-200 bg-slate-50'>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-700'>Tanggal</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-700'>Jenis</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-700'>Tipe Dana</th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-slate-700'>Keterangan</th>
                  <th className='px-6 py-3 text-right text-xs font-semibold text-slate-700'>Jumlah</th>
                  <th className='px-6 py-3 text-center text-xs font-semibold text-slate-700'>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className='border-b border-slate-100 transition-colors hover:bg-slate-50'>
                    <td className='px-6 py-4 text-sm text-slate-600'>
                      {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className='px-6 py-4 text-sm'>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          transaction.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm'>
                      <select
                        value={transaction.fund_type || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newFundType: FundType = value ? (value as FundType) : null;
                          updateTransaction(
                            { id: transaction.transaction_id, fund_type: newFundType },
                            {
                              onSuccess: () => {
                                showToast('Tipe dana berhasil diperbarui', SUCCESS_TOAST);
                                refetch();
                              },
                              onError: (error: any) => {
                                showToast(error.response?.data?.message || 'Gagal memperbarui tipe dana', DANGER_TOAST);
                              },
                            }
                          );
                        }}
                        className='rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                      >
                        <option value='DANA_KAS'>Dana Kas</option>
                        <option value='DANA_TAKMIR'>Dana Takmir</option>
                        <option value=''>Belum Ditentukan</option>
                      </select>
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-900'>{transaction.description}</td>
                    <td className='px-6 py-4 text-right text-sm font-medium text-slate-900'>
                      {transaction.type === 'income' ? '+' : '-'}Rp {formatCurrency(transaction.amount)}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => handleOpenForm(transaction)}
                          className='rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50'
                          type='button'
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.transaction_id)}
                          disabled={isDeleting}
                          className='rounded-md p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50'
                          type='button'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3'>
                <span className='text-sm text-slate-500'>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm' onClick={handleCloseForm}>
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='transaction-modal-title'
            className='w-full max-w-md rounded-3xl bg-white p-6 shadow-xl'
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id='transaction-modal-title' className='mb-4 text-lg font-semibold text-slate-900'>
              {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h3>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700'>Jenis Transaksi</label>
                <select
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value as 'income' | 'expenses' })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                >
                  <option value='income'>Pemasukan</option>
                  <option value='expenses'>Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Tipe Dana</label>
                <select
                  value={formData.fund_type}
                  onChange={(event) => setFormData({ ...formData, fund_type: event.target.value as 'DANA_KAS' | 'DANA_TAKMIR' | '' })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                >
                  <option value='DANA_KAS'>Dana Kas</option>
                  <option value='DANA_TAKMIR'>Dana Takmir</option>
                  <option value=''>Belum Ditentukan (null)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Keterangan</label>
                <input
                  type='text'
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder='Contoh: Donasi bulanan'
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Jumlah (Rp)</label>
                <input
                  type='number'
                  value={formData.amount}
                  onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                  placeholder='0'
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700'>Tanggal</label>
                <input
                  type='date'
                  value={formData.transaction_at}
                  onChange={(event) => setFormData({ ...formData, transaction_at: event.target.value })}
                  className='mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-green-700 focus:outline-none focus:ring-2 focus:ring-brand-green-700/20'
                />
              </div>

              <div className='flex gap-3 pt-4'>
                <Button type='button' variant='outline' onClick={handleCloseForm} className='flex-1'>
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  className='flex-1'
                  isLoading={isCreating || isUpdating}
                  disabled={isCreating || isUpdating}
                >
                  {editingId ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
