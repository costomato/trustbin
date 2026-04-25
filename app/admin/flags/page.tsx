export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export default async function AdminFlagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/dashboard');

  const { data: flags } = await admin
    .from('flags')
    .select('id, reason, created_at, status, disposal_event_id, user_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending Flags</h1>
      {!flags || flags.length === 0 ? (
        <p className="text-gray-400">No pending flags.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {flags.map((flag) => (
            <li key={flag.id} className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Flag ID: {flag.id}</p>
              <p className="text-sm text-gray-500 mb-1">Disposal Event: {flag.disposal_event_id}</p>
              <p className="text-sm text-gray-700 mb-1">Reason: {flag.reason ?? '(no reason given)'}</p>
              <p className="text-xs text-gray-400">{new Date(flag.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
