'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-[#0a1628] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0d8a6a] flex items-center justify-center text-sm font-black">GG</div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Kitchen Display</p>
            <p className="text-[10px] text-gray-500">CLECO GROUP</p>
          </div>
        </div>
        <div className="text-xl font-mono font-bold text-[#0d8a6a]">{time}</div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">18 Apr 2026</span>
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
