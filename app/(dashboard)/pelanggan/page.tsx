'use client';
import { useState } from 'react';
import { askAI } from '@/app/_components/AIAssistant';

const DATA = [
  { nama: 'Budi Santoso', telp: '0812-3456-7890', email: 'budi@email.com', kunjungan: 24, total: 1840000, terakhir: '18 Apr 2026', member: 'Gold' },
  { nama: 'Sari Dewi', telp: '0813-2345-6789', email: 'sari@email.com', kunjungan: 18, total: 1260000, terakhir: '17 Apr 2026', member: 'Silver' },
  { nama: 'Ahmad Fauzi', telp: '0811-3456-7891', email: 'ahmad@email.com', kunjungan: 45, total: 3600000, terakhir: '18 Apr 2026', member: 'Platinum' },
  { nama: 'Rina Putri', telp: '0814-5678-9012', email: 'rina@email.com', kunjungan: 7, total: 420000, terakhir: '15 Apr 2026', member: 'Regular' },
  { nama: 'Doni Kurniawan', telp: '0815-6789-0123', email: 'doni@email.com', kunjungan: 32, total: 2560000, terakhir: '16 Apr 2026', member: 'Gold' },
  { nama: 'Maya Anggraini', telp: '0816-7890-1234', email: 'maya@email.com', kunjungan: 11, total: 770000, terakhir: '18 Apr 2026', member: 'Silver' },
  { nama: 'Hendra Wijaya', telp: '0817-8901-2345', email: 'hendra@email.com', kunjungan: 3, total: 180000, terakhir: '10 Apr 2026', member: 'Regular' },
  { nama: 'Fitri Handayani', telp: '0818-9012-3456', email: 'fitri@email.com', kunjungan: 56, total: 4480000, terakhir: '18 Apr 2026', member: 'Platinum' },
];

const MEMBER_STYLE: Record<string, string> = {
  Platinum: 'bg-cyan-500/15 text-cyan-400',
  Gold: 'bg-yellow-500/15 text-yellow-400',
  Silver: 'bg-gray-500/15 text-gray-400',
  Regular: 'bg-blue-500/15 text-blue-400',
};

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function PelangganPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'kunjungan' | 'total'>('kunjungan');

  const filtered = DATA
    .filter(d => !search || d.nama.toLowerCase().includes(search.toLowerCase()) || d.telp.includes(search))
    .sort((a, b) => b[sort] - a[sort]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pelanggan</h1>
          <p className="text-xs text-gray-500 mt-0.5">{DATA.length} pelanggan terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => askAI('Analisis segmen pelanggan dan siapa yang perlu difollow up hari ini?')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Analisa AI
          </button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Tambah Pelanggan
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau nomor HP..."
          className="flex-1 max-w-xs bg-[#0d2137] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#0d8a6a]"
        />
        <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
          {(['kunjungan', 'total'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${sort === s ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
              {s === 'kunjungan' ? 'Kunjungan' : 'Total Spend'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => (
          <div key={c.nama} className="bg-[#0d2137] border border-white/10 rounded-xl p-4 flex items-start gap-3 hover:border-[#0d8a6a]/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-sm font-bold text-[#0d8a6a] flex-shrink-0">
              {c.nama[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white truncate">{c.nama}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${MEMBER_STYLE[c.member]}`}>{c.member}</span>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">{c.telp} · {c.email}</p>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-gray-400">{c.kunjungan}x kunjungan</span>
                <span className="text-[#0d8a6a] font-semibold">{rp(c.total)}</span>
                <span className="text-gray-500">Terakhir: {c.terakhir}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
