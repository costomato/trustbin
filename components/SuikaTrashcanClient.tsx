'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SuikaTrashcan from '@/components/SuikaTrashcan';
import type { DisposalItem } from '@/lib/trashcan';

interface SuikaTrashcanClientProps {
  initialItems: DisposalItem[];
  userId: string;
}

export default function SuikaTrashcanClient({ initialItems, userId }: SuikaTrashcanClientProps) {
  const [items, setItems] = useState<DisposalItem[]>(initialItems);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('disposal_events_suika')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'disposal_events',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newItem = payload.new as DisposalItem;
          setItems((prev) => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return <SuikaTrashcan items={items} />;
}
