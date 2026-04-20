'use client';
import { useState } from 'react';

const DATA = [
  { nama: 'Biji Kopi Arabika', kategori: 'Bahan Baku', stok: 4.5, unit: 'kg', min: 2, harga: 180000 },
  { nama: 'Biji Kopi Robusta', kategori: 'Bahan Baku', stok: 1.2, unit: 'kg', min: 2, harga: 120000 },
  { nama: 'Susu Full Cream', kategori: 'Bahan Baku', stok: 12, unit: 'liter', min: 5, harga: 18000 },
  { nama: 'Susu Oat', kategori: 'Bahan Baku', stok: 3, unit: 'liter', min: 3, harga: 45000 },
  { nama: 'Matcha Powder', kategori: 'Bahan Baku', stok: 0.8, unit: 'kg', min: 1, harga: 320000 },
  { nama: 'Gula Pasir', kategori: 'Bahan Baku', stok: 8, unit: 'kg', min: 3, harga: 14000 },
  { nama: 'Gelas Plastik 16oz', kategori: 'Packaging', stok: 240, unit: 'pcs', min: 100, harga: 800 },
  { nama: 'Kantong Kertas', kategori: 'Packaging', stok: 45, unit: 'pcs', min: 100, harga: 1200 },
  { nama: 'Croissant Frozen', kategori: 'Makanan', stok: 18, unit: 'pcs', min: 10, harga: 12000 },
  { nama: 'Kue Brownies', kategori: 'Makanan', stok: 0, unit: 'pcs', min: 5, harga: 25000 },
  { nama: 'Vanilla Syrup', kategori: 'Topping', stok: 2, unit: 'botol', min: 2, harga: 55000 },
  { nama: 'Caramel Syrup', kategori: 'Topping', stok: 3, unit: 'botol', min: 2, harga: 55000 },
];

type Kategori = 'SEMUA' | 'Bahan Baku' | 'Packaging' | 'Makanan' | 'Topping';

function getStatus(stok: number, min: number) {
  if (stok === 0) return { label: 'Habis', cls: 'bg-red-500/15 text-red-400' };
  if (stok <= min) return { label: 'Menipis', cls: 'bg-yellow-500/15 text-yellow-400' };
  return { label: 'OK', cls: 'bg-green-500/15 text-green-400' };
}

const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function InventoriPage() {
  const [kat, setKat] = useState<Kategori>('SEMUA');

  const filtered = DATA.filter(d => kat === 'SEMUA' || d.kategori === kat);
  const lowCount = DATA.filter(d => d.stok <= d.min).length;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inventori</h1>
          <p className="text-xs text-gray-500 mt-0.5">{DATA.length} item · {lowCount} perlu restock</p>
        </div>
        <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          + Tambah Item
        </button>
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5 text-xs">
          <span className="text-yellow-400 font-semibold">⚠ {lowCount} item stok menipis atau habis</span>
        </div>
      )}

      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {(['SEMUA', 'Bahan Baku', 'Packaging', 'Makanan', 'Topping'] as Kategori[]).map(k => (
          <button key={k} onClick={() => setKat(k)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${kat === k ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {k}
          </button>
        ))}
      </div>

      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-500">
              {['NAMA', 'KATEGORI', 'STOK', 'STOK MIN', 'HARGA/UNIT', 'STATUS'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const st = getStatus(item.stok, item.min);
              return (
                <tr key={item.nama} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-4 py-2.5 text-white font-medium">{item.nama}</td>
                  <td className="px-4 py-2.5 text-gray-400">{item.kategori}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: item.stok === 0 ? '#ef4444' : item.stok <= item.min ? '#f59e0b' : '#0d8a6a' }}>
                    {item.stok} {item.unit}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{item.min} {item.unit}</td>
                  <td className="px-4 py-2.5 text-gray-300">{rp(item.harga)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
