'use client';
import { useState } from 'react';
import { askAI } from '@/app/_components/AIAssistant';

const DATA = [
  { nama: 'Wenny Rahayu', role: 'kasir', status: 'Aktif', telp: '0812-1111-2222', bergabung: '01 Jan 2025', absenHari: 18, absenBulan: 22 },
  { nama: 'LUTPI Santoso', role: 'kasir', status: 'Aktif', telp: '0813-2222-3333', bergabung: '15 Mar 2024', absenHari: 18, absenBulan: 22 },
  { nama: 'Eva Kurniasih', role: 'kasir', status: 'Aktif', telp: '0814-3333-4444', bergabung: '10 Jun 2024', absenHari: 17, absenBulan: 22 },
  { nama: 'Budi Prasetyo', role: 'dapur', status: 'Aktif', telp: '0815-4444-5555', bergabung: '01 Apr 2024', absenHari: 18, absenBulan: 22 },
  { nama: 'Siti Aminah', role: 'dapur', status: 'Aktif', telp: '0816-5555-6666', bergabung: '20 Feb 2025', absenHari: 16, absenBulan: 22 },
  { nama: 'Andi Wijaya', role: 'karyawan', status: 'Nonaktif', telp: '0817-6666-7777', bergabung: '05 Aug 2023', absenHari: 0, absenBulan: 0 },
];

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400',
  kasir: 'bg-blue-500/15 text-blue-400',
  dapur: 'bg-orange-500/15 text-orange-400',
  karyawan: 'bg-gray-500/15 text-gray-400',
};

export default function KaryawanPage() {
  const [filter, setFilter] = useState('SEMUA');

  const filtered = DATA.filter(d => filter === 'SEMUA' || d.role === filter || (filter === 'Aktif' && d.status === 'Aktif') || (filter === 'Nonaktif' && d.status === 'Nonaktif'));

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Daftar Karyawan</h1>
          <p className="text-xs text-gray-500 mt-0.5">{DATA.filter(d => d.status === 'Aktif').length} aktif dari {DATA.length} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => askAI('Analisis performa karyawan dan saran jadwal shift yang optimal')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Analisa AI
          </button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Tambah Karyawan
          </button>
        </div>
      </div>

      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {['SEMUA', 'kasir', 'dapur', 'karyawan', 'Aktif', 'Nonaktif'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              {['NAMA', 'ROLE', 'STATUS', 'TELEPON', 'BERGABUNG', 'ABSEN HARI INI', 'ABSEN BULAN INI'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((k, i) => (
              <tr key={k.nama} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#0d8a6a]">
                      {k.nama[0]}
                    </div>
                    <span className="text-white font-medium">{k.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${ROLE_STYLE[k.role]}`}>{k.role}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${k.status === 'Aktif' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>{k.status}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-400">{k.telp}</td>
                <td className="px-4 py-2.5 text-gray-400">{k.bergabung}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={k.absenHari > 0 ? 'text-green-400 font-semibold' : 'text-red-400'}>{k.absenHari > 0 ? '✓ Hadir' : '✗ Absen'}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-300 text-center">{k.absenBulan > 0 ? `${k.absenBulan} hari` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
