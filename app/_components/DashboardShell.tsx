'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useRole, type Role } from '@/lib/hooks/useRole';

const ROLE_HOME: Record<Role, string> = {
  admin: '/dashboard',
  kasir: '/kasir',
  dapur: '/kitchen',
  karyawan: '/absensi',
};

const TABS: { label: string; href: string; roles: Role[] }[] = [
  { label: 'Penjualan', href: '/dashboard', roles: ['admin'] },
  { label: 'Order Online', href: '/dashboard/order-online', roles: ['admin'] },
  { label: 'Appointment', href: '/dashboard/appointment', roles: ['admin'] },
  { label: 'Keuangan', href: '/keuangan', roles: ['admin'] },
  { label: 'Karyawan', href: '/karyawan', roles: ['admin'] },
  { label: 'Pengaturan', href: '/pengaturan', roles: ['admin'] },
  { label: 'Analisis', href: '/ai-analyst', roles: ['admin'] },
  { label: 'Kasir', href: '/kasir', roles: ['kasir'] },
  { label: 'Kitchen', href: '/kitchen', roles: ['dapur'] },
  { label: 'Absensi', href: '/absensi', roles: ['karyawan'] },
];

type SItem = { label: string; href: string; badge?: string; arrow?: boolean; roles: Role[] };
type SGroup = { label: string; roles: Role[]; items: SItem[] };

const SIDEBAR: SGroup[] = [
  {
    label: 'ANALITIK', roles: ['admin'],
    items: [
      { label: 'Dashboard Penjualan', href: '/dashboard', roles: ['admin'] },
      { label: 'Analisa Laporan', href: '/laporan/analisa', badge: 'GRATIS', roles: ['admin'] },
      { label: 'Laporan Lengkap', href: '/laporan/lengkap', badge: 'GRATIS', roles: ['admin'] },
    ],
  },
  {
    label: 'OPERASIONAL', roles: ['admin', 'kasir', 'dapur'],
    items: [
      { label: 'Kasir', href: '/kasir', roles: ['admin', 'kasir'] },
      { label: 'Kitchen Display', href: '/kitchen', roles: ['admin', 'dapur'] },
    ],
  },
  {
    label: 'MANAJEMEN', roles: ['admin'],
    items: [
      { label: 'Produk', href: '/dashboard/menu', arrow: true, roles: ['admin'] },
      { label: 'Inventori', href: '/inventori', arrow: true, roles: ['admin'] },
      { label: 'Pelanggan', href: '/pelanggan', arrow: true, roles: ['admin'] },
      { label: 'Promosi', href: '/promosi', arrow: true, roles: ['admin'] },
      { label: 'Komisi', href: '/komisi', arrow: true, roles: ['admin'] },
      { label: 'Invoice', href: '/invoice', arrow: true, roles: ['admin'] },
      { label: 'Marketing', href: '/marketing', arrow: true, roles: ['admin'] },
    ],
  },
  {
    label: 'SDM', roles: ['admin', 'karyawan'],
    items: [
      { label: 'Absensi', href: '/absensi', roles: ['admin', 'karyawan'] },
      { label: 'Daftar Karyawan', href: '/karyawan', roles: ['admin'] },
    ],
  },
  {
    label: 'LAPORAN (SEMUA GRATIS)', roles: ['admin'],
    items: [
      { label: 'Laporan Penjualan', href: '/laporan/penjualan', roles: ['admin'] },
      { label: 'Laporan Dapur', href: '/laporan/dapur', roles: ['admin'] },
      { label: 'Laporan Produk', href: '/laporan/produk', roles: ['admin'] },
      { label: 'Laporan Jasa', href: '/laporan/jasa', roles: ['admin'] },
      { label: 'Laporan Promo & Loyalti', href: '/laporan/promo', roles: ['admin'] },
      { label: 'Laporan Pajak', href: '/laporan/pajak', roles: ['admin'] },
      { label: 'Laporan Kasir', href: '/laporan/kasir', roles: ['admin'] },
      { label: 'Laporan Deposit', href: '/laporan/deposit', roles: ['admin'] },
      { label: 'Laporan Pelanggan', href: '/laporan/pelanggan', roles: ['admin'] },
      { label: 'Laporan Karyawan', href: '/laporan/karyawan', roles: ['admin'] },
      { label: 'Laporan Persediaan', href: '/laporan/persediaan', roles: ['admin'] },
      { label: 'Laporan Pemasok', href: '/laporan/pemasok', roles: ['admin'] },
      { label: 'Export PDF/Excel', href: '/laporan/export', badge: 'GRATIS', roles: ['admin'] },
    ],
  },
  {
    label: 'PENGATURAN', roles: ['admin'],
    items: [{ label: 'Pengaturan', href: '/pengaturan', roles: ['admin'] }],
  },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { role, loading, userName } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || role === 'admin') return;
    const home = ROLE_HOME[role];
    if (pathname !== home) router.replace(home);
  }, [role, loading, pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const visibleTabs = TABS.filter(t => t.roles.includes(role));
  const visibleGroups = SIDEBAR
    .filter(g => g.roles.includes(role))
    .map(g => ({ ...g, items: g.items.filter(i => i.roles.includes(role)) }))
    .filter(g => g.items.length > 0);

  if (loading) {
    return (
      <div className="h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0d8a6a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a1628] flex overflow-hidden text-white font-sans">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-[#071220] border-r border-white/10 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#0d8a6a] flex items-center justify-center text-xs font-black">GG</div>
            <div>
              <p className="text-[10px] font-bold text-white leading-none">CLECO GROUP</p>
              <p className="text-[8px] text-gray-500 leading-none mt-0.5">INTELLIGENCE DASHBOARD</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {visibleGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-4 py-1.5 text-[9px] font-bold text-gray-500 tracking-widest uppercase">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                    isActive(item.href)
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
                    {item.arrow && (
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-6 h-6 rounded-full bg-[#0d3b4a] border border-[#0d8a6a] flex items-center justify-center text-[9px] font-bold text-[#0d8a6a]">
              {userName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white leading-none capitalize">{userName}</p>
              <p className="text-[9px] text-gray-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 bg-[#071220] border-b border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isActive(tab.href) ? 'bg-[#0d8a6a] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <div className="hidden md:flex items-center gap-1.5 bg-[#0d2137] border border-white/10 rounded px-2.5 py-1 text-xs cursor-pointer hover:bg-[#1a3050] transition-colors">
              <div className="w-2 h-2 rounded-full bg-[#0d8a6a]" />
              <span>Semua Outlet</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="relative w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0d3b4a] border border-[#0d8a6a] flex items-center justify-center text-xs font-bold text-[#0d8a6a]">
                {userName[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white leading-none capitalize">{userName}</p>
                <p className="text-[9px] text-gray-500 capitalize">{role} - CLECO GROUP</p>
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
