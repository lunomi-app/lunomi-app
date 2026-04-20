'use client';
import { useState, useEffect } from 'react';
import { INVENTORY, subscribeInventory, rp } from '@/lib/data/store';
import { askAI } from '@/app/_components/AIAssistant';

type Kategori = 'SEMUA' | 'Bahan Baku' | 'Packaging' | 'Makanan' | 'Topping';

function getStatus(stok: number, min: number) {
  if (stok === 0) return { label: 'Habis', cls: 'bg-red-500/15 text-red-400' };
  if (stok <= min) return { label: 'Menipis', cls: 'bg-yellow-500/15 text-yellow-400' };
  return { label: 'OK', cls: 'bg-green-500/15 text-green-400' };
}

export default function InventoriPage() {
  const [kat, setKat] = useState<Kategori>('SEMUA');
  const [, forceUpdate] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nama: '', kategori: 'Bahan Baku', stok: '', unit: 'kg', min: '', harga: '' });

  // Re-render saat inventory berubah dari kasir
  useEffect(() => {
    return subscribeInventory(() => forceUpdate(n => n + 1));
  }, []);

  const filtered = INVENTORY.filter(d => kat === 'SEMUA' || d.kategori === kat);
  const lowCount = INVENTORY.filter(d => d.stok <= d.min).length;

  const tambahStok = (id: string, jumlah: number) => {
    const item = INVENTORY.find(i => i.id === id);
    if (item) {
      item.stok = parseFloat((item.stok + jumlah).toFixed(3));
      forceUpdate(n => n + 1);
    }
  };

  const addItem = () => {
    if (!form.nama || !form.stok) return;
    INVENTORY.push({
      id: `I${Date.now()}`,
      nama: form.nama,
      kategori: form.kategori,
      stok: parseFloat(form.stok) || 0,
      unit: form.unit,
      min: parseFloat(form.min) || 0,
      harga: parseInt(form.harga) || 0,
    });
    setForm({ nama: '', kategori: 'Bahan Baku', stok: '', unit: 'kg', min: '', harga: '' });
    setShowAdd(false);
    forceUpdate(n => n + 1);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Inventori</h1>
          <p className="text-xs text-gray-500 mt-0.5">{INVENTORY.length} item · {lowCount} perlu restock</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => askAI('Analisis kondisi stok hari ini dan bahan apa yang harus direstock sekarang?')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Analisa AI
          </button>
          <button onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Tambah Item
          </button>
        </div>
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2.5 text-xs">
          <span className="text-yellow-400 font-semibold">⚠ {lowCount} item stok menipis atau habis — stok berkurang otomatis saat penjualan</span>
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
              {['NAMA', 'KATEGORI', 'STOK', 'STOK MIN', 'HARGA/UNIT', 'STATUS', 'RESTOCK'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const st = getStatus(item.stok, item.min);
              return (
                <tr key={item.id} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
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
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      {[1, 5, 10].map(n => (
                        <button key={n} onClick={() => tambahStok(item.id, n)}
                          className="px-1.5 py-0.5 bg-[#0d8a6a]/10 text-[#0d8a6a] border border-[#0d8a6a]/20 rounded text-[9px] font-bold hover:bg-[#0d8a6a] hover:text-white transition-colors">
                          +{n}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl p-6 w-96 shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-white">Tambah Item Inventori</p>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>
            {[
              { label: 'Nama Item', key: 'nama', type: 'text', ph: 'Biji Kopi Arabika' },
              { label: 'Stok Awal', key: 'stok', type: 'number', ph: '10' },
              { label: 'Satuan', key: 'unit', type: 'text', ph: 'kg / liter / pcs' },
              { label: 'Stok Minimum', key: 'min', type: 'number', ph: '2' },
              { label: 'Harga per Satuan (Rp)', key: 'harga', type: 'number', ph: '180000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] text-gray-500 uppercase font-semibold">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} placeholder={f.ph}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="mt-1 w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#0d8a6a]" />
              </div>
            ))}
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-semibold">Kategori</label>
              <select value={form.kategori} onChange={e => setForm(prev => ({ ...prev, kategori: e.target.value }))}
                className="mt-1 w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#0d8a6a]">
                {['Bahan Baku', 'Packaging', 'Makanan', 'Topping'].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <button onClick={addItem}
              className="w-full py-2.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-bold hover:bg-[#0a7059] transition-colors mt-2">
              Tambah Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
