'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { label: 'Overview',     href: '/dashboard',      match: (p: string) => p === '/dashboard',                              icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Keuangan',     href: '/keuangan',       match: (p: string) => p === '/keuangan' || p === '/keuangan/input',    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Penjualan',    href: '/penjualan',      match: (p: string) => p.startsWith('/penjualan'),                      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Produk / Menu',href: '/dashboard/menu', match: (p: string) => p.startsWith('/dashboard/menu'),                 icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Inventori',    href: '/inventori',      match: (p: string) => p.startsWith('/inventori'),                      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { label: 'Pelanggan',    href: '/pelanggan',      match: (p: string) => p.startsWith('/pelanggan'),                      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'AI Analyst',   href: '/ai-analyst',     match: (p: string) => p === '/ai-analyst',                             icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex text-white font-sans">
      <aside className={`bg-black/40 backdrop-blur-md border-r border-white/10 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <h2 className="text-2xl font-bold text-[#C9A84C] tracking-wide">Lunomi</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white ml-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item.match(pathname) ? 'bg-[#0D3B4A] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-colors text-gray-400 hover:bg-red-500/10 hover:text-red-400`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Keluar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm border-b border-white/5">
          <h1 className="text-2xl font-semibold capitalize">
            {pathname === '/dashboard' ? 'Dashboard Utama' : pathname.split('/').pop()?.replace(/-/g, ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium hidden md:block">Cleco Pii / Admin</p>
            <div className="w-10 h-10 rounded-full bg-[#0D3B4A] flex items-center justify-center border border-[#C9A84C]">
              <span className="font-bold text-[#C9A84C]">C</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
