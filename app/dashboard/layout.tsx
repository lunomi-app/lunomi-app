'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const SIDEBAR_GROUPS = [
  {
    label: 'ANALITIK',
    items: [
      { label: 'Dashboard Penjualan', href: '/dashboard', badge: null },
      { label: 'Analisa Laporan', href: '/dashboard/analisa', badge: 'GRATIS' },
      { label: 'Laporan Lengkap', href: '/dashboard/laporan-lengkap', badge: 'GRATIS' },
    ],
  },
  {
    label: 'MANAJEMEN',
    items: [
      { label: 'Produk', href: '/dashboard/menu', badge: null, arrow: true },
      { label: 'Inventori', href: '/inventori', badge: null, arrow: true },
      { label: 'Pelanggan', href: '/pelanggan', badge: null, arrow: true },
      { label: 'Promosi', href: '/dashboard/promosi', badge: null, arrow: true },
      { label: 'Komisi', href: '/dashboard/komisi', badge: null, arrow: true },
      { label: 'Invoice', href: '/dashboard/invoice', badge: null, arrow: true },
      { label: 'Marketing', href: '/dashboard/marketing', badge: null, arrow: true },
    ],
  },
  {
    label: 'LAPORAN (SEMUA GRATIS)',
    items: [
      { label: 'Laporan Penjualan', href: '/laporan/penjualan', badge: null },
      { label: 'Laporan Dapur', href: '/laporan/dapur', badge: null },
      { label: 'Laporan Produk', href: '/laporan/produk', badge: null },
      { label: 'Laporan Jasa', href: '/laporan/jasa', badge: null },
      { label: 'Laporan Promo & Loyalti', href: '/laporan/promo', badge: null },
      { label: 'Laporan Pajak', href: '/laporan/pajak', badge: null },
      { label: 'Laporan Kasir', href: '/laporan/kasir', badge: null },
      { label: 'Laporan Deposit', href: '/laporan/deposit', badge: null },
      { label: 'Laporan Pelanggan', href: '/laporan/pelanggan', badge: null },
      { label: 'Laporan Karyawan', href: '/laporan/karyawan', badge: null },
      { label: 'Laporan Persediaan', href: '/laporan/persediaan', badge: null },
      { label: 'Laporan Pemasok', href: '/laporan/pemasok', badge: null },
      { label: 'Export PDF/Excel', href: '/laporan/export', badge: 'GRATIS' },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('penjualan');
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="h-screen bg-[#0a1628] flex overflow-hidden text-white font-sans">

      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-[#071220] border-r border-white/10 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0d8a6a] flex items-center justify-center text-xs font-black">GG</div>
            <div>
              <p className="text-[10px] font-bold text-white leading-none">CLECO GROUP</p>
              <p className="text-[8px] text-gray-500 leading-none mt-0.5">INTELLIGENCE DASHBOARD</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-4 py-1.5 text-[9px] font-bold text-gray-500 tracking-widest uppercase">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                      isActive
                        ? 'bg-[#0d3b4a] text-white border-r-2 border-[#0d8a6a]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      {item.badge && (
                        <span className="text-[8px] bg-[#0d8a6a]/20 text-[#0d8a6a] px-1.5 py-0.5 rounded font-bold">
                          {item.badge}
                        </span>
                      )}
                      {(item as any).arrow && (
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 bg-[#071220] border-b border-white/10">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {['Penjualan', 'Order Online', 'Appointment'].map((tab) => {
              const key = tab.toLowerCase().replace(' ', '-');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                    activeTab === key
                      ? 'bg-[#0d8a6a] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Outlet selector */}
            <div className="flex items-center gap-1.5 bg-[#0d2137] border border-white/10 rounded px-3 py-1.5 text-xs cursor-pointer hover:bg-[#1a3050] transition-colors">
              <div className="w-2 h-2 rounded-full bg-[#0d8a6a]" />
              <span>Semua Outlet</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Notif icons */}
            <div className="flex items-center gap-2">
              {[
                'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
                'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              ].map((d, i) => (
                <button key={i} className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                  </svg>
                  {i === 0 && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Admin */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0d3b4a] border border-[#0d8a6a] flex items-center justify-center text-xs font-bold text-[#0d8a6a]">
                GG
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-white leading-none">Admin</p>
                <p className="text-[9px] text-gray-500 leading-none mt-0.5">Owner - CLECO GROUP</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0a1628]">
          {children}
        </div>
      </main>
    </div>
  );
}
