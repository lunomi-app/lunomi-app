'use client';
import { useState } from 'react';
import { askAI } from '@/app/_components/AIAssistant';

const DATA = [
  { id: '#TRX-001', waktu: '21:38', kasir: 'Wenny', items: 'Espresso Base x2, Croissant x1', metode: 'QRIS', total: 144000, status: 'LUNAS', jenis: 'Dine-In' },
  { id: '#TRX-002', waktu: '21:15', kasir: 'LUTPI', items: 'Latte x1, Croissant x1', metode: 'Tunai', total: 87000, status: 'LUNAS', jenis: 'Take Away' },
  { id: '#TRX-003', waktu: '20:52', kasir: 'Eva', items: 'Matcha Latte x3', metode: 'Debit', total: 210000, status: 'LUNAS', jenis: 'Dine-In' },
  { id: '#TRX-004', waktu: '20:11', kasir: 'Wenny', items: 'Manual Brew x1', metode: 'GoPay', total: 65000, status: 'PENDING', jenis: 'Take Away' },
  { id: '#TRX-005', waktu: '19:44', kasir: 'Eva', items: 'Americano x2, Cake x1', metode: 'QRIS', total: 115000, status: 'LUNAS', jenis: 'Order Online' },
  { id: '#TRX-006', waktu: '19:20', kasir: 'LUTPI', items: 'Kopi Susu x4', metode: 'Tunai', total: 80000, status: 'LUNAS', jenis: 'Dine-In' },
  { id: '#TRX-007', waktu: '18:55', kasir: 'Wenny', items: 'Matcha Latte x2, Pastry x2', metode: 'QRIS', total: 196000, status: 'REFUND', jenis: 'Dine-In' },
  { id: '#TRX-008', waktu: '18:30', kasir: 'Eva', items: 'Cold Brew x1', metode: 'GoPay', total: 45000, status: 'LUNAS', jenis: 'Take Away' },
  { id: '#TRX-009', waktu: '18:05', kasir: 'Wenny', items: 'Espresso x1, Sandwich x1', metode: 'Debit', total: 88000, status: 'LUNAS', jenis: 'Dine-In' },
  { id: '#TRX-010', waktu: '17:48', kasir: 'LUTPI', items: 'Manual Brew x2', metode: 'Tunai', total: 130000, status: 'LUNAS', jenis: 'Order Online' },
];

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const STATUS_STYLE: Record<string, string> = {
  LUNAS: 'bg-green-500/15 text-green-400',
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  REFUND: 'bg-red-500/15 text-red-400',
};

export default function PenjualanPage() {
  const [filter, setFilter] = useState('SEMUA');
  const [search, setSearch] = useState('');

  const filtered = DATA.filter(d => {
    if (filter !== 'SEMUA' && d.status !== filter) return false;
    if (search && !d.items.toLowerCase().includes(search.toLowerCase()) && !d.kasir.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.reduce((s, d) => s + (d.status === 'LUNAS' ? d.total : 0), 0);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Penjualan</h1>
          <p className="text-xs text-gray-500 mt-0.5">18 April 2026 · {DATA.length} transaksi</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0d8a6a]">{rp(total)}</span>
          <button onClick={() => askAI('Analisis penjualan hari ini, produk terlaris, dan rekomendasi untuk meningkatkan revenue')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Tanya AI
          </button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">Export</button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kasir atau produk..."
          className="flex-1 min-w-[200px] max-w-xs bg-[#0d2137] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#0d8a6a]"
        />
        <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
          {['SEMUA', 'LUNAS', 'PENDING', 'REFUND'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['ID', 'WAKTU', 'KASIR', 'ITEMS', 'JENIS', 'METODE', 'TOTAL', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-4 py-2.5 text-[#0d8a6a] font-mono">{t.id}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.waktu}</td>
                  <td className="px-4 py-2.5 text-gray-300">{t.kasir}</td>
                  <td className="px-4 py-2.5 text-gray-300 max-w-[180px] truncate">{t.items}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.jenis}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.metode}</td>
                  <td className="px-4 py-2.5 text-white font-semibold">{rp(t.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Tidak ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
