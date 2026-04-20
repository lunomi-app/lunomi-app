'use client';
import { useState } from 'react';
import { PRODUCTS, CUSTOMERS, PROMOTIONS, consumeInventory, rp } from '@/lib/data/store';
import { askAI } from '@/app/_components/AIAssistant';

type OrderItem = { produkId: string; nama: string; harga: number; qty: number; catatan: string };
type TxStatus = 'PENDING' | 'LUNAS' | 'BATAL';
type Trx = {
  id: string; waktu: string; kasir: string;
  items: OrderItem[];
  metode: string; status: TxStatus; meja: string;
  customerId: string | null; promoKode: string | null; diskon: number;
};

const INIT_DATA: Trx[] = [
  { id: '#K-001', waktu: '22:10', kasir: 'Wenny',  items: [{ produkId: 'P1', nama: 'Espresso Base', qty: 2, harga: 32000, catatan: '' }, { produkId: 'P9', nama: 'Croissant', qty: 1, harga: 18000, catatan: '' }], metode: '-', status: 'PENDING', meja: 'Meja 3',  customerId: 'C1', promoKode: null, diskon: 0 },
  { id: '#K-002', waktu: '22:05', kasir: 'Eva',    items: [{ produkId: 'P7', nama: 'Matcha Latte',  qty: 1, harga: 38000, catatan: 'less sugar' }], metode: '-', status: 'PENDING', meja: 'Take Away', customerId: null, promoKode: null, diskon: 0 },
  { id: '#K-003', waktu: '21:55', kasir: 'Wenny',  items: [{ produkId: 'P5', nama: 'Manual Brew',   qty: 2, harga: 45000, catatan: '' }], metode: '-', status: 'PENDING', meja: 'Meja 7',  customerId: null, promoKode: null, diskon: 0 },
  { id: '#K-004', waktu: '21:48', kasir: 'LUTPI',  items: [{ produkId: 'P3', nama: 'Kopi Susu',     qty: 3, harga: 25000, catatan: '' }, { produkId: 'P11', nama: 'Cake Slice', qty: 1, harga: 35000, catatan: '' }], metode: '-', status: 'PENDING', meja: 'Meja 1',  customerId: 'C4', promoKode: null, diskon: 0 },
  { id: '#K-005', waktu: '21:38', kasir: 'Wenny',  items: [{ produkId: 'P1', nama: 'Espresso Base', qty: 2, harga: 32000, catatan: '' }, { produkId: 'P9', nama: 'Croissant', qty: 1, harga: 18000, catatan: '' }], metode: 'QRIS',  status: 'LUNAS', meja: 'Dine-In',  customerId: null, promoKode: null, diskon: 0 },
  { id: '#K-006', waktu: '21:15', kasir: 'LUTPI',  items: [{ produkId: 'P4', nama: 'Latte',         qty: 1, harga: 35000, catatan: '' }, { produkId: 'P9', nama: 'Croissant', qty: 1, harga: 18000, catatan: '' }], metode: 'Tunai', status: 'LUNAS', meja: 'Take Away', customerId: null, promoKode: null, diskon: 0 },
  { id: '#K-007', waktu: '20:52', kasir: 'Eva',    items: [{ produkId: 'P7', nama: 'Matcha Latte',  qty: 3, harga: 38000, catatan: '' }], metode: 'Debit', status: 'LUNAS', meja: 'Meja 5',  customerId: null, promoKode: 'HAPPY10', diskon: 11400 },
  { id: '#K-008', waktu: '20:30', kasir: 'Wenny',  items: [{ produkId: 'P2', nama: 'Americano',     qty: 2, harga: 28000, catatan: '' }, { produkId: 'P10', nama: 'Sandwich', qty: 1, harga: 32000, catatan: '' }], metode: 'GoPay', status: 'LUNAS', meja: 'Meja 2',  customerId: null, promoKode: null, diskon: 0 },
];

const METODE = ['Tunai', 'QRIS', 'Debit', 'GoPay', 'OVO', 'Transfer'];
const JENIS_ORDER = ['Dine-In', 'Take Away', 'Delivery'];
const KATEGORI_PROD = ['SEMUA', ...Array.from(new Set(PRODUCTS.map(p => p.kategori)))];

function subtotal(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.qty * i.harga, 0);
}

export default function KasirPage() {
  const [data, setData] = useState<Trx[]>(INIT_DATA);
  const [tab, setTab] = useState<TxStatus | 'SEMUA'>('PENDING');
  const [detail, setDetail] = useState<Trx | null>(null);
  const [showPay, setShowPay] = useState<Trx | null>(null);
  const [showNew, setShowNew] = useState(false);

  // New order state
  const [newItems, setNewItems] = useState<OrderItem[]>([]);
  const [newKasir, setNewKasir] = useState('Wenny');
  const [newMeja, setNewMeja] = useState('Meja 1');
  const [newJenis, setNewJenis] = useState('Dine-In');
  const [newCustomer, setNewCustomer] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<typeof PROMOTIONS[number] | null>(null);
  const [promoErr, setPromoErr] = useState('');
  const [prodKat, setProdKat] = useState('SEMUA');

  const filtered = data.filter(d => tab === 'SEMUA' || d.status === tab);

  const lunasTrx = (id: string, metode: string) => {
    const trx = data.find(d => d.id === id);
    if (trx) consumeInventory(trx.items.map(i => ({ produkId: i.produkId, qty: i.qty })));
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'LUNAS', metode } : d));
    setShowPay(null);
    setDetail(null);
  };

  const batalTrx = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'BATAL' } : d));
    setDetail(null);
    setShowPay(null);
  };

  const applyPromo = () => {
    const kode = promoInput.trim().toUpperCase();
    const promo = PROMOTIONS.find(p => p.kode === kode && p.aktif);
    if (!promo) { setPromoErr('Kode promo tidak valid'); return; }
    const sub = subtotal(newItems);
    if (sub < promo.minOrder) { setPromoErr(`Min. order ${rp(promo.minOrder)}`); return; }
    setPromoApplied(promo);
    setPromoErr('');
  };

  function calcDiskon(promo: typeof PROMOTIONS[number] | null, sub: number) {
    if (!promo) return 0;
    if (promo.tipe === 'persen') return Math.round(sub * promo.nilai / 100);
    if (promo.tipe === 'nominal') return Math.min(promo.nilai, sub);
    if (promo.tipe === 'bogo') return Math.round(sub * promo.nilai / 100);
    return 0;
  }

  const addToCart = (prod: typeof PRODUCTS[number]) => {
    setNewItems(prev => {
      const existing = prev.find(i => i.produkId === prod.id);
      if (existing) return prev.map(i => i.produkId === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { produkId: prod.id, nama: prod.nama, harga: prod.harga, qty: 1, catatan: '' }];
    });
  };

  const updateQty = (produkId: string, delta: number) => {
    setNewItems(prev => prev.flatMap(i => {
      if (i.produkId !== produkId) return [i];
      const newQty = i.qty + delta;
      return newQty <= 0 ? [] : [{ ...i, qty: newQty }];
    }));
  };

  const createOrder = () => {
    if (newItems.length === 0) return;
    const sub = subtotal(newItems);
    const diskon = calcDiskon(promoApplied, sub);
    const id = `#K-${String(data.length + 1).padStart(3, '0')}`;
    const waktu = new Date().toTimeString().slice(0, 5);
    setData(prev => [{
      id, waktu, kasir: newKasir,
      items: newItems,
      metode: '-', status: 'PENDING', meja: newMeja,
      customerId: newCustomer,
      promoKode: promoApplied?.kode || null,
      diskon,
    }, ...prev]);
    setNewItems([]); setPromoApplied(null); setPromoInput(''); setPromoErr('');
    setShowNew(false);
  };

  const resetNew = () => {
    setShowNew(false); setNewItems([]); setPromoApplied(null); setPromoInput(''); setPromoErr('');
  };

  const newSub = subtotal(newItems);
  const newDiskon = calcDiskon(promoApplied, newSub);
  const newTotal = newSub - newDiskon;

  const customer = (id: string | null) => CUSTOMERS.find(c => c.id === id);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kasir</h1>
          <p className="text-xs text-gray-500 mt-0.5">20 April 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            <span className="text-[#0d8a6a] font-bold">{data.filter(d => d.status === 'LUNAS').length}</span> lunas ·{' '}
            <span className="text-yellow-400 font-bold">{data.filter(d => d.status === 'PENDING').length}</span> pending
          </span>
          <button onClick={() => askAI('Analisis transaksi kasir hari ini dan produk apa yang bisa diupsell?')}
            className="px-3 py-1.5 bg-[#0d2137] border border-[#0d8a6a]/30 rounded-lg text-xs text-[#0d8a6a] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
            Tanya AI
          </button>
          <button onClick={() => setShowNew(true)}
            className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
            + Order Baru
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {([
          { key: 'PENDING', label: `Belum Bayar (${data.filter(d => d.status === 'PENDING').length})`, color: 'bg-yellow-500/20 text-yellow-400' },
          { key: 'LUNAS',   label: `Sudah Bayar (${data.filter(d => d.status === 'LUNAS').length})`,   color: 'bg-[#0d8a6a] text-white' },
          { key: 'BATAL',   label: `Batal (${data.filter(d => d.status === 'BATAL').length})`,         color: 'bg-red-500/20 text-red-400' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${tab === t.key ? t.color : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Transaction table */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['NO ORDER', 'WAKTU', 'KASIR', 'MEJA', 'ITEMS', 'DISKON', 'TOTAL', tab === 'PENDING' ? 'AKSI' : 'METODE'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const sub = subtotal(t.items);
                const total = sub - t.diskon;
                return (
                  <tr key={t.id} className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                    onClick={() => setDetail(t)}>
                    <td className="px-4 py-2.5">
                      <span className="text-[#0d8a6a] font-mono font-medium">{t.id}</span>
                      {t.customerId && <p className="text-[9px] text-gray-500 mt-0.5">{customer(t.customerId)?.nama}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">{t.waktu}</td>
                    <td className="px-4 py-2.5 text-gray-300">{t.kasir}</td>
                    <td className="px-4 py-2.5 text-gray-400">{t.meja}</td>
                    <td className="px-4 py-2.5 text-gray-300 max-w-[160px] truncate">
                      {t.items.map(i => `${i.nama} x${i.qty}`).join(', ')}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.diskon > 0
                        ? <span className="text-yellow-400 font-semibold">-{rp(t.diskon)}</span>
                        : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-2.5 text-white font-semibold">{rp(total)}</td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      {tab === 'PENDING' ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setShowPay(t)}
                            className="px-2 py-1 bg-[#0d8a6a]/20 text-[#0d8a6a] border border-[#0d8a6a]/30 rounded text-[10px] font-medium hover:bg-[#0d8a6a] hover:text-white transition-colors">
                            Bayar
                          </button>
                          <button onClick={() => batalTrx(t.id)}
                            className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] font-medium hover:bg-red-500 hover:text-white transition-colors">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <span className={`text-gray-400 ${t.status === 'BATAL' ? 'text-red-400' : ''}`}>{t.metode !== '-' ? t.metode : '-'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Tidak ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detail && !showPay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-white">{detail.id}</p>
                <p className="text-[10px] text-gray-500">{detail.meja} · {detail.waktu}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-1.5 mb-3 text-xs text-gray-400">
              <div className="flex justify-between"><span>Kasir</span><span className="text-white">{detail.kasir}</span></div>
              {detail.customerId && <div className="flex justify-between"><span>Pelanggan</span><span className="text-white">{customer(detail.customerId)?.nama} · {customer(detail.customerId)?.member}</span></div>}
              {detail.promoKode && <div className="flex justify-between"><span>Promo</span><span className="text-yellow-400 font-mono">{detail.promoKode}</span></div>}
            </div>
            <div className="border-t border-white/10 pt-3 mb-3 space-y-1.5">
              {detail.items.map(item => (
                <div key={item.produkId} className="flex justify-between text-xs">
                  <div>
                    <span className="text-gray-300">{item.nama} x{item.qty}</span>
                    {item.catatan && <p className="text-[9px] text-gray-500 italic">{item.catatan}</p>}
                  </div>
                  <span className="text-white">{rp(item.qty * item.harga)}</span>
                </div>
              ))}
            </div>
            {detail.diskon > 0 && (
              <div className="flex justify-between text-xs text-yellow-400 mb-1">
                <span>Diskon</span><span>-{rp(detail.diskon)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-3 mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-[#0d8a6a]">{rp(subtotal(detail.items) - detail.diskon)}</span>
            </div>
            {detail.status === 'PENDING' && (
              <div className="flex gap-2">
                <button onClick={() => { setShowPay(detail); setDetail(null); }}
                  className="flex-1 py-2 bg-[#0d8a6a] rounded-lg text-xs text-white font-bold hover:bg-[#0a7059] transition-colors">
                  Proses Pembayaran
                </button>
                <button onClick={() => batalTrx(detail.id)}
                  className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPay(null)}>
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl p-6 w-96 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">Proses Pembayaran</p>
              <button onClick={() => setShowPay(null)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="bg-[#071220] rounded-xl p-4 space-y-1.5">
              {showPay.items.map(item => (
                <div key={item.produkId} className="flex justify-between text-xs">
                  <span className="text-gray-400">{item.nama} x{item.qty}</span>
                  <span className="text-white">{rp(item.qty * item.harga)}</span>
                </div>
              ))}
              {showPay.diskon > 0 && (
                <div className="flex justify-between text-xs text-yellow-400 border-t border-white/5 pt-1.5 mt-1.5">
                  <span>Diskon ({showPay.promoKode})</span><span>-{rp(showPay.diskon)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-1">
                <span className="text-gray-400">TOTAL</span>
                <span className="text-[#0d8a6a] text-lg">{rp(subtotal(showPay.items) - showPay.diskon)}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold mb-2">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                {METODE.map(m => (
                  <button key={m} onClick={() => lunasTrx(showPay.id, m)}
                    className="py-2.5 bg-[#071220] border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:border-[#0d8a6a] hover:text-[#0d8a6a] transition-colors">
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-gray-600 text-center">Stok bahan otomatis berkurang setelah pembayaran</p>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <p className="font-bold text-white">Order Baru</p>
              <button onClick={resetNew} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Left: Menu */}
              <div className="flex-1 flex flex-col border-r border-white/10 min-w-0">
                {/* Order info */}
                <div className="px-4 py-3 border-b border-white/10 grid grid-cols-3 gap-2 flex-shrink-0">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Kasir</label>
                    <select value={newKasir} onChange={e => setNewKasir(e.target.value)}
                      className="mt-1 w-full bg-[#071220] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#0d8a6a]">
                      {['Wenny', 'LUTPI', 'Eva'].map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Meja / Nama</label>
                    <input value={newMeja} onChange={e => setNewMeja(e.target.value)}
                      className="mt-1 w-full bg-[#071220] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#0d8a6a]" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Jenis</label>
                    <select value={newJenis} onChange={e => setNewJenis(e.target.value)}
                      className="mt-1 w-full bg-[#071220] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#0d8a6a]">
                      {JENIS_ORDER.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                </div>

                {/* Category filter */}
                <div className="px-4 py-2 flex gap-1 flex-wrap border-b border-white/10 flex-shrink-0">
                  {KATEGORI_PROD.map(k => (
                    <button key={k} onClick={() => setProdKat(k)}
                      className={`px-2 py-1 text-[10px] rounded font-medium transition-colors ${prodKat === k ? 'bg-[#0d8a6a] text-white' : 'bg-[#071220] border border-white/10 text-gray-400 hover:text-white'}`}>
                      {k}
                    </button>
                  ))}
                </div>

                {/* Products grid */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {PRODUCTS.filter(p => prodKat === 'SEMUA' || p.kategori === prodKat).map(prod => {
                      const inCart = newItems.find(i => i.produkId === prod.id);
                      return (
                        <button key={prod.id} onClick={() => addToCart(prod)}
                          className={`p-3 rounded-xl text-left transition-all border ${inCart ? 'border-[#0d8a6a] bg-[#0d8a6a]/10' : 'border-white/10 bg-[#071220] hover:border-white/25'}`}>
                          <p className="text-xs font-semibold text-white truncate">{prod.nama}</p>
                          <p className="text-[10px] text-gray-500 truncate">{prod.kategori}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] font-bold text-[#0d8a6a]">{rp(prod.harga)}</p>
                            {inCart && <span className="text-[10px] bg-[#0d8a6a] text-white px-1.5 py-0.5 rounded-full font-bold">{inCart.qty}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Cart */}
              <div className="w-72 flex-shrink-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {newItems.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">Pilih menu dari kiri</p>
                  ) : newItems.map(item => (
                    <div key={item.produkId} className="bg-[#071220] rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{item.nama}</p>
                          <p className="text-[10px] text-[#0d8a6a]">{rp(item.harga)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateQty(item.produkId, -1)}
                            className="w-5 h-5 rounded bg-white/10 text-white text-xs flex items-center justify-center hover:bg-white/20">−</button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.produkId, 1)}
                            className="w-5 h-5 rounded bg-[#0d8a6a]/30 text-[#0d8a6a] text-xs flex items-center justify-center hover:bg-[#0d8a6a] hover:text-white">+</button>
                        </div>
                      </div>
                      <input value={item.catatan} placeholder="Catatan (opsional)"
                        onChange={e => setNewItems(prev => prev.map(i => i.produkId === item.produkId ? { ...i, catatan: e.target.value } : i))}
                        className="mt-2 w-full bg-transparent border-b border-white/10 pb-1 text-[10px] text-gray-400 placeholder-gray-600 outline-none focus:border-[#0d8a6a]/50" />
                    </div>
                  ))}
                </div>

                {/* Customer + Promo + Summary */}
                <div className="border-t border-white/10 p-4 space-y-3 flex-shrink-0">
                  {/* Customer */}
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Pelanggan (opsional)</label>
                    <select value={newCustomer || ''} onChange={e => setNewCustomer(e.target.value || null)}
                      className="mt-1 w-full bg-[#071220] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#0d8a6a]">
                      <option value="">-- Walk-in --</option>
                      {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.member})</option>)}
                    </select>
                  </div>

                  {/* Promo */}
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-semibold">Kode Promo</label>
                    <div className="flex gap-1 mt-1">
                      <input value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoErr(''); }}
                        placeholder="Contoh: HAPPY10"
                        className="flex-1 bg-[#071220] border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-[#0d8a6a] uppercase" />
                      <button onClick={applyPromo}
                        className="px-3 py-1.5 bg-[#0d8a6a]/20 text-[#0d8a6a] border border-[#0d8a6a]/30 rounded text-[10px] font-bold hover:bg-[#0d8a6a] hover:text-white transition-colors">
                        Pakai
                      </button>
                    </div>
                    {promoErr && <p className="text-[10px] text-red-400 mt-0.5">{promoErr}</p>}
                    {promoApplied && (
                      <div className="flex items-center justify-between mt-1 bg-[#0d8a6a]/10 border border-[#0d8a6a]/20 rounded px-2 py-1">
                        <span className="text-[10px] text-[#0d8a6a] font-semibold">{promoApplied.nama}</span>
                        <button onClick={() => { setPromoApplied(null); setPromoInput(''); }} className="text-gray-500 hover:text-white text-xs">×</button>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-[#071220] rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Subtotal</span><span className="text-white">{rp(newSub)}</span>
                    </div>
                    {newDiskon > 0 && (
                      <div className="flex justify-between text-[10px] text-yellow-400">
                        <span>Diskon</span><span>-{rp(newDiskon)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-1">
                      <span className="text-white">Total</span>
                      <span className="text-[#0d8a6a]">{rp(newTotal)}</span>
                    </div>
                  </div>

                  <button onClick={createOrder} disabled={newItems.length === 0}
                    className="w-full py-2.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-bold hover:bg-[#0a7059] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Buat Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
