'use client';
import { useState } from 'react';
import { PROMOTIONS, TRANSACTIONS, rp } from '@/lib/data/store';
import { askAI } from '@/app/_components/AIAssistant';

type Promo = typeof PROMOTIONS[number];

const TYPE_LABEL = { persen: '% Diskon', nominal: 'Potongan', bogo: 'Buy 1 Get 1' };

export default function PromosiPage() {
  const [promos, setPromos] = useState<Promo[]>(PROMOTIONS);
  const [filter, setFilter] = useState<'SEMUA' | 'aktif' | 'nonaktif'>('SEMUA');

  const toggle = (id: string) =>
    setPromos(prev => prev.map(p => p.id === id ? { ...p, aktif: !p.aktif } : p));

  const totalDiskon = TRANSACTIONS
    .filter(t => t.status === 'LUNAS' && t.promoId)
    .reduce((s, t) => {
      const promo = PROMOTIONS.find(p => p.id === t.promoId);
      if (!promo) return s;
      return s + (promo.tipe === 'persen' ? Math.round(t.total * promo.nilai / 100) : promo.nilai);
    }, 0);

  const filtered = promos.filter(p =>
    filter === 'SEMUA' ? true : filter === 'aktif' ? p.aktif : !p.aktif
  );

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Manajemen Promosi</h1>
          <p className="text-xs text-gray-500 mt-0.5">{promos.filter(p => p.aktif).length} promo aktif</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => askAI('Analisis efektivitas semua promosi dan berikan rekomendasi promo terbaik')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Analisa AI
          </button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Buat Promo Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Promo Aktif', value: `${promos.filter(p => p.aktif).length} promo`, color: 'text-[#0d8a6a]' },
          { label: 'Total Penggunaan Hari Ini', value: `${promos.reduce((s, p) => s + p.used, 0)}x`, color: 'text-blue-400' },
          { label: 'Total Diskon Diberikan', value: rp(totalDiskon), color: 'text-yellow-400' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {(['SEMUA', 'aktif', 'nonaktif'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Promo Cards */}
      <div className="space-y-3">
        {filtered.map(p => {
          const usedPct = Math.round((p.used / p.maxUse) * 100);
          return (
            <div key={p.id} className={`bg-[#0d2137] border rounded-xl p-4 ${p.aktif ? 'border-[#0d8a6a]/30' : 'border-white/10 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{p.nama}</p>
                    <span className="text-[10px] font-mono bg-[#071220] border border-white/10 px-2 py-0.5 rounded text-gray-400">{p.kode}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.aktif ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {p.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="text-[#0d8a6a] font-semibold">
                      {p.tipe === 'persen' ? `Diskon ${p.nilai}%` : p.tipe === 'nominal' ? `Potongan ${rp(p.nilai)}` : 'Buy 1 Get 1'}
                    </span>
                    <span>Min. order: {rp(p.minOrder)}</span>
                    <span>Berlaku s/d: {p.berlakuHingga}</span>
                  </div>
                  {/* Usage bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Penggunaan: {p.used}/{p.maxUse}</span>
                      <span>{usedPct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#071220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#0d8a6a] transition-all" style={{ width: `${Math.min(usedPct, 100)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => toggle(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      p.aktif
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                        : 'bg-[#0d8a6a]/10 border border-[#0d8a6a]/20 text-[#0d8a6a] hover:bg-[#0d8a6a] hover:text-white'
                    }`}>
                    {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-[10px] font-medium hover:text-white transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
