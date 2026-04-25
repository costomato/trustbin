import { createClient } from '@/lib/supabase/server';
import VirtualTrashcanClient from '@/components/VirtualTrashcanClient';

export default async function TrashcanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from('disposal_events')
    .select('id, ai_classification, item_description, material_type, created_at, image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="flex flex-col gap-4 p-4 max-w-lg mx-auto pb-20">
      <h1 className="text-2xl font-bold">Virtual Trashcan</h1>
      <p className="text-sm text-gray-600">View all your scanned items organized by disposal type</p>
      <VirtualTrashcanClient initialItems={items ?? []} userId={user.id} />
    </main>
  );
}
