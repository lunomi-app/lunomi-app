'use client';
import { useState } from 'react';
import { INVOICES, CUSTOMERS, rp } from '@/lib/data/store';

type Invoice = typeof INVOICES[number];

const STATUS_STYLE: Record<string, string> = {
  Draft: 'bg-gray-500/15 text-gray-400',
  Terkirim: 'bg-blue-500/15 text-blue-400',
  Lunas: 'bg-green-500/15 text-green-400',
  'Jatuh Tempo': 'bg-red-500/15 text-red-400',
  Batal: 'bg-red-900/20 text-red-600',
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [filter, setFilter] = useState('SEMUA');
  const [showCreate, setShowCreate] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ klien: '', email: '', items: '', jumlah: '', jatuhTempo: '' });

  const filtered = invoices.filter(inv => filter === 'SEMUA' || inv.status === filter);

  const totalLunas = invoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.jumlah, 0);
  const totalTerhutang = invoices.filter(i => i.status === 'Terkirim' || i.status === 'Jatuh Tempo').reduce((s, i) => s + i.jumlah, 0);
  const totalJatuhTempo = invoices.filter(i => i.status === 'Jatuh Tempo').reduce((s, i) => s + i.jumlah, 0);

  const bayar = (id: string) =>
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Lunas' } : inv));

  const kirim = (id: string) =>
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Terkirim' } : inv));

  const createInvoice = () => {
    if (!newInvoice.klien || !newInvoice.jumlah) return;
    const id = `INV-2604-${String(invoices.length + 1).padStart(3, '0')}`;
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    setInvoices(prev => [{
      id, klien: newInvoice.klien, email: newInvoice.email,
      items: newInvoice.items || 'Produk/Jasa',
      jumlah: parseInt(newInvoice.jumlah) || 0,
      tgl: today, jatuhTempo: newInvoice.jatuhTempo || '-', status: 'Draft',
    }, ...prev]);
    setNewInvoice({ klien: '', email: '', items: '', jumlah: '', jatuhTempo: '' });
    setShowCreate(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Invoice</h1>
          <p className="text-xs text-gray-500 mt-0.5">{invoices.length} invoice · Bulan April 2026</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-medium hover:bg-[#0a7059] transition-colors">
          + Buat Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sudah Lunas', value: rp(totalLunas), color: 'text-green-400' },
          { label: 'Menunggu Pembayaran', value: rp(totalTerhutang), color: 'text-blue-400' },
          { label: 'Jatuh Tempo', value: rp(totalJatuhTempo), color: 'text-red-400' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d2137] border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex bg-[#071220] border border-white/10 rounded-lg overflow-hidden w-fit">
        {['SEMUA', 'Draft', 'Terkirim', 'Lunas', 'Jatuh Tempo'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-[#0d2137] border border-white/10 rounded-2xl p-6 w-96 shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-white">Buat Invoice Baru</p>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
            </div>
            {[
              { label: 'Nama Klien', key: 'klien', ph: 'PT / CV / Nama Klien' },
              { label: 'Email Klien', key: 'email', ph: 'email@klien.com' },
              { label: 'Deskripsi Item', key: 'items', ph: 'Paket Meeting 10 pax, Catering...' },
              { label: 'Total (Rp)', key: 'jumlah', ph: '1500000' },
              { label: 'Jatuh Tempo', key: 'jatuhTempo', ph: '30 Apr 2026' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] text-gray-500 uppercase font-semibold">{f.label}</label>
                <input
                  value={(newInvoice as any)[f.key]}
                  onChange={e => setNewInvoice(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.ph}
                  className="mt-1 w-full bg-[#071220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-[#0d8a6a]"
                />
              </div>
            ))}
            <button onClick={createInvoice}
              className="w-full py-2.5 bg-[#0d8a6a] rounded-lg text-xs text-white font-bold hover:bg-[#0a7059] transition-colors mt-2">
              Buat Invoice
            </button>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="bg-[#0d2137] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-500">
                {['NO INVOICE', 'KLIEN', 'DESKRIPSI', 'JUMLAH', 'TGL DIBUAT', 'JATUH TEMPO', 'STATUS', 'AKSI'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-white/5 hover:bg-white/3 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-4 py-3 text-[#0d8a6a] font-mono font-medium">{inv.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{inv.klien}</p>
                    <p className="text-[10px] text-gray-500">{inv.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{inv.items}</td>
                  <td className="px-4 py-3 text-white font-bold">{rp(inv.jumlah)}</td>
                  <td className="px-4 py-3 text-gray-400">{inv.tgl}</td>
                  <td className="px-4 py-3 text-gray-400">{inv.jatuhTempo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[inv.status] || ''}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {inv.status === 'Draft' && (
                        <button onClick={() => kirim(inv.id)}
                          className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] hover:bg-blue-500 hover:text-white transition-colors">
                          Kirim
                        </button>
                      )}
                      {(inv.status === 'Terkirim' || inv.status === 'Jatuh Tempo') && (
                        <button onClick={() => bayar(inv.id)}
                          className="px-2 py-1 bg-[#0d8a6a]/10 text-[#0d8a6a] border border-[#0d8a6a]/20 rounded text-[10px] hover:bg-[#0d8a6a] hover:text-white transition-colors">
                          Tandai Lunas
                        </button>
                      )}
                      <button className="px-2 py-1 bg-white/5 text-gray-400 border border-white/10 rounded text-[10px] hover:text-white transition-colors">
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
