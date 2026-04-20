'use client';
import { useState } from 'react';
import { CAMPAIGNS } from '@/lib/data/store';

const CHANNEL_ICON: Record<string, string> = {
  Instagram: '📸',
  WhatsApp: '💬',
  TikTok: '🎵',
  Email: '📧',
  Facebook: '👥',
};

const STATUS_STYLE: Record<string, string> = {
  Aktif: 'bg-green-500/15 text-green-400',
  Upcoming: 'bg-blue-500/15 text-blue-400',
  Selesai: 'bg-gray-500/15 text-gray-400',
  Dibatalkan: 'bg-red-500/15 text-red-400',
};

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function MarketingPage() {
  const [campaigns] = useState(CAMPAIGNS);
  const [filter, setFilter] = useState('SEMUA');

  const filtered = campaigns.filter(c => filter === 'SEMUA' || c.status === filter);

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalKonversi = campaigns.reduce((s, c) => s + c.konversi, 0);
  const avgCPL = totalKonversi > 0 ? Math.round(totalBudget / totalKonversi) : 0;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Marketing & Kampanye</h1>
          <p className="text-xs text-gray-500 mt-0.5">{campaigns.filter(c => c.status === 'Aktif').length} kampanye aktif</p>
        </div>
        <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          + Buat Kampanye
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Budget', value: rp(totalBudget), color: 'text-yellow-400' },
          { label: 'Total Reach', value: `${totalReach.toLocaleString('id-ID')} org`, color: 'text-blue-400' },
          { label: 'Total Konversi', value: `${totalKonversi} transaksi`, color: 'text-[#0d8a6a]' },
          { label: 'Biaya per Konversi', value: rp(avgCPL), color: 'text-purple-400' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-base font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Channel Summary */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
        <p className="text-sm font-semibold mb-3">Performa per Channel</p>
        <div className="grid grid-cols-5 gap-3">
          {['Instagram', 'WhatsApp', 'TikTok', 'Email'].map(ch => {
            const chCampaigns = campaigns.filter(c => c.channel === ch);
            const chReach = chCampaigns.reduce((s, c) => s + c.reach, 0);
            const chBudget = chCampaigns.reduce((s, c) => s + c.budget, 0);
            return (
              <div key={ch} className="text-center">
                <div className="text-2xl mb-1">{CHANNEL_ICON[ch]}</div>
                <p className="text-xs font-semibold text-white">{ch}</p>
                <p className="text-[10px] text-[#0d8a6a]">{chReach.toLocaleString()} reach</p>
                <p className="text-[10px] text-gray-500">{rp(chBudget)}</p>
              </div>
            );
          })}
          <div className="text-center">
            <div className="text-2xl mb-1">📣</div>
            <p className="text-xs font-semibold text-white">Total</p>
            <p className="text-[10px] text-[#0d8a6a]">{totalReach.toLocaleString()} reach</p>
            <p className="text-[10px] text-gray-500">{rp(totalBudget)}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {['SEMUA', 'Aktif', 'Upcoming', 'Selesai'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Campaigns */}
      <div className="space-y-3">
        {filtered.map(c => {
          const konversiRate = c.reach > 0 ? ((c.konversi / c.reach) * 100).toFixed(1) : '0';
          const cpl = c.konversi > 0 ? Math.round(c.budget / c.konversi) : 0;
          return (
            <div key={c.id} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{CHANNEL_ICON[c.channel] || '📢'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{c.nama}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.channel} · {c.mulai} – {c.selesai}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {c.status === 'Aktif' && (
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-[10px] hover:text-white transition-colors">
                      Lihat Detail
                    </button>
                  )}
                  {c.status === 'Upcoming' && (
                    <button className="px-3 py-1.5 bg-[#0d8a6a]/10 border border-[#0d8a6a]/20 text-[#0d8a6a] rounded-lg text-[10px] hover:bg-[#0d8a6a] hover:text-white transition-colors">
                      Mulai Sekarang
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Budget', value: rp(c.budget) },
                  { label: 'Total Reach', value: c.reach > 0 ? c.reach.toLocaleString() : '-' },
                  { label: 'Konversi', value: c.konversi > 0 ? `${c.konversi} (${konversiRate}%)` : '-' },
                  { label: 'Biaya/Konversi', value: cpl > 0 ? rp(cpl) : '-' },
                ].map(m => (
                  <div key={m.label} className="bg-[#071220] rounded-lg p-2">
                    <p className="text-[9px] text-gray-500 uppercase mb-0.5">{m.label}</p>
                    <p className="text-xs font-semibold text-white">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
