'use client';
import { useState } from 'react';

type Trx = {
  id: string; waktu: string; kasir: string;
  items: { nama: string; qty: number; harga: number }[];
  metode: string; status: 'PENDING' | 'LUNAS' | 'BATAL'; meja: string;
};

const INIT_DATA: Trx[] = [
  { id: '#K-001', waktu: '22:10', kasir: 'Wenny', items: [{ nama: 'Espresso Base', qty: 2, harga: 32000 }, { nama: 'Croissant', qty: 1, harga: 18000 }], metode: '-', status: 'PENDING', meja: 'Meja 3' },
  { id: '#K-002', waktu: '22:05', kasir: 'Eva', items: [{ nama: 'Matcha Latte', qty: 1, harga: 38000 }], metode: '-', status: 'PENDING', meja: 'Take Away' },
  { id: '#K-003', waktu: '21:55', kasir: 'Wenny', items: [{ nama: 'Manual Brew', qty: 2, harga: 45000 }], metode: '-', status: 'PENDING', meja: 'Meja 7' },
  { id: '#K-004', waktu: '21:48', kasir: 'LUTPI', items: [{ nama: 'Kopi Susu', qty: 3, harga: 25000 }, { nama: 'Cake', qty: 1, harga: 35000 }], metode: '-', status: 'PENDING', meja: 'Meja 1' },
  { id: '#K-005', waktu: '21:38', kasir: 'Wenny', items: [{ nama: 'Espresso Base', qty: 2, harga: 32000 }, { nama: 'Croissant', qty: 1, harga: 18000 }], metode: 'QRIS', status: 'LUNAS', meja: 'Dine-In' },
  { id: '#K-006', waktu: '21:15', kasir: 'LUTPI', items: [{ nama: 'Latte', qty: 1, harga: 35000 }, { nama: 'Croissant', qty: 1, harga: 18000 }], metode: 'Tunai', status: 'LUNAS', meja: 'Take Away' },
  { id: '#K-007', waktu: '20:52', kasir: 'Eva', items: [{ nama: 'Matcha Latte', qty: 3, harga: 38000 }], metode: 'Debit', status: 'LUNAS', meja: 'Meja 5' },
  { id: '#K-008', waktu: '20:30', kasir: 'Wenny', items: [{ nama: 'Americano', qty: 2, harga: 28000 }, { nama: 'Sandwich', qty: 1, harga: 32000 }], metode: 'GoPay', status: 'LUNAS', meja: 'Meja 2' },
  { id: '#K-009', waktu: '20:11', kasir: 'Wenny', items: [{ nama: 'Manual Brew', qty: 1, harga: 45000 }], metode: 'GoPay', status: 'LUNAS', meja: 'Take Away' },
  { id: '#K-010', waktu: '19:55', kasir: 'Eva', items: [{ nama: 'Cold Brew', qty: 2, harga: 35000 }, { nama: 'Cake', qty: 2, harga: 35000 }], metode: 'QRIS', status: 'LUNAS', meja: 'Meja 4' },
];

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const total = (items: Trx['items']) => items.reduce((s, i) => s + i.qty * i.harga, 0);

export default function KasirPage() {
  const [data, setData] = useState<Trx[]>(INIT_DATA);
  const [tab, setTab] = useState<'PENDING' | 'LUNAS'>('PENDING');
  const [detail, setDetail] = useState<Trx | null>(null);

  const filtered = data.filter(d => d.status === tab);

  const lunasTrx = (id: string, metode: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'LUNAS', metode } : d));
    setDetail(null);
  };

  const batalTrx = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'BATAL' } : d));
    setDetail(null);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kasir</h1>
          <p className="text-xs text-gray-500 mt-0.5">18 April 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            <span className="text-[#0d8a6a] font-bold">{data.filter(d => d.status === 'LUNAS').length}</span> lunas ·{' '}
            <span className="text-yellow-400 font-bold">{data.filter(d => d.status === 'PENDING').length}</span> pending
          </span>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Order Baru
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {(['PENDING', 'LUNAS'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-xs font-semibold transition-colors ${tab === t ? (t === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#0d8a6a] text-white') : 'text-gray-400 hover:text-white'}`}>
            {t === 'PENDING' ? `Belum Bayar (${data.filter(d => d.status === 'PENDING').length})` : `Sudah Bayar (${data.filter(d => d.status === 'LUNAS').length})`}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['NO ORDER', 'WAKTU', 'KASIR', 'MEJA', 'ITEMS', 'TOTAL', tab === 'PENDING' ? 'AKSI' : 'METODE'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                  onClick={() => setDetail(t)}>
                  <td className="px-4 py-2.5 text-[#0d8a6a] font-mono font-medium">{t.id}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.waktu}</td>
                  <td className="px-4 py-2.5 text-gray-300">{t.kasir}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.meja}</td>
                  <td className="px-4 py-2.5 text-gray-300 max-w-[160px] truncate">
                    {t.items.map(i => `${i.nama} x${i.qty}`).join(', ')}
                  </td>
                  <td className="px-4 py-2.5 text-white font-semibold">{rp(total(t.items))}</td>
                  <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                    {tab === 'PENDING' ? (
                      <div className="flex items-center gap-1">
                        {['Tunai', 'QRIS', 'Debit'].map(m => (
                          <button key={m} onClick={() => lunasTrx(t.id, m)}
                            className="px-2 py-1 bg-[#0d8a6a]/20 text-[#0d8a6a] border border-[#0d8a6a]/30 rounded text-[10px] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
                            {m}
                          </button>
                        ))}
                        <button onClick={() => batalTrx(t.id)}
                          className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-medium hover:bg-red-500 hover:text-white transition-colors">
                          Batal
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">{t.metode}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-white">{detail.id}</p>
              <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Kasir</span><span className="text-white">{detail.kasir}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Meja</span><span className="text-white">{detail.meja}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Waktu</span><span className="text-white">{detail.waktu}</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 mb-3 space-y-1.5">
              {detail.items.map(item => (
                <div key={item.nama} className="flex justify-between text-xs">
                  <span className="text-gray-300">{item.nama} x{item.qty}</span>
                  <span className="text-white">{rp(item.qty * item.harga)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-3">
              <span className="text-gray-400">Total</span>
              <span className="text-[#0d8a6a]">{rp(total(detail.items))}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
