'use client';
import { use } from 'react';

const LAPORAN_META: Record<string, { title: string; desc: string; icon: string }> = {
  penjualan: { title: 'Laporan Penjualan', desc: 'Ringkasan seluruh transaksi penjualan', icon: '📊' },
  dapur: { title: 'Laporan Dapur', desc: 'Rekap order dan waktu penyelesaian dapur', icon: '🍳' },
  produk: { title: 'Laporan Produk', desc: 'Performa produk dan menu terlaris', icon: '☕' },
  jasa: { title: 'Laporan Jasa', desc: 'Laporan layanan dan service charge', icon: '🛎️' },
  promo: { title: 'Laporan Promo & Loyalti', desc: 'Penggunaan promo dan program loyalitas', icon: '🎁' },
  pajak: { title: 'Laporan Pajak', desc: 'Rekapitulasi pajak penjualan (PPN)', icon: '🧾' },
  kasir: { title: 'Laporan Kasir', desc: 'Performa dan rekap per kasir', icon: '💼' },
  deposit: { title: 'Laporan Deposit', desc: 'Mutasi dan saldo deposit pelanggan', icon: '💳' },
  pelanggan: { title: 'Laporan Pelanggan', desc: 'Analisis kunjungan dan spending pelanggan', icon: '👥' },
  karyawan: { title: 'Laporan Karyawan', desc: 'Absensi dan performa karyawan', icon: '👤' },
  persediaan: { title: 'Laporan Persediaan', desc: 'Mutasi dan status stok bahan baku', icon: '📦' },
  pemasok: { title: 'Laporan Pemasok', desc: 'Pembelian dan hutang ke pemasok', icon: '🏭' },
  export: { title: 'Export PDF/Excel', desc: 'Export semua laporan ke PDF atau Excel', icon: '📁' },
  analisa: { title: 'Analisa Laporan', desc: 'Analisis mendalam dengan AI', icon: '🔍' },
  lengkap: { title: 'Laporan Lengkap', desc: 'Laporan komprehensif semua modul', icon: '📋' },
  promosi: { title: 'Manajemen Promosi', desc: 'Kelola promo dan diskon', icon: '🎯' },
  komisi: { title: 'Komisi', desc: 'Pengaturan dan laporan komisi karyawan', icon: '💰' },
  invoice: { title: 'Invoice', desc: 'Buat dan kelola invoice pelanggan', icon: '📄' },
  marketing: { title: 'Marketing', desc: 'Kampanye dan aktivitas pemasaran', icon: '📣' },
};

const SAMPLE_ROWS = [
  { periode: '01 Apr 2026', nilai: 2840000, item: 127 },
  { periode: '07 Apr 2026', nilai: 3120000, item: 145 },
  { periode: '14 Apr 2026', nilai: 2960000, item: 138 },
  { periode: '18 Apr 2026', nilai: 844776, item: 42 },
];

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function LaporanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = LAPORAN_META[slug] || { title: `Laporan ${slug}`, desc: 'Data laporan', icon: '📋' };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            <h1 className="text-xl font-bold">{meta.title}</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#0d2137] border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors">Export PDF</button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">Export Excel</button>
        </div>
      </div>

      {/* Filter period */}
      <div className="flex items-center gap-3">
        <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
          {['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Custom'].map(p => (
            <button key={p} className={`px-3 py-1.5 text-xs font-medium transition-colors ${p === 'Bulan Ini' ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Periode', value: rp(SAMPLE_ROWS.reduce((s, r) => s + r.nilai, 0)), sub: 'Apr 2026' },
          { label: 'Total Item', value: `${SAMPLE_ROWS.reduce((s, r) => s + r.item, 0)}`, sub: 'transaksi' },
          { label: 'Rata-rata Harian', value: rp(Math.round(SAMPLE_ROWS.reduce((s, r) => s + r.nilai, 0) / 18)), sub: 'per hari' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-lg font-bold text-[#0d8a6a]">{c.value}</p>
            <p className="text-[10px] text-gray-500">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold">Data Laporan</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              <th className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">PERIODE</th>
              <th className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">JUMLAH ITEM</th>
              <th className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">TOTAL NILAI</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((r, i) => (
              <tr key={i} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-2.5 text-gray-300">{r.periode}</td>
                <td className="px-4 py-2.5 text-gray-400">{r.item}</td>
                <td className="px-4 py-2.5 text-[#0d8a6a] font-semibold">{rp(r.nilai)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
