'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function SetupBisnisPage() {
  const [namaBisnis, setNamaBisnis] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kategori, setKategori] = useState('fnb');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Cek user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Anda belum login.');

      // 2. Insert data ke tabel 'businesses'
      const { data: bisnisBaru, error: errorBisnis } = await supabase
        .from('businesses')
        .insert([
          {
            name: namaBisnis,
            type: kategori,
            address: alamat,
            owner_id: user.id, // Menautkan bisnis dengan akun yang login
          }
        ])
        .select()
        .single(); // Ambil data yang baru saja masuk

      if (errorBisnis) throw errorBisnis;

      // 3. Insert ke tabel 'business_users' agar user punya akses ke data bisnis ini (Sesuai aturan RLS)
      const { error: errorMember } = await supabase
        .from('business_users')
        .insert([
          {
            business_id: bisnisBaru.id,
            user_id: user.id,
            role: 'owner'
          }
        ]);

      if (errorMember) throw errorMember;

      // Jika semuanya sukses, arahkan ke Dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Error setup bisnis:', error.message);
      alert(`Gagal menyimpan data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212]">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Setup Bisnis</h1>
          <p className="text-gray-300 text-sm">Lengkapi profil usaha Anda untuk mulai.</p>
        </div>

        <form onSubmit={handleSetup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Nama Bisnis / Toko</label>
            <input
              type="text"
              required
              value={namaBisnis}
              onChange={(e) => setNamaBisnis(e.target.value)}
              placeholder="Cth: Cleco Pii Coffee & Eatery"
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D3B4A]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Kategori Bisnis</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D3B4A] [&>option]:bg-gray-800"
            >
              <option value="fnb">Food & Beverage (Cafe/Resto)</option>
              <option value="retail">Retail / Toko Barang</option>
              <option value="jasa">Layanan / Jasa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Alamat Operasional</label>
            <textarea
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Cth: Beji, Depok"
              rows={3}
              className="w-full bg-white/5 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D3B4A]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D3B4A] hover:bg-[#092934] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center mt-6"
          >
            {loading ? 'Menyimpan ke Database...' : 'Simpan & Lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}