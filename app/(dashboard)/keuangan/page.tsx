'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function KeuanganPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 });
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bu } = await supabase
      .from('business_users')
      .select('business_id')
      .eq('user_id', user.id)
      .single();
    if (!bu) return;

    const businessId = bu.business_id;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('date', { ascending: false })
      .limit(50);
    if (filter !== 'all') query = query.eq('type', filter);

    const { data } = await query;
    setTransactions(data || []);

    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const { data: monthData } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('business_id', businessId)
      .gte('date', startOfMonth);

    if (monthData) {
      const income = monthData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      setSummary({ income, expense, profit: income - expense });
    }
    setLoading(false);
  };

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n);

  const deleteTransaction = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    await supabase.from('transactions').delete().eq('id', id);
    loadData();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
        <button
          onClick={() => router.push('/keuangan/input')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
        >
          + Input Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Pemasukan', value: summary.income, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Total Pengeluaran', value: summary.expense, color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'Laba Bersih', value: summary.profit, color: 'text-cyan-400', border: 'border-cyan-500/20' },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-800 rounded-xl p-5 border ${s.border}`}>
            <p className="text-slate-400 text-xs mb-1">{s.label} bulan ini</p>
            <p className={`text-2xl font-bold ${s.color}`}>{formatRp(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'income' ? '💰 Pemasukan' : '💸 Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Memuat...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Belum ada transaksi.{' '}
            <button onClick={() => router.push('/keuangan/input')} className="text-cyan-400 hover:underline">
              + Tambah sekarang
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr className="text-left text-slate-400 text-xs">
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{t.description || '-'}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatRp(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
