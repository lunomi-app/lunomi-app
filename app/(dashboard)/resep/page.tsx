'use client';
import { useState, useEffect } from 'react';
import { PRODUCTS, RECIPES, INVENTORY, calcHppFromRecipe, rp, subscribeInventory } from '@/lib/data/store';

type ViewMode = 'grid' | 'detail';

export default function MasterResepPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('SEMUA');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeInventory(() => forceUpdate(n => n + 1));
  }, []);

  const categories = ['SEMUA', ...Array.from(new Set(PRODUCTS.map(p => p.kategori)))];
  const filtered = PRODUCTS.filter(p => filter === 'SEMUA' || p.kategori === filter);

  const selectedProduct = PRODUCTS.find(p => p.id === selected);
  const selectedRecipe = RECIPES.find(r => r.produkId === selected);

  function getStokCukupUntuk(produkId: string): number {
    const recipe = RECIPES.find(r => r.produkId === produkId);
    if (!recipe || recipe.bahan.length === 0) return 999;
    let min = Infinity;
    recipe.bahan.forEach(ing => {
      const inv = INVENTORY.find(i => i.id === ing.inventoriId);
      if (inv && ing.qty > 0) {
        min = Math.min(min, Math.floor(inv.stok / ing.qty));
      }
    });
    return min === Infinity ? 999 : min;
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Master Resep</h1>
          <p className="text-xs text-gray-500 mt-0.5">HPP otomatis dari bahan baku · {PRODUCTS.length} produk</p>
        </div>
        <button className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          + Tambah Resep
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === c ? 'bg-[#0d8a6a] text-white' : 'bg-[#071220] border border-white/10 text-gray-400 hover:text-white'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className={`${selected ? 'grid grid-cols-5 gap-4' : ''}`}>
        {/* Product List */}
        <div className={selected ? 'col-span-2' : ''}>
          <div className="space-y-2">
            {filtered.map(prod => {
              const hppResep = calcHppFromRecipe(prod.id);
              const recipe = RECIPES.find(r => r.produkId === prod.id);
              const hasBahan = recipe && recipe.bahan.length > 0;
              const stokCukup = getStokCukupUntuk(prod.id);
              const margin = prod.harga > 0 ? Math.round((prod.harga - (hppResep || prod.hpp)) / prod.harga * 100) : 0;

              return (
                <div key={prod.id}
                  onClick={() => setSelected(selected === prod.id ? null : prod.id)}
                  className={`bg-[#0d2137] border rounded-xl p-4 cursor-pointer transition-all ${selected === prod.id ? 'border-[#0d8a6a]' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{prod.nama}</p>
                        <span className="text-[9px] bg-[#071220] border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">{prod.kategori}</span>
                        {!hasBahan && <span className="text-[9px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded">Belum ada resep</span>}
                      </div>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="text-gray-400">Harga: <span className="text-white font-semibold">{rp(prod.harga)}</span></span>
                        <span className="text-gray-400">HPP Resep: <span className={hasBahan ? 'text-[#0d8a6a] font-semibold' : 'text-gray-500'}>{hasBahan ? rp(Math.round(hppResep)) : rp(prod.hpp)}</span></span>
                        <span className={`font-bold ${margin >= 60 ? 'text-green-400' : margin >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>Margin {margin}%</span>
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-[10px] text-gray-500 mb-0.5">Bisa buat</p>
                      <p className={`text-lg font-black ${stokCukup === 0 ? 'text-red-400' : stokCukup <= 5 ? 'text-yellow-400' : 'text-[#0d8a6a]'}`}>
                        {stokCukup >= 999 ? '∞' : stokCukup}
                        <span className="text-[10px] font-normal text-gray-500 ml-0.5">porsi</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && selectedProduct && selectedRecipe && (
          <div className="col-span-3 space-y-3">
            <div className="bg-[#0d2137] border border-[#0d8a6a]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-base font-bold text-white">{selectedProduct.nama}</p>
                  <p className="text-[10px] text-gray-500">{selectedProduct.kategori}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
              </div>

              {/* HPP Breakdown */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Komposisi Bahan</p>
                {selectedRecipe.bahan.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Resep belum ditambahkan</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRecipe.bahan.map(ing => {
                      const inv = INVENTORY.find(i => i.id === ing.inventoriId);
                      const biaya = inv ? inv.harga * ing.qty : 0;
                      const stokCukup = inv && ing.qty > 0 ? Math.floor(inv.stok / ing.qty) : 999;
                      return (
                        <div key={ing.inventoriId} className="flex items-center justify-between bg-[#071220] rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stokCukup === 0 ? 'bg-red-400' : stokCukup <= 5 ? 'bg-yellow-400' : 'bg-[#0d8a6a]'}`} />
                            <div>
                              <p className="text-xs text-white font-medium">{ing.nama}</p>
                              <p className="text-[10px] text-gray-500">
                                {ing.qty} {ing.unit} per porsi
                                {inv && <span className="ml-2 text-gray-600">· Stok: {inv.stok} {inv.unit}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-white">{rp(Math.round(biaya))}</p>
                            <p className="text-[10px] text-gray-500">{stokCukup >= 999 ? '∞' : stokCukup} porsi tersisa</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary */}
              {selectedRecipe.bahan.length > 0 && (() => {
                const hppResep = Math.round(calcHppFromRecipe(selectedProduct.id));
                const margin = selectedProduct.harga > 0 ? ((selectedProduct.harga - hppResep) / selectedProduct.harga * 100) : 0;
                const profit = selectedProduct.harga - hppResep;
                return (
                  <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: 'HPP Total', value: rp(hppResep), color: 'text-red-400' },
                      { label: 'Harga Jual', value: rp(selectedProduct.harga), color: 'text-white' },
                      { label: 'Profit/Porsi', value: rp(profit), color: profit >= 0 ? 'text-[#0d8a6a]' : 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className="bg-[#071220] rounded-lg p-3 text-center">
                        <p className="text-[9px] text-gray-500 uppercase mb-1">{s.label}</p>
                        <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Margin bar */}
              {selectedRecipe.bahan.length > 0 && (() => {
                const hppResep = Math.round(calcHppFromRecipe(selectedProduct.id));
                const margin = selectedProduct.harga > 0 ? Math.round((selectedProduct.harga - hppResep) / selectedProduct.harga * 100) : 0;
                return (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Margin</span><span className={`font-bold ${margin >= 60 ? 'text-green-400' : margin >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{margin}%</span>
                    </div>
                    <div className="h-2 bg-[#071220] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${margin >= 60 ? 'bg-green-400' : margin >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(100, margin)}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Summary table */}
      {!selected && (
        <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden mt-4">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold">Ringkasan HPP & Margin Semua Produk</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['PRODUK', 'KATEGORI', 'HARGA JUAL', 'HPP RESEP', 'PROFIT/PORSI', 'MARGIN', 'BISA BUAT'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((prod, i) => {
                const hppResep = Math.round(calcHppFromRecipe(prod.id));
                const recipe = RECIPES.find(r => r.produkId === prod.id);
                const hasBahan = recipe && recipe.bahan.length > 0;
                const hpp = hasBahan ? hppResep : prod.hpp;
                const profit = prod.harga - hpp;
                const margin = prod.harga > 0 ? Math.round(profit / prod.harga * 100) : 0;
                const stokCukup = getStokCukupUntuk(prod.id);
                return (
                  <tr key={prod.id} onClick={() => setSelected(prod.id)}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-4 py-2.5 text-white font-medium">{prod.nama}</td>
                    <td className="px-4 py-2.5 text-gray-400">{prod.kategori}</td>
                    <td className="px-4 py-2.5 text-white font-semibold">{rp(prod.harga)}</td>
                    <td className="px-4 py-2.5">
                      <span className={hasBahan ? 'text-[#0d8a6a] font-semibold' : 'text-gray-500'}>{rp(hpp)}</span>
                      {!hasBahan && <span className="ml-1 text-[9px] text-yellow-400">(manual)</span>}
                    </td>
                    <td className={`px-4 py-2.5 font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{rp(profit)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${margin >= 60 ? 'text-green-400' : margin >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{margin}%</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-bold ${stokCukup === 0 ? 'text-red-400' : stokCukup <= 5 ? 'text-yellow-400' : 'text-[#0d8a6a]'}`}>
                        {stokCukup >= 999 ? '∞' : stokCukup}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
