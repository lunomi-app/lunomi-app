'use client';
import { useState } from 'react';

const USERS = [
  { nama: 'Admin Utama', email: 'admin@clecogroup.com', role: 'admin', status: 'Aktif' },
  { nama: 'Wenny Rahayu', email: 'wenny@clecogroup.com', role: 'kasir', status: 'Aktif' },
  { nama: 'LUTPI Santoso', email: 'lutpi@clecogroup.com', role: 'kasir', status: 'Aktif' },
  { nama: 'Eva Kurniasih', email: 'eva@clecogroup.com', role: 'kasir', status: 'Aktif' },
  { nama: 'Budi Prasetyo', email: 'budi@clecogroup.com', role: 'dapur', status: 'Aktif' },
  { nama: 'Siti Aminah', email: 'siti@clecogroup.com', role: 'dapur', status: 'Aktif' },
];

const ROLES = ['admin', 'kasir', 'dapur', 'karyawan'];

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-purple-500/15 text-purple-400',
  kasir: 'bg-blue-500/15 text-blue-400',
  dapur: 'bg-orange-500/15 text-orange-400',
  karyawan: 'bg-gray-500/15 text-gray-400',
};

const ROLE_ACCESS: Record<string, string[]> = {
  admin: ['Dashboard Penjualan', 'Keuangan', 'Kasir', 'Kitchen', 'Manajemen', 'Laporan', 'Karyawan', 'Pengaturan'],
  kasir: ['Kasir', 'Absensi'],
  dapur: ['Kitchen Display', 'Absensi'],
  karyawan: ['Absensi'],
};

export default function PengaturanPage() {
  const [tab, setTab] = useState<'bisnis' | 'pengguna' | 'akses'>('bisnis');
  const [users, setUsers] = useState(USERS);

  const changeRole = (email: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
  };

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-xl font-bold">Pengaturan</h1>

      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {(['bisnis', 'pengguna', 'akses'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {t === 'bisnis' ? 'Info Bisnis' : t === 'pengguna' ? 'Pengguna & Role' : 'Hak Akses'}
          </button>
        ))}
      </div>

      {tab === 'bisnis' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl p-5 space-y-4 max-w-lg">
          {[
            { label: 'Nama Bisnis', value: 'CLECO GROUP' },
            { label: 'Alamat', value: 'Jl. Kopi Nikmat No. 1, Jakarta' },
            { label: 'Telepon', value: '021-1234-5678' },
            { label: 'Email Bisnis', value: 'info@clecogroup.com' },
            { label: 'NPWP', value: '12.345.678.9-012.000' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{f.label}</label>
              <input
                defaultValue={f.value}
                className="mt-1 w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0d8a6a]"
              />
            </div>
          ))}
          <button className="px-4 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            Simpan Perubahan
          </button>
        </div>
      )}

      {tab === 'pengguna' && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold">Daftar Pengguna</p>
            <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
              + Tambah User
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['NAMA', 'EMAIL', 'ROLE', 'STATUS', 'AKSI'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.email} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-4 py-2.5 text-white font-medium">{u.nama}</td>
                  <td className="px-4 py-2.5 text-gray-400">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.email, e.target.value)}
                      className={`text-[10px] px-2 py-1 rounded-full font-bold border-0 outline-none cursor-pointer ${ROLE_STYLE[u.role]} bg-transparent`}
                    >
                      {ROLES.map(r => <option key={r} value={r} className="bg-[#0d2137] text-white capitalize">{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400">{u.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'akses' && (
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(role => (
            <div key={role} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${ROLE_STYLE[role]}`}>{role}</span>
              </div>
              <div className="space-y-1.5">
                {ROLE_ACCESS[role].map(a => (
                  <div key={a} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-[#0d8a6a]">✓</span> {a}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
