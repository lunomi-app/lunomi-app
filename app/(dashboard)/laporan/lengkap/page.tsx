'use client';
import { useState } from 'react';
import { TRANSACTIONS, PRODUCTS, STAFF, CUSTOMERS, PROMOTIONS, rp, rpK } from '@/lib/data/store';
import { askAI } from '@/app/_components/AIAssistant';

const lunasTrx = TRANSACTIONS.filter(t => t.status === 'LUNAS');
const totalRev = lunasTrx.reduce((s, t) => s + t.total, 0);
const totalHPP = lunasTrx.reduce((s, t) => s + t.items.reduce((si, i) => {
  const p = PRODUCTS.find(p => p.id === i.produkId);
  return si + (p?.hpp || 0) * i.qty;
}, 0), 0);
const grossProfit = totalRev - totalHPP;

const byPayment = lunasTrx.reduce((acc, t) => {
  acc[t.metode] = (acc[t.metode] || 0) + t.total;
  return acc;
}, {} as Record<string, number>);

const byJenis = lunasTrx.reduce((acc, t) => {
  acc[t.jenis] = (acc[t.jenis] || 0) + t.total;
  return acc;
}, {} as Record<string, number>);

const prodSales: Record<string, { qty: number; rev: number; hpp: number }> = {};
lunasTrx.forEach(t => t.items.forEach(i => {
  const prod = PRODUCTS.find(p => p.id === i.produkId);
  if (!prodSales[i.nama]) prodSales[i.nama] = { qty: 0, rev: 0, hpp: 0 };
  prodSales[i.nama].qty += i.qty;
  prodSales[i.nama].rev += i.qty * i.harga;
  prodSales[i.nama].hpp += (prod?.hpp || 0) * i.qty;
}));
const productRows = Object.entries(prodSales).sort((a, b) => b[1].rev - a[1].rev);

const staffRows = STAFF.filter(s => s.status === 'Aktif').map(s => ({
  nama: s.nama, role: s.role,
  trx: lunasTrx.filter(t => t.kasirId === s.id).length,
  rev: lunasTrx.filter(t => t.kasirId === s.id).reduce((sum, t) => sum + t.total, 0),
}));

const SECTIONS = ['Ringkasan', 'Penjualan', 'Produk', 'Karyawan', 'Pelanggan', 'Keuangan'];

export default function LaporanLengkapPage() {
  const [section, setSection] = useState('Ringkasan');

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-xl font-bold">Laporan Lengkap</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">18 April 2026 · Komprehensif semua modul</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => askAI('Analisis keuangan hari ini dan berikan insight mendalam tentang profitabilitas')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Tanya AI
          </button>
          <button className="px-3 py-1.5 bg-[#0d2137] border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors">Export PDF</button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">Export Excel</button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${section === s ? 'bg-[#0d8a6a] text-white' : 'bg-[#071220] border border-white/10 text-gray-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      {section === 'Ringkasan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Penjualan', value: rp(totalRev), sub: `${lunasTrx.length} transaksi lunas`, color: 'text-[#0d8a6a]' },
              { label: 'HPP (Harga Pokok)', value: rp(totalHPP), sub: `${Math.round(totalHPP/totalRev*100)}% dari revenue`, color: 'text-red-400' },
              { label: 'Gross Profit', value: rp(grossProfit), sub: `Margin ${Math.round(grossProfit/totalRev*100)}%`, color: 'text-green-400' },
              { label: 'Transaksi Lunas', value: `${lunasTrx.length}`, sub: `${TRANSACTIONS.filter(t=>t.status==='PENDING').length} pending`, color: 'text-blue-400' },
              { label: 'Refund', value: `${TRANSACTIONS.filter(t=>t.status==='REFUND').length}`, sub: rp(TRANSACTIONS.filter(t=>t.status==='REFUND').reduce((s,t)=>s+t.total,0)), color: 'text-yellow-400' },
              { label: 'Customer Baru', value: '14', sub: 'Hari ini', color: 'text-purple-400' },
            ].map(c => (
              <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
              <p className="text-sm font-semibold mb-3">Penjualan per Metode Bayar</p>
              <div className="space-y-2">
                {Object.entries(byPayment).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-white font-semibold">{rp(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
              <p className="text-sm font-semibold mb-3">Penjualan per Jenis Order</p>
              <div className="space-y-2">
                {Object.entries(byJenis).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-white font-semibold">{rp(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'Penjualan' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['ID', 'WAKTU', 'KASIR', 'ITEMS', 'METODE', 'JENIS', 'TOTAL', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr key={t.id} className={`border-b border-white/5 hover:bg-white/3 ${i%2===1?'bg-white/[0.01]':''}`}>
                  <td className="px-4 py-2.5 text-[#0d8a6a] font-mono">{t.id}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.waktu}</td>
                  <td className="px-4 py-2.5 text-gray-300">{t.kasir}</td>
                  <td className="px-4 py-2.5 text-gray-300 max-w-[140px] truncate">{t.items.map(i=>`${i.nama} x${i.qty}`).join(', ')}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.metode}</td>
                  <td className="px-4 py-2.5 text-gray-400">{t.jenis}</td>
                  <td className="px-4 py-2.5 text-white font-bold">{rp(t.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status==='LUNAS'?'bg-green-500/15 text-green-400':t.status==='PENDING'?'bg-yellow-500/15 text-yellow-400':'bg-red-500/15 text-red-400'}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'Produk' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['PRODUK', 'QTY TERJUAL', 'REVENUE', 'HPP', 'GROSS PROFIT', 'MARGIN'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productRows.map(([nama, data], i) => {
                const gp = data.rev - data.hpp;
                const margin = data.rev > 0 ? Math.round(gp / data.rev * 100) : 0;
                return (
                  <tr key={nama} className={`border-b border-white/5 hover:bg-white/3 ${i%2===1?'bg-white/[0.01]':''}`}>
                    <td className="px-4 py-2.5 text-white font-medium">{nama}</td>
                    <td className="px-4 py-2.5 text-gray-400">{data.qty}x</td>
                    <td className="px-4 py-2.5 text-[#0d8a6a] font-semibold">{rp(data.rev)}</td>
                    <td className="px-4 py-2.5 text-red-400">{rp(data.hpp)}</td>
                    <td className="px-4 py-2.5 text-green-400 font-semibold">{rp(gp)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${margin >= 50 ? 'text-green-400' : margin >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>{margin}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {section === 'Karyawan' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['KARYAWAN', 'ROLE', 'JML TRANSAKSI', 'TOTAL PENJUALAN', 'KONTRIBUSI'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffRows.map((s, i) => (
                <tr key={s.nama} className={`border-b border-white/5 hover:bg-white/3 ${i%2===1?'bg-white/[0.01]':''}`}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#0d8a6a]">{s.nama[0]}</div><span className="text-white font-medium">{s.nama}</span></div></td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{s.role}</td>
                  <td className="px-4 py-3 text-gray-300">{s.trx > 0 ? s.trx : '-'}</td>
                  <td className="px-4 py-3 text-[#0d8a6a] font-semibold">{s.rev > 0 ? rp(s.rev) : '-'}</td>
                  <td className="px-4 py-3">{totalRev > 0 && s.rev > 0 ? <span className="text-yellow-400 font-semibold">{Math.round(s.rev/totalRev*100)}%</span> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'Pelanggan' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['NAMA', 'MEMBER', 'TOTAL KUNJUNGAN', 'TOTAL SPEND', 'TERAKHIR KUNJUNGAN'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.sort((a,b)=>b.totalSpend-a.totalSpend).map((c, i) => (
                <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 ${i%2===1?'bg-white/[0.01]':''}`}>
                  <td className="px-4 py-2.5 text-white font-medium">{c.nama}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.member==='Platinum'?'bg-cyan-500/15 text-cyan-400':c.member==='Gold'?'bg-yellow-500/15 text-yellow-400':c.member==='Silver'?'bg-gray-500/15 text-gray-400':'bg-blue-500/15 text-blue-400'}`}>{c.member}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{c.kunjungan}x</td>
                  <td className="px-4 py-2.5 text-[#0d8a6a] font-semibold">{rp(c.totalSpend)}</td>
                  <td className="px-4 py-2.5 text-gray-400">{c.terakhir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'Keuangan' && (
        <div className="space-y-3">
          {[
            { label: 'Total Revenue', value: totalRev, color: 'text-green-400' },
            { label: 'HPP / COGS', value: -totalHPP, color: 'text-red-400' },
            { label: 'Gross Profit', value: grossProfit, color: 'text-[#0d8a6a]', bold: true },
            { label: 'Biaya Operasional (est.)', value: -Math.round(grossProfit * 0.35), color: 'text-red-400' },
            { label: 'Laba Bersih (est.)', value: Math.round(grossProfit * 0.65), color: 'text-yellow-400', bold: true },
          ].map((row, i) => (
            <div key={row.label} className={`flex justify-between items-center px-5 py-3 rounded-xl ${row.bold ? 'bg-[#0d3b4a] border border-[#0d8a6a]/30' : 'bg-[#0d2137] border border-white/10'}`}>
              <span className={`text-sm ${row.bold ? 'font-bold text-white' : 'text-gray-400'}`}>{row.label}</span>
              <span className={`text-base font-bold ${row.color}`}>{row.value < 0 ? '-' : ''}{rp(Math.abs(row.value))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
