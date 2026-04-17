'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Sesuaikan import ini dengan file client.ts kamu
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman refresh
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Jika sukses login, arahkan ke Dashboard
      router.push('/dashboard');
      router.refresh(); // Penting: Memaksa middleware untuk membaca sesi baru
      
    } catch (err: any) {
      console.error('Login error:', err.message);
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Selamat datang di <span className="text-[#00d2ff]">Lunomi</span>
          </h1>
          <p className="text-gray-400 text-sm">Login ke akun bisnis Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Tampilkan pesan error jika ada */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@bisnis.com"
              className="w-full bg-[#1f2937] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1f2937] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center mt-4"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Belum punya akun?{' '}
          <button 
            onClick={() => router.push('/register')} 
            className="text-[#00d2ff] hover:underline"
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  );
}