'use client';
import { useState } from 'react';

const DATA = [
  { id: '#AP-001', nama: 'Ahmad Fauzi', telp: '0812-3456-7890', tanggal: '18 Apr 2026', jam: '14:00', pax: 4, catatan: 'Anniversary', status: 'CONFIRMED' },
  { id: '#AP-002', nama: 'Sari Dewi', telp: '0813-2345-6789', tanggal: '18 Apr 2026', jam: '16:30', pax: 2, catatan: '', status: 'CONFIRMED' },
  { id: '#AP-003', nama: 'Budi K.', telp: '0815-4444-5555', tanggal: '19 Apr 2026', jam: '10:00', pax: 6, catatan: 'Meeting kantor', status: 'PENDING' },
  { id: '#AP-004', nama: 'Maya A.', telp: '0816-5555-6666', tanggal: '19 Apr 2026', jam: '13:00', pax: 3, catatan: '', status: 'PENDING' },
  { id: '#AP-005', nama: 'Rina P.', telp: '0814-6789-0123', tanggal: '17 Apr 2026', jam: '15:00', pax: 2, catatan: '', status: 'SELESAI' },
];

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-green-500/15 text-green-400',
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  SELESAI: 'bg-gray-500/15 text-gray-400',
  BATAL: 'bg-red-500/15 text-red-400',
};

export default function AppointmentPage() {
  const [filter, setFilter] = useState('SEMUA');

  const filtered = DATA.filter(d => filter === 'SEMUA' || d.status === filter);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Appointment / Reservasi</h1>
          <p className="text-xs text-gray-500 mt-0.5">{DATA.filter(d => d.status !== 'SELESAI').length} reservasi aktif</p>
        </div>
        <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          + Buat Reservasi
        </button>
      </div>

      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {['SEMUA', 'CONFIRMED', 'PENDING', 'SELESAI'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map(ap => (
          <div key={ap.id} className="bg-[#0d2137] border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="text-center bg-[#071220] rounded-xl px-3 py-2 flex-shrink-0">
              <p className="text-xs text-gray-500">{ap.tanggal.split(' ').slice(1).join(' ')}</p>
              <p className="text-xl font-black text-white">{ap.jam}</p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">{ap.nama}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${STATUS_STYLE[ap.status]}`}>{ap.status}</span>
              </div>
              <p className="text-xs text-gray-500">{ap.telp} · {ap.pax} orang</p>
              {ap.catatan && <p className="text-[10px] text-yellow-400/70 mt-1 italic">"{ap.catatan}"</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {ap.status === 'PENDING' && (
                <button className="px-2.5 py-1.5 bg-[#0d8a6a]/20 text-[#0d8a6a] border border-[#0d8a6a]/30 rounded text-[10px] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
                  Konfirmasi
                </button>
              )}
              <button className="px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-medium hover:bg-red-500 hover:text-white transition-colors">
                Batal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
