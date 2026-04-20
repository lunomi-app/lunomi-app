'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export type Role = 'admin' | 'kasir' | 'dapur' | 'karyawan';

export function useRole() {
  const [role, setRole] = useState<Role>('admin');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setRole((meta?.role as Role) || 'admin');
      setUserName(meta?.name || data.user?.email?.split('@')[0] || 'Admin');
      setLoading(false);
    });
  }, []);

  return { role, loading, userName };
}
