'use client';
import { useState, useEffect } from 'react';

type Status = 'MENUNGGU' | 'DIMASAK' | 'SIAP';
type Order = {
  id: string; meja: string; jenis: string;
  items: { nama: string; qty: number; catatan?: string }[];
  waktu: string; status: Status; menit: number;
};

const INIT_ORDERS: Order[] = [
  { id: '#K-004', meja: 'Meja 1', jenis: 'Dine-In', items: [{ nama: 'Kopi Susu', qty: 3 }, { nama: 'Cake Cokelat', qty: 1, catatan: 'tanpa krim' }], waktu: '21:48', status: 'MENUNGGU', menit: 3 },
  { id: '#K-003', meja: 'Meja 7', jenis: 'Dine-In', items: [{ nama: 'Manual Brew V60', qty: 2, catatan: 'medium roast' }], waktu: '21:55', status: 'MENUNGGU', menit: 5 },
  { id: '#K-002', meja: 'Take Away', jenis: 'Take Away', items: [{ nama: 'Matcha Latte', qty: 1 }], waktu: '22:05', status: 'DIMASAK', menit: 8 },
  { id: '#K-001', meja: 'Meja 3', jenis: 'Dine-In', items: [{ nama: 'Espresso Base', qty: 2 }, { nama: 'Croissant', qty: 1 }], waktu: '22:10', status: 'DIMASAK', menit: 2 },
  { id: '#K-099', meja: 'Online-12', jenis: 'Order Online', items: [{ nama: 'Americano', qty: 1 }, { nama: 'Sandwich', qty: 1 }], waktu: '21:30', status: 'SIAP', menit: 15 },
];

const STATUS_CONFIG = {
  MENUNGGU: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', badge: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400', label: 'Menunggu' },
  DIMASAK: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-400', label: 'Sedang Dimasak' },
  SIAP: { bg: 'bg-green-500/10', border: 'border-green-500/40', badge: 'bg-green-500/20 text-green-400', dot: 'bg-green-400', label: 'Siap' },
};

const NEXT_STATUS: Record<Status, Status | null> = {
  MENUNGGU: 'DIMASAK',
  DIMASAK: 'SIAP',
  SIAP: null,
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
  const [filter, setFilter] = useState<Status | 'SEMUA'>('SEMUA');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const updateStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const filtered = orders.filter(o => filter === 'SEMUA' || o.status === filter)
    .sort((a, b) => {
      const order: Status[] = ['MENUNGGU', 'DIMASAK', 'SIAP'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

  return (
    <div className="space-y-4">
      {/* Filter + Stats */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['SEMUA', 'MENUNGGU', 'DIMASAK', 'SIAP'] as const).map(f => {
            const count = f === 'SEMUA' ? orders.length : orders.filter(o => o.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  filter === f
                    ? f === 'MENUNGGU' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : f === 'DIMASAK' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : f === 'SIAP' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white'
                }`}>
                {f} ({count})
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500">{orders.filter(o => o.status !== 'SIAP').length} order aktif</p>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          const next = NEXT_STATUS[order.status];
          return (
            <div key={order.id} className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-2xl font-black text-white">{order.meja}</p>
                  <p className="text-sm text-gray-400">{order.id} · {order.jenis}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${cfg.badge}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                    {cfg.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{order.waktu} · {order.menit + elapsed}m</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{item.qty}</span>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{item.nama}</p>
                      {item.catatan && <p className="text-[10px] text-yellow-400/80 italic">"{item.catatan}"</p>}
                    </div>
                  </div>
                ))}
              </div>

              {next && (
                <button onClick={() => updateStatus(order.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    next === 'DIMASAK'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white'
                  }`}>
                  {next === 'DIMASAK' ? '▶ Mulai Masak' : '✓ Tandai Siap'}
                </button>
              )}
              {!next && (
                <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center bg-green-500/10 text-green-400 border border-green-500/20">
                  ✓ Sudah Diantarkan
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-600 text-lg">
            Tidak ada order
          </div>
        )}
      </div>
    </div>
  );
}
