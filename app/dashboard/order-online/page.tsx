'use client';

const ORDERS = [
  { id: '#OL-001', platform: 'GrabFood', pelanggan: 'Ahmad F.', items: 'Kopi Susu x2, Croissant x1', total: 118000, status: 'PROSES', waktu: '21:50' },
  { id: '#OL-002', platform: 'GoFood', pelanggan: 'Sari D.', items: 'Matcha Latte x1', total: 38000, status: 'DIKIRIM', waktu: '21:35' },
  { id: '#OL-003', platform: 'ShopeeFood', pelanggan: 'Budi K.', items: 'Americano x2, Sandwich x1', total: 88000, status: 'SELESAI', waktu: '21:10' },
  { id: '#OL-004', platform: 'GrabFood', pelanggan: 'Maya A.', items: 'Manual Brew x1', total: 45000, status: 'SELESAI', waktu: '20:45' },
];

const STATUS_STYLE: Record<string, string> = {
  PROSES: 'bg-yellow-500/15 text-yellow-400',
  DIKIRIM: 'bg-blue-500/15 text-blue-400',
  SELESAI: 'bg-green-500/15 text-green-400',
};

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function OrderOnlinePage() {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Order Online</h1>
          <p className="text-xs text-gray-500 mt-0.5">GrabFood · GoFood · ShopeeFood</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {['GrabFood', 'GoFood', 'ShopeeFood'].map(p => (
            <span key={p} className="px-2 py-1 bg-[#0d2137] border border-white/10 rounded text-gray-400">{p}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Order Aktif', value: ORDERS.filter(o => o.status !== 'SELESAI').length.toString(), color: 'text-yellow-400' },
          { label: 'Selesai Hari Ini', value: ORDERS.filter(o => o.status === 'SELESAI').length.toString(), color: 'text-green-400' },
          { label: 'Total Pendapatan', value: rp(ORDERS.filter(o => o.status === 'SELESAI').reduce((s, o) => s + o.total, 0)), color: 'text-[#0d8a6a]' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              {['ID', 'PLATFORM', 'PELANGGAN', 'ITEMS', 'TOTAL', 'WAKTU', 'STATUS'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o, i) => (
              <tr key={o.id} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-2.5 text-[#0d8a6a] font-mono">{o.id}</td>
                <td className="px-4 py-2.5 text-gray-300">{o.platform}</td>
                <td className="px-4 py-2.5 text-gray-300">{o.pelanggan}</td>
                <td className="px-4 py-2.5 text-gray-400 max-w-[160px] truncate">{o.items}</td>
                <td className="px-4 py-2.5 text-white font-semibold">{rp(o.total)}</td>
                <td className="px-4 py-2.5 text-gray-400">{o.waktu}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
