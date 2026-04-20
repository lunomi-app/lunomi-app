// Shared mock data — single source of truth for all pages

export const STAFF = [
  { id: 'S1', nama: 'Wenny Rahayu',  role: 'kasir',    status: 'Aktif',    telp: '0812-1111-2222', bergabung: '01 Jan 2025', komisiRate: 2 },
  { id: 'S2', nama: 'LUTPI Santoso', role: 'kasir',    status: 'Aktif',    telp: '0813-2222-3333', bergabung: '15 Mar 2024', komisiRate: 2 },
  { id: 'S3', nama: 'Eva Kurniasih', role: 'kasir',    status: 'Aktif',    telp: '0814-3333-4444', bergabung: '10 Jun 2024', komisiRate: 2 },
  { id: 'S4', nama: 'Budi Prasetyo', role: 'dapur',    status: 'Aktif',    telp: '0815-4444-5555', bergabung: '01 Apr 2024', komisiRate: 1.5 },
  { id: 'S5', nama: 'Siti Aminah',   role: 'dapur',    status: 'Aktif',    telp: '0816-5555-6666', bergabung: '20 Feb 2025', komisiRate: 1.5 },
  { id: 'S6', nama: 'Andi Wijaya',   role: 'karyawan', status: 'Nonaktif', telp: '0817-6666-7777', bergabung: '05 Aug 2023', komisiRate: 0 },
];

export const PRODUCTS = [
  { id: 'P1',  nama: 'Espresso Base',   kategori: 'Espresso Base', harga: 32000,  stok: 200, hpp: 8000  },
  { id: 'P2',  nama: 'Americano',       kategori: 'Espresso Base', harga: 28000,  stok: 180, hpp: 6000  },
  { id: 'P3',  nama: 'Kopi Susu',       kategori: 'Espresso Base', harga: 25000,  stok: 250, hpp: 7000  },
  { id: 'P4',  nama: 'Latte',           kategori: 'Espresso Base', harga: 35000,  stok: 160, hpp: 10000 },
  { id: 'P5',  nama: 'Manual Brew V60', kategori: 'Manual Brew',   harga: 45000,  stok: 80,  hpp: 15000 },
  { id: 'P6',  nama: 'Cold Brew',       kategori: 'Manual Brew',   harga: 35000,  stok: 60,  hpp: 12000 },
  { id: 'P7',  nama: 'Matcha Latte',    kategori: 'Non-Coffee',    harga: 38000,  stok: 120, hpp: 11000 },
  { id: 'P8',  nama: 'Chocolate',       kategori: 'Non-Coffee',    harga: 32000,  stok: 90,  hpp: 9000  },
  { id: 'P9',  nama: 'Croissant',       kategori: 'Makanan',       harga: 18000,  stok: 45,  hpp: 7000  },
  { id: 'P10', nama: 'Sandwich',        kategori: 'Makanan',       harga: 32000,  stok: 30,  hpp: 12000 },
  { id: 'P11', nama: 'Cake Slice',      kategori: 'Makanan',       harga: 35000,  stok: 20,  hpp: 14000 },
  { id: 'P12', nama: 'Totebag',         kategori: 'Merchandise',   harga: 85000,  stok: 15,  hpp: 35000 },
];

export const CUSTOMERS = [
  { id: 'C1', nama: 'Ahmad Fauzi',     telp: '0812-3456-7890', email: 'ahmad@email.com',  kunjungan: 45, totalSpend: 3600000, member: 'Platinum', terakhir: '18 Apr 2026' },
  { id: 'C2', nama: 'Fitri Handayani', telp: '0818-9012-3456', email: 'fitri@email.com',  kunjungan: 56, totalSpend: 4480000, member: 'Platinum', terakhir: '18 Apr 2026' },
  { id: 'C3', nama: 'Doni Kurniawan',  telp: '0815-6789-0123', email: 'doni@email.com',   kunjungan: 32, totalSpend: 2560000, member: 'Gold',     terakhir: '16 Apr 2026' },
  { id: 'C4', nama: 'Budi Santoso',    telp: '0812-3456-7800', email: 'budi@email.com',   kunjungan: 24, totalSpend: 1840000, member: 'Gold',     terakhir: '18 Apr 2026' },
  { id: 'C5', nama: 'Sari Dewi',       telp: '0813-2345-6789', email: 'sari@email.com',   kunjungan: 18, totalSpend: 1260000, member: 'Silver',   terakhir: '17 Apr 2026' },
  { id: 'C6', nama: 'Maya Anggraini',  telp: '0816-7890-1234', email: 'maya@email.com',   kunjungan: 11, totalSpend: 770000,  member: 'Silver',   terakhir: '18 Apr 2026' },
  { id: 'C7', nama: 'Rina Putri',      telp: '0814-5678-9012', email: 'rina@email.com',   kunjungan: 7,  totalSpend: 420000,  member: 'Regular',  terakhir: '15 Apr 2026' },
  { id: 'C8', nama: 'Hendra Wijaya',   telp: '0817-8901-2345', email: 'hendra@email.com', kunjungan: 3,  totalSpend: 180000,  member: 'Regular',  terakhir: '10 Apr 2026' },
];

export type TxStatus = 'LUNAS' | 'PENDING' | 'REFUND' | 'BATAL';

export const TRANSACTIONS = [
  { id: '#TRX-001', waktu: '21:38', kasirId: 'S1', kasir: 'Wenny',  customerId: 'C1', items: [{ produkId: 'P1', nama: 'Espresso Base', qty: 2, harga: 32000 }, { produkId: 'P9', nama: 'Croissant', qty: 1, harga: 18000 }], metode: 'QRIS',  status: 'LUNAS' as TxStatus, jenis: 'Dine-In',   promoId: null,  total: 82000  },
  { id: '#TRX-002', waktu: '21:15', kasirId: 'S2', kasir: 'LUTPI',  customerId: 'C5', items: [{ produkId: 'P4', nama: 'Latte',         qty: 1, harga: 35000 }, { produkId: 'P9', nama: 'Croissant', qty: 1, harga: 18000 }], metode: 'Tunai', status: 'LUNAS' as TxStatus, jenis: 'Take Away', promoId: null,  total: 53000  },
  { id: '#TRX-003', waktu: '20:52', kasirId: 'S3', kasir: 'Eva',    customerId: 'C6', items: [{ produkId: 'P7', nama: 'Matcha Latte',  qty: 3, harga: 38000 }],                                                               metode: 'Debit', status: 'LUNAS' as TxStatus, jenis: 'Dine-In',   promoId: 'PR1', total: 108600 },
  { id: '#TRX-004', waktu: '20:11', kasirId: 'S1', kasir: 'Wenny',  customerId: null, items: [{ produkId: 'P5', nama: 'Manual Brew',   qty: 1, harga: 45000 }],                                                               metode: '-',     status: 'PENDING' as TxStatus, jenis: 'Take Away', promoId: null,  total: 45000  },
  { id: '#TRX-005', waktu: '19:44', kasirId: 'S3', kasir: 'Eva',    customerId: 'C4', items: [{ produkId: 'P2', nama: 'Americano',     qty: 2, harga: 28000 }, { produkId: 'P11', nama: 'Cake Slice', qty: 1, harga: 35000 }], metode: 'QRIS',  status: 'LUNAS' as TxStatus, jenis: 'Order Online', promoId: null, total: 91000  },
  { id: '#TRX-006', waktu: '19:20', kasirId: 'S2', kasir: 'LUTPI',  customerId: null, items: [{ produkId: 'P3', nama: 'Kopi Susu',     qty: 4, harga: 25000 }],                                                               metode: 'Tunai', status: 'LUNAS' as TxStatus, jenis: 'Dine-In',   promoId: null,  total: 100000 },
  { id: '#TRX-007', waktu: '18:55', kasirId: 'S1', kasir: 'Wenny',  customerId: 'C3', items: [{ produkId: 'P7', nama: 'Matcha Latte',  qty: 2, harga: 38000 }, { produkId: 'P9', nama: 'Pastry',    qty: 2, harga: 18000 }], metode: 'QRIS',  status: 'REFUND' as TxStatus, jenis: 'Dine-In',   promoId: null,  total: 112000 },
  { id: '#TRX-008', waktu: '18:30', kasirId: 'S3', kasir: 'Eva',    customerId: null, items: [{ produkId: 'P6', nama: 'Cold Brew',     qty: 1, harga: 35000 }],                                                               metode: 'GoPay', status: 'LUNAS' as TxStatus, jenis: 'Take Away', promoId: null,  total: 35000  },
  { id: '#TRX-009', waktu: '18:05', kasirId: 'S1', kasir: 'Wenny',  customerId: null, items: [{ produkId: 'P1', nama: 'Espresso Base', qty: 1, harga: 32000 }, { produkId: 'P10', nama: 'Sandwich', qty: 1, harga: 32000 }], metode: 'Debit', status: 'LUNAS' as TxStatus, jenis: 'Dine-In',   promoId: null,  total: 64000  },
  { id: '#TRX-010', waktu: '17:48', kasirId: 'S2', kasir: 'LUTPI',  customerId: 'C2', items: [{ produkId: 'P5', nama: 'Manual Brew',   qty: 2, harga: 45000 }],                                                               metode: 'Tunai', status: 'LUNAS' as TxStatus, jenis: 'Order Online', promoId: 'PR2', total: 81000  },
];

export const PROMOTIONS = [
  { id: 'PR1', nama: 'Happy Hour -10%', kode: 'HAPPY10',  tipe: 'persen' as const, nilai: 10,    minOrder: 50000,  used: 34, maxUse: 100, berlakuHingga: '30 Apr 2026', aktif: true  },
  { id: 'PR2', nama: 'Member Silver',   kode: 'SILVER10', tipe: 'persen' as const, nilai: 10,    minOrder: 30000,  used: 18, maxUse: 999, berlakuHingga: '31 Des 2026', aktif: true  },
  { id: 'PR3', nama: 'Diskon Rp 15rb',  kode: 'DISC15K',  tipe: 'nominal' as const, nilai: 15000, minOrder: 100000, used: 7,  maxUse: 50,  berlakuHingga: '20 Apr 2026', aktif: true  },
  { id: 'PR4', nama: 'Buy 1 Get 1',     kode: 'BOGO',     tipe: 'bogo' as const,    nilai: 50,    minOrder: 0,      used: 12, maxUse: 30,  berlakuHingga: '18 Apr 2026', aktif: false },
  { id: 'PR5', nama: 'Weekend -15%',    kode: 'WKND15',   tipe: 'persen' as const, nilai: 15,    minOrder: 75000,  used: 0,  maxUse: 200, berlakuHingga: '31 Mei 2026', aktif: false },
];

export const INVOICES = [
  { id: 'INV-2604-001', klien: 'PT Maju Bersama',  email: 'finance@majubersama.com',  items: 'Paket Meeting 20 pax', jumlah: 3200000, tgl: '10 Apr 2026', jatuhTempo: '25 Apr 2026', status: 'Terkirim' },
  { id: 'INV-2604-002', klien: 'CV Kreatif Media',  email: 'admin@kreatiifmedia.com',  items: 'Catering Harian 7 hari', jumlah: 1850000, tgl: '12 Apr 2026', jatuhTempo: '27 Apr 2026', status: 'Lunas' },
  { id: 'INV-2604-003', klien: 'Klinik Sehat Jaya', email: 'keuangan@kliniksj.com',   items: 'Paket Snack & Coffee',  jumlah: 950000,  tgl: '14 Apr 2026', jatuhTempo: '29 Apr 2026', status: 'Draft' },
  { id: 'INV-2604-004', klien: 'Budi Santoso',       email: 'budi@email.com',          items: 'Hamper Ramadan x5',    jumlah: 475000,  tgl: '01 Apr 2026', jatuhTempo: '08 Apr 2026', status: 'Jatuh Tempo' },
];

export const CAMPAIGNS = [
  { id: 'CM1', nama: 'Promo Ramadan',       channel: 'Instagram',  mulai: '01 Apr 2026', selesai: '30 Apr 2026', budget: 1500000, reach: 12400, konversi: 87,  status: 'Aktif'   },
  { id: 'CM2', nama: 'WA Blast Member',     channel: 'WhatsApp',   mulai: '15 Apr 2026', selesai: '20 Apr 2026', budget: 200000,  reach: 834,   konversi: 143, status: 'Aktif'   },
  { id: 'CM3', nama: 'Coffee Day 18 Apr',   channel: 'Instagram',  mulai: '18 Apr 2026', selesai: '18 Apr 2026', budget: 500000,  reach: 3200,  konversi: 44,  status: 'Aktif'   },
  { id: 'CM4', nama: 'Grand Opening V2',    channel: 'TikTok',     mulai: '01 Mei 2026', selesai: '07 Mei 2026', budget: 2000000, reach: 0,     konversi: 0,   status: 'Upcoming'},
  { id: 'CM5', nama: 'Loyalty Reward Q1',   channel: 'Email',      mulai: '01 Mar 2026', selesai: '31 Mar 2026', budget: 300000,  reach: 428,   konversi: 95,  status: 'Selesai' },
];

// ─── Inventori (bahan baku + packaging) ────────────────────────────────────
export type InventoryItem = {
  id: string; nama: string; kategori: string;
  stok: number; unit: string; min: number; harga: number;
};

export const INVENTORY: InventoryItem[] = [
  { id: 'I1',  nama: 'Biji Kopi Arabika',  kategori: 'Bahan Baku', stok: 4.5,  unit: 'kg',    min: 2,   harga: 180000 },
  { id: 'I2',  nama: 'Biji Kopi Robusta',  kategori: 'Bahan Baku', stok: 1.2,  unit: 'kg',    min: 2,   harga: 120000 },
  { id: 'I3',  nama: 'Susu Full Cream',    kategori: 'Bahan Baku', stok: 12,   unit: 'liter', min: 5,   harga: 18000  },
  { id: 'I4',  nama: 'Susu Oat',           kategori: 'Bahan Baku', stok: 3,    unit: 'liter', min: 3,   harga: 45000  },
  { id: 'I5',  nama: 'Matcha Powder',      kategori: 'Bahan Baku', stok: 0.8,  unit: 'kg',    min: 1,   harga: 320000 },
  { id: 'I6',  nama: 'Gula Pasir',         kategori: 'Bahan Baku', stok: 8,    unit: 'kg',    min: 3,   harga: 14000  },
  { id: 'I7',  nama: 'Coklat Bubuk',       kategori: 'Bahan Baku', stok: 1.5,  unit: 'kg',    min: 1,   harga: 85000  },
  { id: 'I8',  nama: 'Vanilla Syrup',      kategori: 'Topping',    stok: 2,    unit: 'botol', min: 2,   harga: 55000  },
  { id: 'I9',  nama: 'Caramel Syrup',      kategori: 'Topping',    stok: 3,    unit: 'botol', min: 2,   harga: 55000  },
  { id: 'I10', nama: 'Gelas Plastik 16oz', kategori: 'Packaging',  stok: 240,  unit: 'pcs',   min: 100, harga: 800    },
  { id: 'I11', nama: 'Kantong Kertas',     kategori: 'Packaging',  stok: 45,   unit: 'pcs',   min: 100, harga: 1200   },
  { id: 'I12', nama: 'Croissant Frozen',   kategori: 'Makanan',    stok: 18,   unit: 'pcs',   min: 10,  harga: 12000  },
  { id: 'I13', nama: 'Roti Tawar',         kategori: 'Makanan',    stok: 10,   unit: 'pcs',   min: 5,   harga: 5000   },
  { id: 'I14', nama: 'Kue Brownies',       kategori: 'Makanan',    stok: 0,    unit: 'pcs',   min: 5,   harga: 25000  },
];

// ─── Resep (recipe per produk) ──────────────────────────────────────────────
export type RecipeIngredient = { inventoriId: string; nama: string; qty: number; unit: string };
export type Recipe = { produkId: string; bahan: RecipeIngredient[] };

export const RECIPES: Recipe[] = [
  { produkId: 'P1', bahan: [
    { inventoriId: 'I1', nama: 'Biji Kopi Arabika',  qty: 0.018, unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P2', bahan: [
    { inventoriId: 'I1', nama: 'Biji Kopi Arabika',  qty: 0.018, unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P3', bahan: [
    { inventoriId: 'I2', nama: 'Biji Kopi Robusta',  qty: 0.015, unit: 'kg'    },
    { inventoriId: 'I3', nama: 'Susu Full Cream',     qty: 0.15,  unit: 'liter' },
    { inventoriId: 'I6', nama: 'Gula Pasir',          qty: 0.02,  unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P4', bahan: [
    { inventoriId: 'I1', nama: 'Biji Kopi Arabika',  qty: 0.018, unit: 'kg'    },
    { inventoriId: 'I3', nama: 'Susu Full Cream',     qty: 0.2,   unit: 'liter' },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P5', bahan: [
    { inventoriId: 'I1', nama: 'Biji Kopi Arabika',  qty: 0.025, unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P6', bahan: [
    { inventoriId: 'I1', nama: 'Biji Kopi Arabika',  qty: 0.025, unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P7', bahan: [
    { inventoriId: 'I5', nama: 'Matcha Powder',       qty: 0.012, unit: 'kg'    },
    { inventoriId: 'I3', nama: 'Susu Full Cream',     qty: 0.2,   unit: 'liter' },
    { inventoriId: 'I6', nama: 'Gula Pasir',          qty: 0.02,  unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P8', bahan: [
    { inventoriId: 'I7', nama: 'Coklat Bubuk',        qty: 0.02,  unit: 'kg'    },
    { inventoriId: 'I3', nama: 'Susu Full Cream',     qty: 0.2,   unit: 'liter' },
    { inventoriId: 'I6', nama: 'Gula Pasir',          qty: 0.02,  unit: 'kg'    },
    { inventoriId: 'I10', nama: 'Gelas Plastik 16oz', qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P9', bahan: [
    { inventoriId: 'I12', nama: 'Croissant Frozen',   qty: 1,     unit: 'pcs'   },
    { inventoriId: 'I11', nama: 'Kantong Kertas',     qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P10', bahan: [
    { inventoriId: 'I13', nama: 'Roti Tawar',         qty: 2,     unit: 'pcs'   },
    { inventoriId: 'I11', nama: 'Kantong Kertas',     qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P11', bahan: [
    { inventoriId: 'I14', nama: 'Kue Brownies',       qty: 1,     unit: 'pcs'   },
    { inventoriId: 'I11', nama: 'Kantong Kertas',     qty: 1,     unit: 'pcs'   },
  ]},
  { produkId: 'P12', bahan: [] },
];

// ─── Reactive store for inventory ──────────────────────────────────────────
type Listener = () => void;
const _listeners: Listener[] = [];

export function subscribeInventory(fn: Listener): () => void {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i > -1) _listeners.splice(i, 1);
  };
}

function notifyInventory() {
  _listeners.forEach(fn => fn());
}

export function consumeInventory(items: { produkId: string; qty: number }[]) {
  items.forEach(({ produkId, qty }) => {
    const recipe = RECIPES.find(r => r.produkId === produkId);
    if (!recipe) return;
    recipe.bahan.forEach(ing => {
      const inv = INVENTORY.find(i => i.id === ing.inventoriId);
      if (inv) inv.stok = Math.max(0, parseFloat((inv.stok - ing.qty * qty).toFixed(3)));
    });
  });
  notifyInventory();
}

export function calcHppFromRecipe(produkId: string): number {
  const recipe = RECIPES.find(r => r.produkId === produkId);
  if (!recipe) return 0;
  return recipe.bahan.reduce((total, ing) => {
    const inv = INVENTORY.find(i => i.id === ing.inventoriId);
    if (!inv) return total;
    const hargaPerUnit = inv.unit === 'kg' ? inv.harga : inv.harga;
    return total + hargaPerUnit * ing.qty;
  }, 0);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
export const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
export const rpK = (n: number) => n >= 1000000 ? `Rp ${(n/1000000).toFixed(1)}jt` : n >= 1000 ? `Rp ${(n/1000).toFixed(0)}rb` : rp(n);

export const todayRevenue = () =>
  TRANSACTIONS.filter(t => t.status === 'LUNAS').reduce((s, t) => s + t.total, 0);

export const totalKomisiByStaff = (staffId: string) => {
  const staff = STAFF.find(s => s.id === staffId);
  if (!staff) return 0;
  const sales = TRANSACTIONS.filter(t => t.kasirId === staffId && t.status === 'LUNAS').reduce((s, t) => s + t.total, 0);
  return Math.round(sales * staff.komisiRate / 100);
};

export const salesByStaff = (staffId: string) =>
  TRANSACTIONS.filter(t => t.kasirId === staffId && t.status === 'LUNAS').reduce((s, t) => s + t.total, 0);

export const countByStaff = (staffId: string) =>
  TRANSACTIONS.filter(t => t.kasirId === staffId && t.status === 'LUNAS').length;
