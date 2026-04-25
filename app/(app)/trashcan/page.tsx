import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SuikaTrashcanClient from '@/components/SuikaTrashcanClient';

export const dynamic = 'force-dynamic';

export default async function TrashcanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: items } = await admin
    .from('disposal_events')
    .select('id, ai_classification, item_description, material_type, created_at, image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="flex flex-col items-center gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold self-start">My Trashcan</h1>
      <SuikaTrashcanClient initialItems={items ?? []} userId={user.id} />
    </main>
  );
}
