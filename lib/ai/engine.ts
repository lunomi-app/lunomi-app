import {
  INVENTORY, RECIPES, PRODUCTS, TRANSACTIONS, STAFF, CUSTOMERS, PROMOTIONS,
  calcHppFromRecipe, rp, salesByStaff, countByStaff, totalKomisiByStaff,
} from '@/lib/data/store';

// ─── Insight helpers ────────────────────────────────────────────────────────

function getLowStock() {
  return INVENTORY.filter(i => i.stok > 0 && i.stok <= i.min);
}
function getOutOfStock() {
  return INVENTORY.filter(i => i.stok === 0);
}
function getProductMargins() {
  return PRODUCTS.map(p => {
    const hpp = calcHppFromRecipe(p.id) || p.hpp;
    return { ...p, hpp, margin: p.harga > 0 ? Math.round((p.harga - hpp) / p.harga * 100) : 0 };
  });
}
function getLunasTrx() {
  return TRANSACTIONS.filter(t => t.status === 'LUNAS');
}
function getProdSales() {
  const map: Record<string, { qty: number; rev: number }> = {};
  getLunasTrx().forEach(t => t.items.forEach(i => {
    if (!map[i.nama]) map[i.nama] = { qty: 0, rev: 0 };
    map[i.nama].qty += i.qty;
    map[i.nama].rev += i.qty * i.harga;
  }));
  return map;
}
function getStaffPerf() {
  return STAFF.filter(s => s.status === 'Aktif').map(s => ({
    ...s,
    sales: salesByStaff(s.id),
    trx: countByStaff(s.id),
    komisi: totalKomisiByStaff(s.id),
  })).sort((a, b) => b.sales - a.sales);
}
function getActivePromos() {
  return PROMOTIONS.filter(p => p.aktif);
}
function getPromoUsage() {
  return PROMOTIONS.map(p => ({ ...p, pct: Math.round(p.used / p.maxUse * 100) }));
}

// ─── Response templates (data-driven) ──────────────────────────────────────

type ResponseMap = { keywords: string[]; response: () => string }[];

const RESPONSES: ResponseMap = [
  // ── INVENTORI ─────────────────────────────────────────────────────────
  {
    keywords: ['stok', 'inventori', 'bahan', 'restock', 'habis', 'menipis'],
    response: () => {
      const low = getLowStock();
      const out = getOutOfStock();
      const totalVal = INVENTORY.reduce((s, i) => s + i.stok * i.harga, 0);
      let msg = `**Analisis Inventori — 20 April 2026**\n\n`;
      if (out.length > 0) {
        msg += `🔴 **${out.length} item HABIS:** ${out.map(i => i.nama).join(', ')}\n\n`;
      }
      if (low.length > 0) {
        msg += `🟡 **${low.length} item menipis:**\n`;
        low.forEach(i => {
          msg += `• ${i.nama}: sisa **${i.stok} ${i.unit}** (min. ${i.min} ${i.unit})\n`;
        });
        msg += '\n';
      }
      if (out.length === 0 && low.length === 0) {
        msg += `✅ Semua stok dalam kondisi aman.\n\n`;
      }
      msg += `📦 **Nilai total inventori:** ${rp(Math.round(totalVal))}\n\n`;
      msg += `**Rekomendasi:**\n`;
      if (out.length > 0) msg += `• Segera restock ${out[0].nama} — produksi terhambat\n`;
      if (low.length > 0) msg += `• Pesan ${low.map(i => i.nama).slice(0, 2).join(' dan ')} sebelum 2 hari ke depan\n`;
      msg += `• Pertimbangkan safety stock 2x lipat untuk bahan baku utama`;
      return msg;
    },
  },

  // ── RESEP / HPP ───────────────────────────────────────────────────────
  {
    keywords: ['resep', 'hpp', 'bahan baku', 'margin', 'profit', 'harga pokok'],
    response: () => {
      const margins = getProductMargins();
      const low = margins.filter(p => p.margin < 40).sort((a, b) => a.margin - b.margin);
      const high = margins.filter(p => p.margin >= 65).sort((a, b) => b.margin - a.margin);
      const avgMargin = Math.round(margins.reduce((s, p) => s + p.margin, 0) / margins.length);
      let msg = `**Analisis Resep & HPP**\n\n`;
      msg += `📊 **Rata-rata margin:** ${avgMargin}%\n\n`;
      if (high.length > 0) {
        msg += `✅ **Produk margin tinggi (>65%):**\n`;
        high.slice(0, 3).forEach(p => msg += `• ${p.nama}: margin **${p.margin}%** (HPP ${rp(p.hpp)})\n`);
        msg += '\n';
      }
      if (low.length > 0) {
        msg += `⚠️ **Produk margin rendah (<40%):**\n`;
        low.slice(0, 3).forEach(p => msg += `• ${p.nama}: margin **${p.margin}%** — perlu review harga atau resep\n`);
        msg += '\n';
      }
      msg += `**Rekomendasi:**\n`;
      if (low.length > 0) {
        msg += `• Naikan harga ${low[0].nama} minimal ${rp(Math.round(low[0].hpp * 1.5))} atau cari supplier alternatif\n`;
      }
      msg += `• Fokus promosi pada produk margin tinggi untuk meningkatkan profitabilitas\n`;
      msg += `• Review resep ${margins.sort((a, b) => a.margin - b.margin)[0]?.nama} — cek efisiensi bahan`;
      return msg;
    },
  },

  // ── PENJUALAN / KASIR ─────────────────────────────────────────────────
  {
    keywords: ['penjualan', 'transaksi', 'kasir', 'order', 'revenue', 'omzet', 'terjual'],
    response: () => {
      const lunas = getLunasTrx();
      const totalRev = lunas.reduce((s, t) => s + t.total, 0);
      const avgOrder = lunas.length > 0 ? Math.round(totalRev / lunas.length) : 0;
      const prodSales = getProdSales();
      const top = Object.entries(prodSales).sort((a, b) => b[1].rev - a[1].rev).slice(0, 3);
      const slow = Object.entries(prodSales).sort((a, b) => a[1].rev - b[1].rev).slice(0, 2);
      const pending = TRANSACTIONS.filter(t => t.status === 'PENDING').length;
      let msg = `**Analisis Penjualan Hari Ini**\n\n`;
      msg += `💰 **Total revenue:** ${rp(totalRev)} dari ${lunas.length} transaksi\n`;
      msg += `🧾 **Rata-rata order:** ${rp(avgOrder)}\n`;
      msg += `⏳ **Pending:** ${pending} order belum dibayar\n\n`;
      msg += `🏆 **Top 3 produk:**\n`;
      top.forEach(([nama, d], i) => msg += `${i + 1}. ${nama}: ${d.qty}x — ${rp(d.rev)}\n`);
      msg += `\n📉 **Produk kurang laris:**\n`;
      slow.forEach(([nama, d]) => msg += `• ${nama}: ${d.qty}x saja — pertimbangkan bundling/promo\n`);
      msg += `\n**Rekomendasi:**\n`;
      msg += `• Upsell ${top[0]?.[0]} ke pelanggan yang order minuman saja\n`;
      if (pending > 2) msg += `• Ada ${pending} order pending — follow up segera ke dapur\n`;
      msg += `• Jam 18-22 adalah peak hour — pastikan stok bahan cukup`;
      return msg;
    },
  },

  // ── PROMOSI ───────────────────────────────────────────────────────────
  {
    keywords: ['promo', 'promosi', 'diskon', 'voucher', 'kode', 'kampanye'],
    response: () => {
      const promoStats = getPromoUsage();
      const active = promoStats.filter(p => p.aktif);
      const nearFull = promoStats.filter(p => p.pct >= 80 && p.aktif);
      const inactive = promoStats.filter(p => !p.aktif);
      const lunasTrx = getLunasTrx();
      const withPromo = lunasTrx.filter(t => t.promoId).length;
      const conversionRate = lunasTrx.length > 0 ? Math.round(withPromo / lunasTrx.length * 100) : 0;
      let msg = `**Analisis Promosi**\n\n`;
      msg += `🎯 **${active.length} promo aktif**, tingkat penggunaan promo: **${conversionRate}%** transaksi\n\n`;
      if (nearFull.length > 0) {
        msg += `🔴 **Hampir habis kuota:**\n`;
        nearFull.forEach(p => msg += `• ${p.nama} (${p.kode}): ${p.used}/${p.maxUse} — ${p.pct}%\n`);
        msg += '\n';
      }
      msg += `📋 **Status promo aktif:**\n`;
      active.forEach(p => msg += `• ${p.nama}: ${p.used}/${p.maxUse} digunakan (${p.pct}%)\n`);
      msg += `\n💡 **Rekomendasi:**\n`;
      if (nearFull.length > 0) msg += `• Tingkatkan kuota ${nearFull[0].nama} atau siapkan promo pengganti\n`;
      if (inactive.length > 0) msg += `• Aktifkan ${inactive[0].nama} untuk weekend — cocok untuk meningkatkan traffic\n`;
      msg += `• Tambahkan promo bundling: "Kopi + Snack" diskon 15% — efektif naikan average order value`;
      return msg;
    },
  },

  // ── KARYAWAN ─────────────────────────────────────────────────────────
  {
    keywords: ['karyawan', 'staff', 'kasir', 'dapur', 'absen', 'performa', 'komisi', 'gaji'],
    response: () => {
      const perf = getStaffPerf();
      const totalSales = perf.reduce((s, p) => s + p.sales, 0);
      const top = perf[0];
      const lowest = perf[perf.length - 1];
      const totalKomisi = perf.reduce((s, p) => s + p.komisi, 0);
      let msg = `**Analisis Performa Karyawan**\n\n`;
      msg += `👥 **${perf.length} karyawan aktif**\n\n`;
      msg += `🏆 **Performa hari ini:**\n`;
      perf.forEach((s, i) => {
        const share = totalSales > 0 ? Math.round(s.sales / totalSales * 100) : 0;
        msg += `${i + 1}. ${s.nama} (${s.role}): ${s.trx} trx — ${rp(s.sales)} — kontribusi **${share}%**\n`;
      });
      msg += `\n💵 **Total komisi terhitung:** ${rp(totalKomisi)}\n\n`;
      msg += `**Rekomendasi:**\n`;
      if (top) msg += `• ${top.nama} performa terbaik — berikan recognition/bonus\n`;
      if (lowest && lowest.sales < totalSales * 0.15) msg += `• ${lowest.nama} perlu coaching — bantu dengan teknik upselling\n`;
      msg += `• Rotasi shift kasir setiap 3 jam untuk menjaga fokus\n`;
      msg += `• Adakan briefing harian 10 menit sebelum buka untuk target penjualan`;
      return msg;
    },
  },

  // ── PELANGGAN ─────────────────────────────────────────────────────────
  {
    keywords: ['pelanggan', 'customer', 'member', 'loyal', 'churn', 'vip'],
    response: () => {
      const sorted = [...CUSTOMERS].sort((a, b) => b.totalSpend - a.totalSpend);
      const platinum = CUSTOMERS.filter(c => c.member === 'Platinum');
      const regular = CUSTOMERS.filter(c => c.member === 'Regular');
      const totalSpend = CUSTOMERS.reduce((s, c) => s + c.totalSpend, 0);
      const avgSpend = Math.round(totalSpend / CUSTOMERS.length);
      const topCustomer = sorted[0];
      let msg = `**Analisis Pelanggan**\n\n`;
      msg += `👤 **${CUSTOMERS.length} pelanggan terdaftar**\n`;
      msg += `💰 **Total spend keseluruhan:** ${rp(totalSpend)}\n`;
      msg += `📊 **Rata-rata spend per pelanggan:** ${rp(avgSpend)}\n\n`;
      msg += `🏅 **Segmen member:**\n`;
      ['Platinum', 'Gold', 'Silver', 'Regular'].forEach(m => {
        const count = CUSTOMERS.filter(c => c.member === m).length;
        msg += `• ${m}: ${count} pelanggan\n`;
      });
      msg += `\n⭐ **VIP tertinggi:** ${topCustomer?.nama} — ${rp(topCustomer?.totalSpend)} total\n\n`;
      msg += `**Rekomendasi:**\n`;
      msg += `• Kirim thank-you message ke ${platinum.length} pelanggan Platinum minggu ini\n`;
      if (regular.length > 2) msg += `• Tawarkan upgrade Silver ke ${regular.length} Regular member dengan minimum 5x kunjungan\n`;
      msg += `• Buat loyalty program: "Kumpulkan 10 stamp, gratis 1 kopi"\n`;
      msg += `• Hubungi pelanggan yang tidak kunjungi >7 hari dengan personal WhatsApp`;
      return msg;
    },
  },

  // ── KEUANGAN ─────────────────────────────────────────────────────────
  {
    keywords: ['keuangan', 'profit', 'laba', 'biaya', 'kas', 'cash flow', 'finansial'],
    response: () => {
      const lunas = getLunasTrx();
      const totalRev = lunas.reduce((s, t) => s + t.total, 0);
      const margins = getProductMargins();
      const totalHPP = lunas.reduce((t_acc, t) => t_acc + t.items.reduce((s, i) => {
        const p = PRODUCTS.find(p => p.id === i.produkId);
        return s + (p?.hpp || 0) * i.qty;
      }, 0), 0);
      const grossProfit = totalRev - totalHPP;
      const estOps = Math.round(grossProfit * 0.35);
      const estNet = Math.round(grossProfit * 0.65);
      const hppPct = totalRev > 0 ? Math.round(totalHPP / totalRev * 100) : 0;
      const avgMargin = Math.round(margins.reduce((s, p) => s + p.margin, 0) / margins.length);
      let msg = `**Analisis Keuangan — 20 April 2026**\n\n`;
      msg += `💰 **Revenue:** ${rp(totalRev)}\n`;
      msg += `📉 **HPP/COGS:** ${rp(totalHPP)} (${hppPct}% dari revenue)\n`;
      msg += `✅ **Gross Profit:** ${rp(grossProfit)} (margin ${avgMargin}%)\n`;
      msg += `🏢 **Est. Biaya Ops:** ${rp(estOps)} (35% dari gross profit)\n`;
      msg += `🎯 **Est. Laba Bersih:** ${rp(estNet)}\n\n`;
      msg += `**Rekomendasi:**\n`;
      if (hppPct > 35) msg += `• HPP ${hppPct}% terlalu tinggi — target max 30%, renegosikan harga supplier\n`;
      else msg += `• HPP ${hppPct}% dalam batas sehat\n`;
      msg += `• Dorong penjualan minuman premium — margin lebih tinggi vs makanan\n`;
      msg += `• Pertimbangkan subscription package untuk B2B: office catering monthly contract`;
      return msg;
    },
  },

  // ── MARKETING ────────────────────────────────────────────────────────
  {
    keywords: ['marketing', 'kampanye', 'iklan', 'instagram', 'media sosial', 'reach'],
    response: () => {
      let msg = `**Analisis Marketing & Kampanye**\n\n`;
      msg += `📱 **3 kampanye aktif** berjalan saat ini\n\n`;
      msg += `📊 **Performa kampanye:**\n`;
      msg += `• Promo Ramadan (Instagram): 12.400 reach, 87 konversi (0.7%)\n`;
      msg += `• WA Blast Member: 834 reach, 143 konversi (17.1%) ← **terbaik!**\n`;
      msg += `• Coffee Day 18 Apr: 3.200 reach, 44 konversi (1.4%)\n\n`;
      msg += `💡 **Insight:**\n`;
      msg += `• WhatsApp Blast ke member menghasilkan konversi 17x lebih tinggi dari Instagram\n`;
      msg += `• Biaya per konversi WA Blast sangat rendah — efisiensi tertinggi\n\n`;
      msg += `**Rekomendasi:**\n`;
      msg += `• Tingkatkan frekuensi WA Blast ke member — minimal 2x/minggu\n`;
      msg += `• Konten Instagram fokus storytelling: behind-the-scene pembuatan kopi\n`;
      msg += `• Buat TikTok series "1 menit barista" — potensi viral tinggi`;
      return msg;
    },
  },

  // ── SARAN UMUM / BISNIS ───────────────────────────────────────────────
  {
    keywords: ['saran', 'rekomendasi', 'tingkatkan', 'bisnis', 'strategi', 'improve'],
    response: () => {
      const lunas = getLunasTrx();
      const totalRev = lunas.reduce((s, t) => s + t.total, 0);
      const out = getOutOfStock();
      const low = getLowStock();
      let msg = `**Rekomendasi Bisnis Hari Ini**\n\n`;
      msg += `Berdasarkan analisis data real-time:\n\n`;
      if (out.length > 0 || low.length > 0) {
        msg += `🔴 **Prioritas 1 — Stok:** ${out.length + low.length} item perlu perhatian segera\n`;
      }
      msg += `🟡 **Prioritas 2 — Revenue:** Target hari ini ${rp(totalRev + 200000)} — gap Rp 200rb\n`;
      msg += `🟢 **Prioritas 3 — Pelanggan:** Hubungi 3 pelanggan yang belum kunjungi minggu ini\n\n`;
      msg += `**Quick wins hari ini:**\n`;
      msg += `• Pasang papan "Promo HAPPY10" di meja — tingkatkan average order\n`;
      msg += `• Tawarkan paket combo: Latte + Croissant hemat Rp 5.000\n`;
      msg += `• Bagikan 5 free sample Cold Brew ke pelanggan untuk dapatkan review Google\n`;
      msg += `• Foto produk baru untuk Instagram Story — posting jam 18:00 (peak engagement)`;
      return msg;
    },
  },

  // ── JADWAL / SHIFT ────────────────────────────────────────────────────
  {
    keywords: ['jadwal', 'shift', 'absen', 'kehadiran'],
    response: () => {
      const perf = getStaffPerf();
      let msg = `**Analisis Jadwal & Kehadiran**\n\n`;
      msg += `👥 **Karyawan aktif hari ini:** ${perf.length} orang\n\n`;
      msg += `📋 **Status kehadiran:**\n`;
      STAFF.filter(s => s.status === 'Aktif').forEach(s => {
        msg += `• ${s.nama} (${s.role}): ✓ Hadir\n`;
      });
      msg += `\n**Saran optimasi shift:**\n`;
      msg += `• Peak hour 12:00-14:00 & 18:00-21:00 — pastikan min 2 kasir aktif\n`;
      msg += `• Rotasi dapur: shift pagi (07:00-15:00) & siang (13:00-21:00)\n`;
      msg += `• Briefing harian 10 menit sebelum buka jam 08:00\n`;
      msg += `• Gunakan system presensi digital untuk akurasi absensi`;
      return msg;
    },
  },

  // ── PREDIKSI ─────────────────────────────────────────────────────────
  {
    keywords: ['prediksi', 'forecast', 'besok', 'minggu depan', 'target'],
    response: () => {
      const lunas = getLunasTrx();
      const todayRev = lunas.reduce((s, t) => s + t.total, 0);
      const forecastWeek = Math.round(todayRev * 7 * 1.12);
      const forecastMonth = Math.round(todayRev * 30 * 1.08);
      let msg = `**Prediksi & Forecast**\n\n`;
      msg += `📈 **Berdasarkan data hari ini:**\n\n`;
      msg += `• Revenue hari ini: **${rp(todayRev)}**\n`;
      msg += `• Estimasi minggu ini (±12% growth): **${rp(forecastWeek)}**\n`;
      msg += `• Estimasi bulan ini (±8% growth): **${rp(forecastMonth)}**\n\n`;
      msg += `📊 **Faktor penguat:**\n`;
      msg += `• Weekend biasanya +25% dari hari kerja\n`;
      msg += `• Promo aktif meningkatkan volume order 15-20%\n`;
      msg += `• Ramadan season masih berlangsung — demand minuman non-coffee tinggi\n\n`;
      msg += `**Target yang disarankan:**\n`;
      msg += `• Harian: ${rp(Math.round(todayRev * 1.15))}\n`;
      msg += `• Mingguan: ${rp(Math.round(forecastWeek * 1.05))}\n`;
      msg += `• Bulanan: ${rp(Math.round(forecastMonth * 1.05))}`;
      return msg;
    },
  },
];

// ─── Fallback response ───────────────────────────────────────────────────────
function fallback(q: string): string {
  const lunas = getLunasTrx();
  const totalRev = lunas.reduce((s, t) => s + t.total, 0);
  return `**Asisten AI Lunomi**\n\nHai! Saya bisa membantu analisis:\n• Stok & inventori\n• Resep & HPP\n• Penjualan & kasir\n• Promosi\n• Karyawan\n• Pelanggan\n• Keuangan\n• Marketing & kampanye\n• Prediksi revenue\n\nRevenue hari ini sudah **${rp(totalRev)}**. Apa yang ingin kamu ketahui lebih detail?`;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function getAIResponse(question: string, _context = ''): Promise<string> {
  const q = question.toLowerCase();
  const delay = 1200 + Math.random() * 800;
  await new Promise(r => setTimeout(r, delay));
  for (const item of RESPONSES) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.response();
    }
  }
  return fallback(q);
}

// ─── Contextual quick questions per halaman ─────────────────────────────────
export const QUICK_QUESTIONS: Record<string, string[]> = {
  '/dashboard':     ['Analisis penjualan hari ini', 'Produk terlaris apa?', 'Berikan rekomendasi bisnis hari ini'],
  '/kasir':         ['Order mana yang perlu diprioritaskan?', 'Analisis transaksi hari ini', 'Produk apa yang bisa diupsell?'],
  '/resep':         ['Produk mana yang marginnya paling rendah?', 'Analisis HPP semua produk', 'Resep mana yang perlu dioptimasi?'],
  '/inventori':     ['Bahan apa yang harus direstock sekarang?', 'Analisis kondisi stok hari ini', 'Prediksi kebutuhan bahan minggu ini'],
  '/promosi':       ['Promo mana yang paling efektif?', 'Kapan waktu terbaik untuk promo?', 'Saran promo baru untuk minggu ini'],
  '/karyawan':      ['Siapa karyawan performa terbaik?', 'Analisis kehadiran dan komisi', 'Saran jadwal shift yang optimal'],
  '/pelanggan':     ['Pelanggan mana yang perlu difollow up?', 'Analisis segmen pelanggan', 'Strategi meningkatkan loyalitas pelanggan'],
  '/keuangan':      ['Analisis keuangan hari ini', 'Bagaimana kondisi cash flow?', 'Cara meningkatkan gross profit margin'],
  '/marketing':     ['Kampanye mana yang paling efektif?', 'Strategi marketing untuk minggu ini', 'Cara meningkatkan konversi iklan'],
  '/komisi':        ['Analisis komisi karyawan bulan ini', 'Karyawan mana yang memenuhi target?', 'Saran struktur komisi yang lebih baik'],
  '/invoice':       ['Invoice mana yang jatuh tempo?', 'Analisis piutang bulan ini', 'Strategi mempercepat pembayaran invoice'],
  '/absensi':       ['Analisis pola absensi karyawan', 'Siapa yang sering terlambat?', 'Rekomendasi kebijakan absensi'],
  default:          ['Analisis bisnis hari ini', 'Berikan saran peningkatan revenue', 'Prediksi pendapatan minggu depan'],
};

export function getQuickQuestions(pathname: string): string[] {
  for (const key of Object.keys(QUICK_QUESTIONS)) {
    if (key !== 'default' && pathname.startsWith(key)) return QUICK_QUESTIONS[key];
  }
  return QUICK_QUESTIONS.default;
}
