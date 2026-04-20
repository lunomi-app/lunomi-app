'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID'));
      setDate(now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#060d14] text-white flex flex-col font-sans">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#071220] border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Back to dashboard */}
          <Link href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0d8a6a] flex items-center justify-center text-sm font-black">GG</div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Kitchen Display</p>
              <p className="text-[10px] text-gray-500">CLECO GROUP · {date}</p>
            </div>
          </div>
        </div>

        <div className="text-2xl font-mono font-black text-[#0d8a6a] tracking-widest">{time}</div>

        <div className="flex items-center gap-3">
          <Link href="/absensi"
            className="px-3 py-1.5 bg-[#0d8a6a]/10 border border-[#0d8a6a]/20 text-[#0d8a6a] rounded-lg text-xs hover:bg-[#0d8a6a] hover:text-white transition-colors">
            Absensi
          </Link>
          <button onClick={logout}
            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500 hover:text-white transition-colors">
            Keluar
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}
