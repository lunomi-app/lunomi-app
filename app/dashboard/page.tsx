'use client';

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Sample data ──────────────────────────────────────────────
const arusKasData = [
  { hari: '10 Apr', pemasukan: 4200000, pengeluaran: 1800000 },
  { hari: '11 Apr', pemasukan: 3800000, pengeluaran: 2100000 },
  { hari: '12 Apr', pemasukan: 5100000, pengeluaran: 1950000 },
  { hari: '13 Apr', pemasukan: 4700000, pengeluaran: 2300000 },
  { hari: '14 Apr', pemasukan: 6200000, pengeluaran: 2800000 },
  { hari: '15 Apr', pemasukan: 5500000, pengeluaran: 2100000 },
  { hari: '16 Apr', pemasukan: 4900000, pengeluaran: 1700000 },
];

const opexData = [
  { kategori: 'Bahan Baku',  realisasi: 1644900, anggaran: 4000000, pct: 41 },
  { kategori: 'Operasional', realisasi: 3047300, anggaran: 1500000, pct: 203, over: true },
  { kategori: 'Gaji',        realisasi: 600000,  anggaran: 7300000, pct: 8 },
  { kategori: 'Listrik',     realisasi: 500000,  anggaran: 1300000, pct: 38 },
  { kategori: 'Sewa',        realisasi: 0,        anggaran: 2500000, pct: 0 },
  { kategori: 'Internet',    realisasi: 0,        anggaran: 233100,  pct: 0 },
];

const transaksiTerbaru = [
  { tgl: '16 Apr', keterangan: 'Penjualan Kopi Susu',  kategori: 'PEMASUKAN',   debit: 450000, kredit: null },
  { tgl: '16 Apr', keterangan: 'Beli bahan baku',      kategori: 'BAHAN BAKU',  debit: null,   kredit: 312000 },
  { tgl: '16 Apr', keterangan: 'Bayar listrik',        kategori: 'OPERASIONAL', debit: null,   kredit: 500000 },
  { tgl: '15 Apr', keterangan: 'Penjualan Croissant',  kategori: 'PEMASUKAN',   debit: 280000, kredit: null },
  { tgl: '15 Apr', keterangan: 'Bensin operasional',   kategori: 'OPERASIONAL', debit: null,   kredit: 85000 },
  { tgl: '14 Apr', keterangan: 'Penjualan Cake slice', kategori: 'PEMASUKAN',   debit: 195000, kredit: null },
  { tgl: '14 Apr', keterangan: 'Indomie 1 karton',     kategori: 'BAHAN BAKU',  debit: null,   kredit: 114000 },
];

const produkTerlaris = [
  { nama: 'Kopi Susu',    terjual: 142, revenue: 2130000 },
  { nama: 'Croissant',    terjual: 98,  revenue: 1470000 },
  { nama: 'Matcha Latte', terjual: 76,  revenue: 1140000 },
  { nama: 'Cake Slice',   terjual: 54,  revenue: 810000 },
  { nama: 'Americano',    terjual: 43,  revenue: 516000 },
];

// ── Helpers ───────────────────────────────────────────────────
function rp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
function rpShort(n: number) {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000)     return 'Rp ' + (n / 1_000).toFixed(0) + 'rb';
  return rp(n);
}

// ── Sub-components ────────────────────────────────────────────
function KPICard({ label, value, sub, trend, color }: {
  label: string; value: string; sub?: string;
  trend?: { pct: number; up: boolean }; color: string;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d2137 0%, #0a1a2e 100%)',
      border: `1px solid ${color}33`,
      borderRadius: 16, padding: '20px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color + '18',
      }} />
      <p style={{ color: '#8fa8c0', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
        {label}
      </p>
      <p style={{ color, fontSize: 26, fontWeight: 700,
        margin: '8px 0 4px', fontFamily: 'Georgia, serif' }}>
        {value}
      </p>
      {sub && <p style={{ color: '#5a7a94', fontSize: 12, margin: 0 }}>{sub}</p>}
      {trend && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 8, background: trend.up ? '#10b98120' : '#ef444420',
          borderRadius: 20, padding: '2px 10px',
        }}>
          <span style={{ color: trend.up ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 700 }}>
            {trend.up ? '▲' : '▼'} {trend.pct}%
          </span>
          <span style={{ color: '#5a7a94', fontSize: 11 }}>vs bulan lalu</span>
        </div>
      )}
    </div>
  );
}

function OpexCard({ item }: { item: typeof opexData[0] }) {
  const pct = Math.min(item.pct, 100);
  const over = item.over;
  return (
    <div style={{
      background: '#0d2137',
      border: `1px solid ${over ? '#ef444430' : '#1e3a52'}`,
      borderRadius: 12, padding: '16px 20px',
    }}>
      <p style={{ color: '#8fa8c0', fontSize: 11, letterSpacing: '0.1em',
        textTransform: 'uppercase', margin: '0 0 4px' }}>{item.kategori}</p>
      <p style={{ color: over ? '#ef4444' : '#f0c040', fontSize: 20,
        fontWeight: 700, margin: '0 0 2px', fontFamily: 'Georgia, serif' }}>
        {rpShort(item.realisasi)}
      </p>
      <p style={{ color: '#4a6a84', fontSize: 11, margin: '0 0 10px' }}>
        dari {rpShort(item.anggaran)}
      </p>
      <div style={{ height: 6, background: '#1e3a52', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: over
            ? 'linear-gradient(90deg, #ef4444, #ff6b6b)'
            : 'linear-gradient(90deg, #f0c040, #ffd700)',
        }} />
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, marginTop: 6,
        color: over ? '#ef4444' : '#10b981' }}>
        {over ? `⚠ Over ${item.pct}%` : `✓ OK ${item.pct}%`}
      </p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0a1628', border: '1px solid #1e3a52',
      borderRadius: 10, padding: '10px 16px', fontSize: 13,
    }}>
      <p style={{ color: '#8fa8c0', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {rpShort(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
export default function LunomiDashboard() {
  return (
    <div style={{ color: '#e0eaf4', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── KPI CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        <KPICard label="Total Pemasukan" value="Rp 52,7jt"
          sub="Bulan April 2026" trend={{ pct: 12, up: true }} color="#10b981" />
        <KPICard label="Total Pengeluaran" value="Rp 18,4jt"
          sub="Bulan April 2026" trend={{ pct: 5, up: false }} color="#ef4444" />
        <KPICard label="Laba Bersih" value="Rp 34,3jt"
          sub="Margin 65%" trend={{ pct: 18, up: true }} color="#f0c040" />
        <KPICard label="Transaksi" value="370"
          sub="102 hari ini" trend={{ pct: 8, up: true }} color="#60a5fa" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.6fr 1fr',
        gap: 16, marginBottom: 24,
      }}>
        {/* Arus Kas Chart */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2137, #0a1a2e)',
          border: '1px solid #1e3a52', borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Arus Kas Harian</p>
              <p style={{ margin: 0, fontSize: 12, color: '#4a6a84' }}>7 hari terakhir</p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ color: '#10b981' }}>● Pemasukan</span>
              <span style={{ color: '#ef4444' }}>● Pengeluaran</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={arusKasData}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" />
              <XAxis dataKey="hari" stroke="#4a6a84" tick={{ fontSize: 11 }} />
              <YAxis stroke="#4a6a84" tick={{ fontSize: 11 }} tickFormatter={rpShort} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pemasukan" name="Pemasukan"
                stroke="#10b981" fill="url(#colorIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran"
                stroke="#ef4444" fill="url(#colorOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Produk */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2137, #0a1a2e)',
          border: '1px solid #1e3a52', borderRadius: 16, padding: 24,
        }}>
          <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15 }}>
            🏆 Produk Terlaris
          </p>
          {produkTerlaris.map((p, i) => (
            <div key={p.nama} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? '#f0c040' : i === 1 ? '#8fa8c0' : i === 2 ? '#cd7f32' : '#1e3a52',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
                color: i < 3 ? '#071220' : '#5a7a94',
              }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e0eaf4' }}>{p.nama}</span>
                  <span style={{ fontSize: 12, color: '#f0c040', fontWeight: 700 }}>{rpShort(p.revenue)}</span>
                </div>
                <div style={{ height: 4, background: '#1e3a52', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${(p.terjual / produkTerlaris[0].terjual) * 100}%`,
                    background: 'linear-gradient(90deg, #f0c040, #10b981)',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: '#4a6a84' }}>{p.terjual} terjual</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPEX vs ANGGARAN ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d2137, #0a1a2e)',
        border: '1px solid #1e3a52', borderRadius: 16,
        padding: 24, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>⚙ OPEX vs Anggaran</p>
          <span style={{
            background: '#ef444420', color: '#ef4444',
            borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700,
          }}>1 kategori over budget</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {opexData.map(item => <OpexCard key={item.kategori} item={item} />)}
        </div>
      </div>

      {/* ── JURNAL HARIAN ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d2137, #0a1a2e)',
        border: '1px solid #1e3a52', borderRadius: 16, padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
            📋 Jurnal Harian
            <span style={{ color: '#4a6a84', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              {transaksiTerbaru.length} transaksi terbaru
            </span>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Export CSV', 'Export PDF'].map(btn => (
              <button key={btn} style={{
                background: '#0a1628', border: '1px solid #1e3a52',
                color: '#8fa8c0', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer', fontSize: 12,
              }}>{btn}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e3a52' }}>
                {['TGL', 'KETERANGAN', 'KATEGORI', 'DEBIT', 'KREDIT'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px',
                    textAlign: h === 'DEBIT' || h === 'KREDIT' ? 'right' : 'left',
                    color: '#4a6a84', fontWeight: 600, fontSize: 11,
                    letterSpacing: '0.08em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksiTerbaru.map((t, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid #0d2137',
                  background: i % 2 === 0 ? 'transparent' : '#0a1628',
                }}>
                  <td style={{ padding: '10px 12px', color: '#5a7a94', fontWeight: 600 }}>{t.tgl}</td>
                  <td style={{ padding: '10px 12px', color: '#e0eaf4' }}>{t.keterangan}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: t.kategori === 'PEMASUKAN' ? '#10b98120' : '#1e3a52',
                      color: t.kategori === 'PEMASUKAN' ? '#10b981' : '#8fa8c0',
                      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                    }}>{t.kategori}</span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                    {t.debit ? rp(t.debit) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>
                    {t.kredit ? rp(t.kredit) : '—'}
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
