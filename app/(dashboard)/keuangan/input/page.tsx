'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const KATEGORI_PEMASUKAN = [
  'Penjualan Produk', 'Jasa', 'Investasi', 'Piutang', 'Lainnya'
];
const KATEGORI_PENGELUARAN = [
  'Bahan Baku', 'Gaji Karyawan', 'Sewa', 'Listrik & Air',
  'Transport', 'Marketing', 'Peralatan', 'Lainnya'
];

export default function InputTransaksiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    branch_id: '',
    reference_no: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bu } = await supabase
      .from('business_users')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (bu) {
      setBusinessId(bu.business_id);
      const { data: br } = await supabase
        .from('branches')
        .select('id, name')
        .eq('business_id', bu.business_id)
        .eq('is_active', true);
      setBranches(br || []);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.category) {
      setError('Nominal dan kategori wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('transactions').insert({
        business_id: businessId,
        branch_id: form.branch_id || null,
        type: form.type,
        amount: parseFloat(form.amount.replace(/\D/g, '')),
        category: form.category,
        description: form.description,
        date: form.date,
        reference_no: form.reference_no,
        created_by: user?.id,
      });
      if (err) throw err;
      router.push('/keuangan');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const kategori = form.type === 'income' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold text-white">Input Transaksi</h1>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-300 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Toggle Pemasukan / Pengeluaran */}
        <div className="flex gap-2 mb-6">
          {(['income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, type: t, category: '' })}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {t === 'income' ? '💰 Pemasukan' : '💸 Pengeluaran'}
            </button>
          ))}
        </div>

        {/* Nominal */}
        <div className="mb-4">
          <label className="text-slate-300 text-sm mb-1 block">Nominal *</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 font-medium">Rp</span>
            <input
              type="text"
              placeholder="0"
              value={form.amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                const formatted = raw ? parseInt(raw).toLocaleString('id-ID') : '';
                setForm({ ...form, amount: formatted });
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Kategori */}
        <div className="mb-4">
          <label className="text-slate-300 text-sm mb-1 block">Kategori *</label>
          <div className="grid grid-cols-2 gap-2">
            {kategori.map((k) => (
              <button
                key={k}
                onClick={() => setForm({ ...form, category: k })}
                className={`p-2.5 rounded-lg border text-sm text-left transition-all ${
                  form.category === k
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Tanggal */}
        <div className="mb-4">
          <label className="text-slate-300 text-sm mb-1 block">Tanggal *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Cabang */}
        {branches.length > 0 && (
          <div className="mb-4">
            <label className="text-slate-300 text-sm mb-1 block">Cabang</label>
            <select
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Keterangan */}
        <div className="mb-4">
          <label className="text-slate-300 text-sm mb-1 block">Keterangan</label>
          <textarea
            placeholder="Deskripsi transaksi..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
          />
        </div>

        {/* No. Referensi */}
        <div className="mb-6">
          <label className="text-slate-300 text-sm mb-1 block">No. Invoice / Kwitansi</label>
          <input
            type="text"
            placeholder="INV-001"
            value={form.reference_no}
            onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-lg"
        >
          {loading ? 'Menyimpan...' : '✅ Simpan Transaksi'}
        </button>
      </div>
    </div>
  );
}