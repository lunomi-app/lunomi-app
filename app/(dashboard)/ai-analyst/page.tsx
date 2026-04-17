'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import AIChatPanel from '@/app/(dashboard)/keuangan/components/AIChatPanel';

export default function AIAnalystPage() {
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('business_users')
        .select('business_id')
        .eq('user_id', user.id)
        .single();

      if (data) setBusinessId(data.business_id);
    };
    load();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-10rem)]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">AI Analyst</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tanya AI tentang kondisi keuangan bisnis Anda
        </p>
      </div>

      {businessId ? (
        <AIChatPanel businessId={businessId} />
      ) : (
        <p className="text-slate-500 text-sm">Memuat data bisnis...</p>
      )}
    </div>
  );
}
