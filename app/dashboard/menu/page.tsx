'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MasterMenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk form
  const [namaProduk, setNamaProduk] = useState('');
  const [kategori, setKategori] = useState('Minuman');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  
  // State untuk data tabel
  const [produkList, setProdukList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data produk saat halaman pertama kali dimuat
  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    // Supabase otomatis hanya menampilkan produk dari bisnis yang user punya akses (berkat RLS)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error);
    } else if (data) {
      setProdukList(data);
    }
    setIsLoading(false);
  };

  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Dapatkan user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User belum login');

      // 2. Cari business_id milik user ini
      const { data: bisnis, error: bisnisError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (bisnisError || !bisnis) throw new Error('Data bisnis tidak ditemukan. Pastikan Anda sudah setup bisnis.');

      // 3. Insert data ke tabel products
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            business_id: bisnis.id,
            name: namaProduk,
            category: kategori,
            price: parseFloat(harga),
            stock: parseInt(stok),
            // sku, cost, dan unit menggunakan default dari database untuk sementara
          }
        ]);

      if (insertError) throw insertError;

      // Jika berhasil: tutup modal, reset form, dan muat ulang tabel
      setIsModalOpen(false);
      setNamaProduk('');
      setHarga('');
      setStok('');
      fetchProduk();

    } catch (error: any) {
      console.error('Error simpan produk:', error.message);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Daftar Menu & Produk</h2>
          <p className="text-gray-400 text-sm mt-1">Kelola daftar menu, harga, dan ketersediaan stok.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C9A84C] hover:bg-[#b59642] text-black font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Tabel Data Produk */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-sm text-gray-300">
                <th className="p-4 font-medium">Nama Produk</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Harga Jual</th>
                <th className="p-4 font-medium">Stok</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : produkList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>Belum ada produk yang ditambahkan.</p>
                  </td>
                </tr>
              ) : (
                produkList.map((produk) => (
                  <tr key={produk.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{produk.name}</td>
                    <td className="p-4 text-gray-400">
                      <span className="bg-gray-800 text-xs px-2 py-1 rounded-md">{produk.category}</span>
                    </td>
                    <td className="p-4 text-[#C9A84C]">Rp {produk.price.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-gray-300">{produk.stock} pcs</td>
                    <td className="p-4 text-right text-sm">
                      <button className="text-gray-400 hover:text-white mr-3">Edit</button>
                      <button className="text-red-400 hover:text-red-300">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Produk (Pop-up) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1f26] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Tambah Produk Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSimpanProduk} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nama Produk / Menu</label>
                <input type="text" required value={namaProduk} onChange={(e) => setNamaProduk(e.target.value)} placeholder="Cth: Kopi Susu Gula Aren" className="w-full bg-[#0a0f16] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#C9A84C]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full bg-[#0a0f16] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#C9A84C] [&>option]:bg-gray-800">
                  <option value="Minuman">Minuman</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Snack">Snack</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Harga Jual (Rp)</label>
                  <input type="number" required value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="15000" className="w-full bg-[#0a0f16] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#C9A84C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stok Awal</label>
                  <input type="number" required value={stok} onChange={(e) => setStok(e.target.value)} placeholder="50" className="w-full bg-[#0a0f16] border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#C9A84C]" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors" disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-[#0D3B4A] hover:bg-[#092934] text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[140px]">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}