'use client';
import { use } from 'react';
import { TRANSACTIONS, PRODUCTS, STAFF, CUSTOMERS, PROMOTIONS, INVOICES, rp } from '@/lib/data/store';

// ── per-slug config ─────────────────────────────────────────────────────────

type Row = Record<string, string | number>;

interface SlugConfig {
  title: string; icon: string; desc: string;
  summaryCards: { label: string; value: string; color: string }[];
  columns: string[];
  rows: Row[];
}

function buildConfig(slug: string): SlugConfig {
  const lunasTrx = TRANSACTIONS.filter(t => t.status === 'LUNAS');

  if (slug === 'penjualan') {
    return {
      title: 'Laporan Penjualan', icon: '📊', desc: 'Detail seluruh transaksi penjualan',
      summaryCards: [
        { label: 'Total Revenue', value: rp(lunasTrx.reduce((s,t)=>s+t.total,0)), color: 'text-[#0d8a6a]' },
        { label: 'Transaksi Lunas', value: `${lunasTrx.length}`, color: 'text-blue-400' },
        { label: 'Rata-rata Order', value: rp(Math.round(lunasTrx.reduce((s,t)=>s+t.total,0)/Math.max(lunasTrx.length,1))), color: 'text-white' },
      ],
      columns: ['ID', 'WAKTU', 'KASIR', 'TOTAL', 'METODE', 'STATUS'],
      rows: TRANSACTIONS.map(t => ({ ID: t.id, WAKTU: t.waktu, KASIR: t.kasir, TOTAL: rp(t.total), METODE: t.metode, STATUS: t.status })),
    };
  }

  if (slug === 'dapur') {
    const orders = [
      { no: '#K-001', item: 'Espresso Base x2, Croissant x1', masuk: '22:10', selesai: '22:14', durasi: '4 mnt', status: 'Selesai' },
      { no: '#K-002', item: 'Matcha Latte x1', masuk: '22:05', selesai: '22:08', durasi: '3 mnt', status: 'Selesai' },
      { no: '#K-003', item: 'Manual Brew V60 x2', masuk: '21:55', selesai: '22:03', durasi: '8 mnt', status: 'Selesai' },
      { no: '#K-004', item: 'Kopi Susu x3, Cake x1', masuk: '21:48', selesai: '21:54', durasi: '6 mnt', status: 'Selesai' },
    ];
    return {
      title: 'Laporan Dapur', icon: '🍳', desc: 'Rekap order dan throughput dapur',
      summaryCards: [
        { label: 'Total Order Diproses', value: `${orders.length}`, color: 'text-[#0d8a6a]' },
        { label: 'Rata-rata Waktu', value: '5.25 mnt', color: 'text-blue-400' },
        { label: 'Efisiensi Dapur', value: '94%', color: 'text-green-400' },
      ],
      columns: ['NO ORDER', 'ITEM', 'MASUK', 'SELESAI', 'DURASI', 'STATUS'],
      rows: orders.map(o => ({ 'NO ORDER': o.no, ITEM: o.item, MASUK: o.masuk, SELESAI: o.selesai, DURASI: o.durasi, STATUS: o.status })),
    };
  }

  if (slug === 'produk') {
    const prodSales: Record<string, { qty: number; rev: number }> = {};
    lunasTrx.forEach(t => t.items.forEach(i => {
      if (!prodSales[i.nama]) prodSales[i.nama] = { qty: 0, rev: 0 };
      prodSales[i.nama].qty += i.qty;
      prodSales[i.nama].rev += i.qty * i.harga;
    }));
    const rows = Object.entries(prodSales)
      .sort((a, b) => b[1].rev - a[1].rev)
      .map(([nama, data]) => {
        const prod = PRODUCTS.find(p => p.nama === nama);
        return { PRODUK: nama, KATEGORI: prod?.kategori || '-', 'QTY TERJUAL': data.qty, REVENUE: rp(data.rev), 'HARGA JUAL': rp(prod?.harga || 0) };
      });
    return {
      title: 'Laporan Produk', icon: '☕', desc: 'Performa penjualan per produk',
      summaryCards: [
        { label: 'Produk Terjual', value: `${Object.keys(prodSales).length} jenis`, color: 'text-[#0d8a6a]' },
        { label: 'Total Unit', value: `${Object.values(prodSales).reduce((s,d)=>s+d.qty,0)} pcs`, color: 'text-blue-400' },
        { label: 'Revenue Produk', value: rp(Object.values(prodSales).reduce((s,d)=>s+d.rev,0)), color: 'text-white' },
      ],
      columns: ['PRODUK', 'KATEGORI', 'QTY TERJUAL', 'REVENUE', 'HARGA JUAL'],
      rows,
    };
  }

  if (slug === 'kasir') {
    const rows = STAFF.filter(s => s.role === 'kasir').map(s => ({
      NAMA: s.nama,
      'JML TRX': lunasTrx.filter(t => t.kasirId === s.id).length,
      'TOTAL PENJUALAN': rp(lunasTrx.filter(t => t.kasirId === s.id).reduce((sum, t) => sum + t.total, 0)),
      'RATA-RATA ORDER': rp(Math.round(lunasTrx.filter(t=>t.kasirId===s.id).reduce((s,t)=>s+t.total,0)/Math.max(lunasTrx.filter(t=>t.kasirId===s.id).length,1))),
      STATUS: s.status,
    }));
    return {
      title: 'Laporan Kasir', icon: '💼', desc: 'Performa dan rekap per kasir',
      summaryCards: [
        { label: 'Total Kasir Aktif', value: `${STAFF.filter(s=>s.role==='kasir'&&s.status==='Aktif').length}`, color: 'text-[#0d8a6a]' },
        { label: 'Total Transaksi', value: `${lunasTrx.length}`, color: 'text-blue-400' },
        { label: 'Revenue Total', value: rp(lunasTrx.reduce((s,t)=>s+t.total,0)), color: 'text-white' },
      ],
      columns: ['NAMA', 'JML TRX', 'TOTAL PENJUALAN', 'RATA-RATA ORDER', 'STATUS'],
      rows,
    };
  }

  if (slug === 'pelanggan') {
    return {
      title: 'Laporan Pelanggan', icon: '👥', desc: 'Analisis kunjungan dan spending pelanggan',
      summaryCards: [
        { label: 'Total Pelanggan', value: `${CUSTOMERS.length}`, color: 'text-[#0d8a6a]' },
        { label: 'Customer Baru Bulan Ini', value: '14', color: 'text-blue-400' },
        { label: 'Total Lifetime Value', value: rp(CUSTOMERS.reduce((s,c)=>s+c.totalSpend,0)), color: 'text-white' },
      ],
      columns: ['NAMA', 'MEMBER', 'KUNJUNGAN', 'TOTAL SPEND', 'TERAKHIR'],
      rows: CUSTOMERS.sort((a,b)=>b.totalSpend-a.totalSpend).map(c => ({
        NAMA: c.nama, MEMBER: c.member, KUNJUNGAN: c.kunjungan, 'TOTAL SPEND': rp(c.totalSpend), TERAKHIR: c.terakhir,
      })),
    };
  }

  if (slug === 'karyawan') {
    return {
      title: 'Laporan Karyawan', icon: '👤', desc: 'Absensi dan performa karyawan',
      summaryCards: [
        { label: 'Total Karyawan Aktif', value: `${STAFF.filter(s=>s.status==='Aktif').length}`, color: 'text-[#0d8a6a]' },
        { label: 'Absen Hari Ini', value: '5 hadir', color: 'text-green-400' },
        { label: 'Total Jam Kerja', value: '40 jam', color: 'text-white' },
      ],
      columns: ['NAMA', 'ROLE', 'STATUS', 'BERGABUNG', 'ABSEN BULAN INI'],
      rows: STAFF.map(s => ({ NAMA: s.nama, ROLE: s.role, STATUS: s.status, BERGABUNG: s.bergabung, 'ABSEN BULAN INI': s.status === 'Aktif' ? '22 hari' : '-' })),
    };
  }

  if (slug === 'persediaan') {
    return {
      title: 'Laporan Persediaan', icon: '📦', desc: 'Mutasi dan status stok bahan baku',
      summaryCards: [
        { label: 'Total Item', value: `${PRODUCTS.length}`, color: 'text-[#0d8a6a]' },
        { label: 'Stok Menipis', value: '3 item', color: 'text-yellow-400' },
        { label: 'Stok Habis', value: '1 item', color: 'text-red-400' },
      ],
      columns: ['PRODUK', 'KATEGORI', 'STOK SAAT INI', 'HPP/UNIT', 'STATUS'],
      rows: PRODUCTS.map(p => ({
        PRODUK: p.nama, KATEGORI: p.kategori, 'STOK SAAT INI': `${p.stok} pcs`, 'HPP/UNIT': rp(p.hpp),
        STATUS: p.stok === 0 ? 'Habis' : p.stok < 30 ? 'Menipis' : 'OK',
      })),
    };
  }

  if (slug === 'pajak') {
    const subtotal = lunasTrx.reduce((s,t)=>s+t.total,0);
    const ppn = Math.round(subtotal * 0.11);
    return {
      title: 'Laporan Pajak', icon: '🧾', desc: 'Rekapitulasi PPN dan pajak penjualan',
      summaryCards: [
        { label: 'Total Penjualan (DPP)', value: rp(subtotal), color: 'text-white' },
        { label: 'PPN 11%', value: rp(ppn), color: 'text-yellow-400' },
        { label: 'Total + PPN', value: rp(subtotal + ppn), color: 'text-[#0d8a6a]' },
      ],
      columns: ['TANGGAL', 'JENIS', 'DPP', 'PPN (11%)', 'TOTAL'],
      rows: [
        { TANGGAL: '18 Apr 2026', JENIS: 'Penjualan Harian', DPP: rp(subtotal), 'PPN (11%)': rp(ppn), TOTAL: rp(subtotal + ppn) },
      ],
    };
  }

  if (slug === 'deposit') {
    return {
      title: 'Laporan Deposit', icon: '💳', desc: 'Mutasi dan saldo deposit member',
      summaryCards: [
        { label: 'Total Member Aktif', value: `${CUSTOMERS.length}`, color: 'text-[#0d8a6a]' },
        { label: 'Total Saldo Deposit', value: rp(1850000), color: 'text-blue-400' },
        { label: 'Penggunaan Hari Ini', value: rp(320000), color: 'text-yellow-400' },
      ],
      columns: ['NAMA', 'MEMBER', 'SALDO DEPOSIT', 'PENGGUNAAN', 'SALDO AKHIR'],
      rows: CUSTOMERS.filter(c=>c.member !== 'Regular').map(c => ({
        NAMA: c.nama, MEMBER: c.member,
        'SALDO DEPOSIT': rp(c.member==='Platinum'?500000:c.member==='Gold'?300000:150000),
        'PENGGUNAAN': rp(0), 'SALDO AKHIR': rp(c.member==='Platinum'?500000:c.member==='Gold'?300000:150000),
      })),
    };
  }

  if (slug === 'pemasok') {
    const suppliers = [
      { nama: 'CV Kopi Nusantara', item: 'Biji Kopi Arabika & Robusta', total: 1800000, lastOrder: '15 Apr 2026', status: 'Lunas' },
      { nama: 'PT Dairy Prima', item: 'Susu Full Cream, Susu Oat', total: 650000, lastOrder: '16 Apr 2026', status: 'Lunas' },
      { nama: 'Toko Matcha Jaya', item: 'Matcha Powder', total: 320000, lastOrder: '18 Apr 2026', status: 'Pending' },
      { nama: 'CV Packaging Indo', item: 'Gelas, Kantong, Sedotan', total: 480000, lastOrder: '12 Apr 2026', status: 'Lunas' },
    ];
    return {
      title: 'Laporan Pemasok', icon: '🏭', desc: 'Pembelian dan hutang ke pemasok',
      summaryCards: [
        { label: 'Total Pemasok', value: `${suppliers.length}`, color: 'text-[#0d8a6a]' },
        { label: 'Total Pembelian Bulan Ini', value: rp(suppliers.reduce((s,p)=>s+p.total,0)), color: 'text-white' },
        { label: 'Hutang Pending', value: rp(suppliers.filter(p=>p.status==='Pending').reduce((s,p)=>s+p.total,0)), color: 'text-yellow-400' },
      ],
      columns: ['NAMA PEMASOK', 'ITEM', 'TOTAL', 'ORDER TERAKHIR', 'STATUS'],
      rows: suppliers.map(s => ({ 'NAMA PEMASOK': s.nama, ITEM: s.item, TOTAL: rp(s.total), 'ORDER TERAKHIR': s.lastOrder, STATUS: s.status })),
    };
  }

  if (slug === 'export') {
    return {
      title: 'Export PDF / Excel', icon: '📁', desc: 'Export semua laporan ke berbagai format',
      summaryCards: [
        { label: 'Laporan Tersedia', value: '13 jenis', color: 'text-[#0d8a6a]' },
        { label: 'Terakhir Export', value: '17 Apr 2026', color: 'text-white' },
        { label: 'Format', value: 'PDF & Excel', color: 'text-blue-400' },
      ],
      columns: ['LAPORAN', 'DESKRIPSI', 'PDF', 'EXCEL'],
      rows: [
        { LAPORAN: 'Laporan Penjualan', DESKRIPSI: 'Semua transaksi harian', PDF: 'Siap', EXCEL: 'Siap' },
        { LAPORAN: 'Laporan Produk', DESKRIPSI: 'Performa per produk', PDF: 'Siap', EXCEL: 'Siap' },
        { LAPORAN: 'Laporan Karyawan', DESKRIPSI: 'Absensi & performa', PDF: 'Siap', EXCEL: 'Siap' },
        { LAPORAN: 'Laporan Pajak', DESKRIPSI: 'PPN & pajak penjualan', PDF: 'Siap', EXCEL: 'Siap' },
        { LAPORAN: 'Laporan Pemasok', DESKRIPSI: 'Pembelian & hutang', PDF: 'Siap', EXCEL: 'Siap' },
      ],
    };
  }

  // Fallback
  return {
    title: `Laporan ${slug.charAt(0).toUpperCase() + slug.slice(1)}`, icon: '📋', desc: 'Data laporan',
    summaryCards: [{ label: 'Status', value: 'Tersedia', color: 'text-[#0d8a6a]' }],
    columns: ['KETERANGAN', 'NILAI'],
    rows: [{ KETERANGAN: 'Laporan ini sedang dikonfigurasi', NILAI: '-' }],
  };
}

const STATUS_COLOR: Record<string, string> = {
  LUNAS: 'text-green-400', Lunas: 'text-green-400', Selesai: 'text-green-400', Aktif: 'text-green-400', OK: 'text-green-400',
  PENDING: 'text-yellow-400', Pending: 'text-yellow-400', Menipis: 'text-yellow-400',
  REFUND: 'text-red-400', Habis: 'text-red-400', 'Jatuh Tempo': 'text-red-400', Nonaktif: 'text-red-400',
};

export default function LaporanSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const config = buildConfig(slug);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h1 className="text-xl font-bold">{config.title}</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{config.desc} · 18 April 2026</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden">
            {['Hari Ini', 'Minggu Ini', 'Bulan Ini'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-xs font-medium transition-colors ${i===0?'bg-[#0d8a6a] text-white':'text-gray-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
          <button className="px-3 py-1.5 bg-[#0d2137] border border-white/10 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors">PDF</button>
          <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">Excel</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${config.summaryCards.length}, 1fr)` }}>
        {config.summaryCards.map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {config.columns.map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.rows.map((row, i) => (
                <tr key={i} className={`border-b border-white/5 hover:bg-white/3 ${i%2===1?'bg-white/[0.01]':''}`}>
                  {config.columns.map(col => {
                    const val = String(row[col] ?? '-');
                    const colorClass = STATUS_COLOR[val];
                    return (
                      <td key={col} className={`px-4 py-2.5 ${colorClass ? colorClass + ' font-semibold' : 'text-gray-300'} max-w-[200px] truncate`}>
                        {colorClass ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass === 'text-green-400' ? 'bg-green-500/15' : colorClass === 'text-yellow-400' ? 'bg-yellow-500/15' : 'bg-red-500/15'} ${colorClass}`}>
                            {val}
                          </span>
                        ) : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {config.rows.length === 0 && (
                <tr><td colSpan={config.columns.length} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
