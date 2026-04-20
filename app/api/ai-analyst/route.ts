import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// ─── Rate Limit Sederhana (in-memory) ────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_QUERIES_PER_DAY = 30;

function checkRateLimit(businessId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(businessId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(businessId, {
      count: 1,
      resetAt: now + 24 * 60 * 60 * 1000,
    });
    return true;
  }

  if (record.count >= MAX_QUERIES_PER_DAY) return false;

  record.count++;
  return true;
}

// ─── Ambil Data Konteks dari Supabase ────────────────────────────────────────
async function buildFinancialContext(businessId: string, period: string) {
  const now = new Date();
  const [year, month] = period
    ? period.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data: txData } = await supabaseServer
    .from('transactions')
    .select('type, category, amount, date, description')
    .eq('business_id', businessId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .limit(200);

  const transactions = txData || [];
  const income = transactions.filter((t) => t.type === 'income');
  const expense = transactions.filter((t) => t.type === 'expense');

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expense.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  const expenseByCategory = expense.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const incomeByCategory = income.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const topExpenses = (Object.entries(expenseByCategory) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amount]) => ({ kategori: cat, total: amount }));

  const { data: salesData } = await supabaseServer
    .from('sales')
    .select('total, subtotal, discount, tax, payment_method, date, status')
    .eq('business_id', businessId)
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('status', 'completed');

  const sales = salesData || [];
  const totalSales = sales.reduce((s, t) => s + Number(t.total), 0);
  const totalDiscount = sales.reduce((s, t) => s + Number(t.discount), 0);
  const avgTransaction = sales.length > 0 ? totalSales / sales.length : 0;

  const paymentBreakdown = sales.reduce<Record<string, number>>((acc, s) => {
    const method = s.payment_method || 'lainnya';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

  const { data: prevTx } = await supabaseServer
    .from('transactions')
    .select('type, amount')
    .eq('business_id', businessId)
    .gte('date', prevStart)
    .lte('date', prevEnd);

  const prevIncome = (prevTx || []).filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const prevExpense = (prevTx || []).filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const prevProfit = prevIncome - prevExpense;

  const rp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return `
=== DATA KEUANGAN BISNIS ===
Periode: ${month}/${year}

RINGKASAN KEUANGAN:
- Total Pemasukan: ${rp(totalIncome)} (${income.length} transaksi)
- Total Pengeluaran: ${rp(totalExpense)} (${expense.length} transaksi)
- Laba Bersih: ${rp(netProfit)}
- Margin Laba: ${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%

PERBANDINGAN BULAN LALU (${prevMonth}/${prevYear}):
- Pemasukan: ${rp(prevIncome)} (${prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : 'N/A'}% perubahan)
- Pengeluaran: ${rp(prevExpense)} (${prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense * 100).toFixed(1) : 'N/A'}% perubahan)
- Laba: ${rp(prevProfit)}

TOP KATEGORI PENGELUARAN:
${topExpenses.map((e, i) => `${i + 1}. ${e.kategori}: ${rp(e.total)}`).join('\n')}

TOP KATEGORI PEMASUKAN:
${(Object.entries(incomeByCategory) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, amt], i) => `${i + 1}. ${cat}: ${rp(amt)}`).join('\n')}

DATA PENJUALAN:
- Total Omset: ${rp(totalSales)} (${sales.length} transaksi)
- Total Diskon Diberikan: ${rp(totalDiscount)}
- Rata-rata per Transaksi: ${rp(avgTransaction)}
- Metode Pembayaran: ${Object.entries(paymentBreakdown).map(([m, c]) => `${m}: ${c}x`).join(', ')}
`.trim();
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log('[ai-analyst] authHeader present:', !!authHeader, '| value:', authHeader?.slice(0, 30) + '...');
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    console.log('[ai-analyst] auth user:', user?.id ?? null, '| authError:', authError?.message ?? null);
    if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { question, businessId, period } = body as {
      question: string;
      businessId: string;
      period?: string;
    };
    console.log('[ai-analyst] businessId:', businessId, '| question:', question?.slice(0, 50));

    if (!question || !businessId) {
      return Response.json({ error: 'question dan businessId wajib diisi' }, { status: 400 });
    }

    const { data: bu } = await supabaseServer
      .from('business_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single();

    if (!bu) return Response.json({ error: 'Akses ditolak' }, { status: 403 });

    if (!checkRateLimit(businessId)) {
      return Response.json({ error: 'Batas 30 pertanyaan/hari tercapai. Coba lagi besok.' }, { status: 429 });
    }

    const contextString = await buildFinancialContext(businessId, period || '');

    const systemPrompt = `Kamu adalah Analis Keuangan AI untuk platform Lunomi — asisten cerdas yang membantu pemilik UMKM Indonesia memahami kondisi keuangan bisnis mereka.

Karaktermu:
- Jawab dalam Bahasa Indonesia yang santai tapi profesional, mudah dipahami pemilik bisnis non-akuntan
- Format angka selalu dalam Rupiah (Rp 1.500.000, bukan 1500000)
- Berikan analisis yang ACTIONABLE — bukan sekadar deskripsi angka
- Jika ada tren negatif, sampaikan dengan konstruktif + saran konkret minggu ini
- Jika data tidak cukup untuk menyimpulkan, katakan jujur dan minta user input data lebih

Aturan ketat:
- JANGAN fabrikasi angka yang tidak ada di konteks yang diberikan
- JANGAN berikan saran investasi saham atau hukum
- Maksimal 250 kata, kecuali diminta lebih panjang
- Selalu akhiri dengan 1-2 rekomendasi tindakan konkret

Format jawaban:
1. Kesimpulan utama (1-2 kalimat)
2. Penjelasan detail temuan
3. ✅ Rekomendasi tindakan`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(
      `${contextString}\n\n---\nPertanyaan: ${question}`
    );

    const answer = result.response.text();
    return Response.json({ answer });
  } catch (err) {
    console.error('[ai-analyst] CAUGHT ERROR:', err);
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
