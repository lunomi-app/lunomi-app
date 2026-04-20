'use client';
import { useState } from 'react';
import { STAFF, TRANSACTIONS, rp, salesByStaff, countByStaff, totalKomisiByStaff } from '@/lib/data/store';

const PERIODE = ['Apr 2026', 'Mar 2026', 'Feb 2026'];

export default function KomisiPage() {
  const [periode, setPeriode] = useState('Apr 2026');
  const [dibayar, setDibayar] = useState<string[]>([]);

  const activeStaff = STAFF.filter(s => s.status === 'Aktif');

  const rows = activeStaff.map(s => ({
    ...s,
    jumlahTrx: countByStaff(s.id),
    totalSales: salesByStaff(s.id),
    komisi: totalKomisiByStaff(s.id),
    sudahDibayar: dibayar.includes(s.id),
  }));

  const totalKomisi = rows.reduce((sum, r) => sum + r.komisi, 0);
  const totalTerbayar = rows.filter(r => r.sudahDibayar).reduce((sum, r) => sum + r.komisi, 0);
  const totalTerhutang = totalKomisi - totalTerbayar;

  const bayar = (id: string) => setDibayar(prev => [...prev, id]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Sistem Komisi</h1>
          <p className="text-xs text-gray-500 mt-0.5">Periode: {periode}</p>
        </div>
        <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
          {PERIODE.map(p => (
            <button key={p} onClick={() => setPeriode(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${periode === p ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Komisi Periode Ini', value: rp(totalKomisi), color: 'text-white', sub: `${activeStaff.length} karyawan` },
          { label: 'Sudah Dibayar', value: rp(totalTerbayar), color: 'text-green-400', sub: `${dibayar.length} orang` },
          { label: 'Belum Dibayar', value: rp(totalTerhutang), color: 'text-yellow-400', sub: `${activeStaff.length - dibayar.length} orang` },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold">Detail Komisi per Karyawan</p>
          <button
            onClick={() => setDibayar(activeStaff.filter(s => !dibayar.includes(s.id)).map(s => s.id).concat(dibayar))}
            className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            Bayar Semua
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              {['NAMA', 'ROLE', 'TOTAL PENJUALAN', 'JML TRX', 'RATE', 'KOMISI', 'STATUS', 'AKSI'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#0d8a6a]">
                      {r.nama[0]}
                    </div>
                    <span className="text-white font-medium">{r.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 capitalize">{r.role}</td>
                <td className="px-4 py-3 text-white font-semibold">{r.totalSales > 0 ? rp(r.totalSales) : '-'}</td>
                <td className="px-4 py-3 text-gray-400">{r.jumlahTrx > 0 ? `${r.jumlahTrx} trx` : '-'}</td>
                <td className="px-4 py-3 text-gray-400">{r.komisiRate}%</td>
                <td className="px-4 py-3 text-[#0d8a6a] font-bold">{r.komisi > 0 ? rp(r.komisi) : rp(0)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.sudahDibayar ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                    {r.sudahDibayar ? 'Lunas' : 'Belum'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!r.sudahDibayar && r.komisi > 0 && (
                    <button onClick={() => bayar(r.id)}
                      className="px-2.5 py-1 bg-[#0d8a6a]/10 border border-[#0d8a6a]/20 text-[#0d8a6a] rounded text-[10px] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
                      Bayar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 text-xs text-blue-300/70">
        ℹ Komisi dihitung otomatis dari total penjualan masing-masing kasir × rate komisi. Rate komisi dapat diubah di menu Pengaturan.
      </div>
    </div>
  );
}
