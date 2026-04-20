'use client';
import { TRANSACTIONS, PRODUCTS, STAFF, CUSTOMERS, rp, rpK } from '@/lib/data/store';

const lunasTrx = TRANSACTIONS.filter(t => t.status === 'LUNAS');
const totalRev = lunasTrx.reduce((s, t) => s + t.total, 0);
const avgOrder = lunasTrx.length > 0 ? Math.round(totalRev / lunasTrx.length) : 0;

// Product performance from transactions
const prodSales: Record<string, { qty: number; rev: number }> = {};
lunasTrx.forEach(t => t.items.forEach(i => {
  if (!prodSales[i.nama]) prodSales[i.nama] = { qty: 0, rev: 0 };
  prodSales[i.nama].qty += i.qty;
  prodSales[i.nama].rev += i.qty * i.harga;
}));
const topProducts = Object.entries(prodSales)
  .sort((a, b) => b[1].rev - a[1].rev)
  .slice(0, 5);

// Staff performance
const staffPerf = STAFF.filter(s => s.status === 'Aktif').map(s => ({
  nama: s.nama,
  trx: lunasTrx.filter(t => t.kasirId === s.id).length,
  rev: lunasTrx.filter(t => t.kasirId === s.id).reduce((sum, t) => sum + t.total, 0),
})).sort((a, b) => b.rev - a.rev);

const INSIGHTS = [
  { type: 'positive', title: 'Penjualan Hari Ini Meningkat 18.4%', desc: 'Dibanding kemarin (Rp 712.000), hari ini mencatat Rp 844.776. Peningkatan terjadi di semua kategori, terutama Manual Brew (+34%).' },
  { type: 'warning', title: 'Pengeluaran Operasional +240% dari Rata-rata', desc: 'Realisasi operasional Rp 3.047.300 jauh melampaui rata-rata harian Rp 895.000. Perlu investigasi segera — kemungkinan double-entry atau pengeluaran tidak terdokumentasi.' },
  { type: 'positive', title: 'Kategori Espresso Base Mendominasi (82%)', desc: 'Espresso Base menyumbang 82% dari total penjualan minuman. Pertimbangkan untuk menambah variasi produk di kategori ini.' },
  { type: 'negative', title: '2 Kontrol Fraud Terdeteksi', desc: 'Kasir Wenny melakukan 2 refund di jam yang sama (18:55). Pola ini perlu verifikasi manual oleh supervisor.' },
  { type: 'info', title: 'Customer Baru Menurun 3 Orang', desc: 'Hari ini 14 customer baru, turun dari 17 kemarin. Aktivasi kampanye referral bisa membantu meningkatkan akuisisi customer baru.' },
];

const REKOMENDASI = [
  { priority: 'TINGGI', action: 'Investigasi pengeluaran operasional hari ini', deadline: 'Hari Ini', assignee: 'Manager' },
  { priority: 'TINGGI', action: 'Verifikasi 2 refund oleh kasir Wenny', deadline: 'Hari Ini', assignee: 'Supervisor' },
  { priority: 'SEDANG', action: 'Restock Matcha Powder & Kantong Kertas', deadline: '2 Hari', assignee: 'Admin' },
  { priority: 'SEDANG', action: 'Aktifkan kampanye referral untuk customer baru', deadline: 'Minggu Ini', assignee: 'Marketing' },
  { priority: 'RENDAH', action: 'Review dan update menu Merchandise', deadline: 'Bulan Ini', assignee: 'Manager' },
];

const PRIORITY_STYLE: Record<string, string> = {
  TINGGI: 'bg-red-500/15 text-red-400',
  SEDANG: 'bg-yellow-500/15 text-yellow-400',
  RENDAH: 'bg-gray-500/15 text-gray-400',
};

const INSIGHT_STYLE: Record<string, { border: string; icon: string; badge: string }> = {
  positive: { border: 'border-green-500/25', icon: '📈', badge: 'bg-green-500/15 text-green-400' },
  warning: { border: 'border-yellow-500/25', icon: '⚠️', badge: 'bg-yellow-500/15 text-yellow-400' },
  negative: { border: 'border-red-500/25', icon: '🚨', badge: 'bg-red-500/15 text-red-400' },
  info: { border: 'border-blue-500/25', icon: 'ℹ️', badge: 'bg-blue-500/15 text-blue-400' },
};

export default function AnalisaLaporanPage() {
  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-xl font-bold">Analisa Laporan</h1>
            <span className="text-[10px] bg-[#0d8a6a]/20 text-[#0d8a6a] px-2 py-0.5 rounded-full font-bold">AI-Powered</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">18 April 2026 · Analisis otomatis dari semua data hari ini</p>
        </div>
        <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          Export Laporan
        </button>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Revenue Hari Ini', value: rpK(totalRev), delta: '+18.4%', up: true },
          { label: 'Total Transaksi', value: `${lunasTrx.length} trx`, delta: '+23', up: true },
          { label: 'Rata-rata Order', value: rpK(avgOrder), delta: '-2.1%', up: false },
          { label: 'Customer Baru', value: '14 orang', delta: '-3', up: false },
        ].map(k => (
          <div key={k.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{k.label}</p>
            <p className="text-lg font-bold text-white">{k.value}</p>
            <span className={`text-[10px] font-semibold ${k.up ? 'text-green-400' : 'text-red-400'}`}>
              {k.up ? '▲' : '▼'} {k.delta}
            </span>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div>
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🤖</span> Temuan & Insight Hari Ini
          <span className="text-[10px] text-gray-500 font-normal">({INSIGHTS.length} temuan)</span>
        </p>
        <div className="space-y-2.5">
          {INSIGHTS.map((insight, i) => {
            const style = INSIGHT_STYLE[insight.type];
            return (
              <div key={i} className={`bg-[#0d2137] border rounded-xl p-4 ${style.border}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-1">{insight.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{insight.desc}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 capitalize ${style.badge}`}>
                    {insight.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
          <p className="text-sm font-semibold mb-3">🏆 Produk Terlaris Hari Ini</p>
          <div className="space-y-2.5">
            {topProducts.map(([nama, data], i) => (
              <div key={nama} className="flex items-center gap-3">
                <span className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: ['#f0c040', '#8fa8c0', '#cd7f32', '#4a6a84', '#2a4a64'][i], color: '#071220' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium truncate">{nama}</span>
                    <span className="text-[#0d8a6a] font-bold ml-2 flex-shrink-0">{rp(data.rev)}</span>
                  </div>
                  <div className="h-1.5 bg-[#071220] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0d8a6a] to-[#10b981]"
                      style={{ width: `${(data.rev / topProducts[0][1].rev) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{data.qty}x terjual</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
          <p className="text-sm font-semibold mb-3">👤 Performa Kasir Hari Ini</p>
          <div className="space-y-2.5">
            {staffPerf.map((s, i) => (
              <div key={s.nama} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#071220] border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#0d8a6a] flex-shrink-0">
                  {s.nama[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">{s.nama}</span>
                    <span className="text-[#0d8a6a] font-bold">{s.rev > 0 ? rp(s.rev) : '-'}</span>
                  </div>
                  {staffPerf[0].rev > 0 && (
                    <div className="h-1.5 bg-[#071220] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#0d8a6a]"
                        style={{ width: `${staffPerf[0].rev > 0 ? (s.rev / staffPerf[0].rev) * 100 : 0}%` }} />
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.trx} transaksi</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <span>💡</span>
          <p className="text-sm font-semibold">Rekomendasi Tindakan</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              {['PRIORITAS', 'TINDAKAN', 'DEADLINE', 'PIC'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REKOMENDASI.map((r, i) => (
              <tr key={i} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</span>
                </td>
                <td className="px-4 py-2.5 text-white">{r.action}</td>
                <td className="px-4 py-2.5 text-gray-400">{r.deadline}</td>
                <td className="px-4 py-2.5 text-gray-400">{r.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
