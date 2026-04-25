'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import VirtualTrashcan from '@/components/VirtualTrashcan';
import type { DisposalItem } from '@/lib/trashcan';

interface VirtualTrashcanClientProps {
  initialItems: DisposalItem[];
  userId: string;
}

export default function VirtualTrashcanClient({ initialItems, userId }: VirtualTrashcanClientProps) {
  const [items, setItems] = useState<DisposalItem[]>(initialItems);

  useEffect(() => {
    const supabase = createClient();

    // Realtime subscription — updates trashcan on new disposal events (Req 7.7)
    const channel = supabase
      .channel('disposal_events_realtime')
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

  return <VirtualTrashcan items={items} />;
}
