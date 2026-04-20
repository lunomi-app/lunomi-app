'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const salesChartData = [
  { jam: '00:00', hari_ini: 0, kemarin: 0 },
  { jam: '03:00', hari_ini: 0, kemarin: 15000 },
  { jam: '06:00', hari_ini: 25000, kemarin: 30000 },
  { jam: '09:00', hari_ini: 180000, kemarin: 140000 },
  { jam: '12:00', hari_ini: 420000, kemarin: 380000 },
  { jam: '15:00', hari_ini: 310000, kemarin: 290000 },
  { jam: '18:00', hari_ini: 650000, kemarin: 520000 },
  { jam: '21:00', hari_ini: 240000, kemarin: 200000 },
];

const kategoriPenjualan = [
  { nama: 'Espresso Base', pct: 82, color: '#f0c040' },
  { nama: 'Manual Brew', pct: 54, color: '#0d8a6a' },
  { nama: 'Non-Coffee', pct: 38, color: '#60a5fa' },
  { nama: 'Makanan', pct: 22, color: '#c084fc' },
  { nama: 'Merchandise', pct: 11, color: '#f97316' },
];

const metodePembayaran = [
  { nama: 'QRIS / GoPay', pct: 49, amount: 410000, color: '#0d8a6a' },
  { nama: 'Tunai', pct: 42, amount: 352000, color: '#60a5fa' },
  { nama: 'Debit/Kartu', pct: 9, amount: 82776, color: '#f0c040' },
];

const transaksiTerbaru = [
  { waktu: '21:38', kasir: 'Wenny', produk: 'Espresso Base x 2', jenis: 'Dine-In', pembayaran: 'QRIS', total: 144000, status: 'LUNAS' },
  { waktu: '21:15', kasir: 'LUTPI', produk: 'Latte x 1, Croissant x 1', jenis: 'Take Away', pembayaran: 'Tunai', total: 87000, status: 'LUNAS' },
  { waktu: '20:52', kasir: 'Eva', produk: 'Matcha Latte x 3', jenis: 'Dine-In', pembayaran: 'Debit', total: 210000, status: 'LUNAS' },
  { waktu: '20:11', kasir: 'Wenny', produk: 'Manual Brew x 1', jenis: 'Take Away', pembayaran: 'GoPay', total: 65000, status: 'PENDING' },
];

function rp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#071220] border border-white/10 rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name === 'hari_ini' ? 'Hari Ini' : 'Kemarin'}: {rp(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPenjualan() {
  const [period, setPeriod] = useState('hari-ini');

  return (
    <div className="p-5 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard Penjualan</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            📅 18 April 2026 · Semua Outlet · Real-time data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
            {[
              { label: 'Hari Ini', val: 'hari-ini' },
              { label: 'Minggu Ini', val: 'minggu-ini' },
              { label: 'Bulan Ini', val: 'bulan-ini' },
              { label: 'Custom', val: 'custom' },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setPeriod(p.val)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p.val ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#071220] border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tanya AI
          </button>
        </div>
      </div>

      {/* Red Flag Alert */}
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-400">3 Red Flag Terdeteksi Hari Ini</p>
          <p className="text-xs text-red-300/70 truncate">
            Pengeluaran operasional +240% dari rata-rata · Selisih stok 8% di Outlet Utama · Refund berulang dari kasir yang sama
          </p>
        </div>
        <button className="flex-shrink-0 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap">
          Lihat Detail →
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Penjualan Hari Ini', value: 'Rp 844.776', trend: '+18.4%', up: true, icon: '💰' },
          { label: 'Profit Bersih (After OPEX)', value: 'Rp 312.450', trend: '+11.2%', up: true, icon: '📈' },
          { label: 'Total Transaksi', value: '127', trend: '+23 transaksi', up: true, icon: '🧾' },
          { label: 'Customer Baru', value: '14', trend: '-3 vs kemarin', up: false, icon: '👥' },
        ].map((card) => (
          <div key={card.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-400 leading-tight">{card.label}</p>
              <span className="text-base">{card.icon}</span>
            </div>
            <p className="text-xl font-bold text-white mb-1">{card.value}</p>
            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
              card.up ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {card.up ? '▲' : '▼'} {card.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Chart + Categories */}
      <div className="grid grid-cols-5 gap-4">
        {/* Sales Chart */}
        <div className="col-span-3 bg-[#0d2137] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Grafik Penjualan Hari Ini vs Kemarin</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0d8a6a] inline-block" /> 18 Apr 2026</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> 17 Apr 2026</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="gToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d8a6a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d8a6a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gYesterday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a6a84" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4a6a84" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
              <XAxis dataKey="jam" stroke="#4a6a84" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4a6a84" tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hari_ini" stroke="#0d8a6a" fill="url(#gToday)" strokeWidth={2} />
              <Area type="monotone" dataKey="kemarin" stroke="#4a6a84" fill="url(#gYesterday)" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category + Payment */}
        <div className="col-span-2 space-y-4">
          {/* Penjualan per Kategori */}
          <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Penjualan per Kategori</p>
            <div className="space-y-2.5">
              {kategoriPenjualan.map((k) => (
                <div key={k.nama}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{k.nama}</span>
                    <span className="font-semibold" style={{ color: k.color }}>{k.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#071220] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${k.pct}%`, background: k.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Metode Pembayaran</p>
            <div className="space-y-2">
              {metodePembayaran.map((m) => (
                <div key={m.nama} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs text-gray-300">{m.nama}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 bg-[#071220] px-1.5 py-0.5 rounded">{m.pct}%</span>
                    <span className="text-xs font-semibold text-white">{rp(m.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Type Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Kontrol Fraud', value: '2', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '🚨' },
          { label: 'Dine-In', value: 'Rp 352k', color: 'text-white', bg: 'bg-[#0d2137] border-white/10', icon: '🍽️' },
          { label: 'Take Away', value: 'Rp 310k', color: 'text-white', bg: 'bg-[#0d2137] border-white/10', icon: '🥡' },
          { label: 'Order Online', value: 'Rp 182k', color: 'text-white', bg: 'bg-[#0d2137] border-white/10', icon: '📱' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
            <p className="text-xs text-gray-400 mb-1">{s.icon} {s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transaksi Terbaru */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold">Transaksi Terbaru</p>
          <button className="text-xs text-[#0d8a6a] hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                {['WAKTU', 'KASIR', 'PRODUK', 'JENIS ORDER', 'PEMBAYARAN', 'TOTAL', 'STATUS'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold tracking-wider uppercase text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksiTerbaru.map((t, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-2.5 text-gray-400 font-medium">{t.waktu}</td>
                  <td className="px-4 py-2.5 text-gray-300">{t.kasir}</td>
                  <td className="px-4 py-2.5 text-gray-300 max-w-[160px] truncate">{t.produk}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.jenis}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.pembayaran}</td>
                  <td className="px-4 py-2.5 text-[#0d8a6a] font-semibold">{rp(t.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'LUNAS'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
