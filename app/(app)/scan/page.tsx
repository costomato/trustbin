import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ScanFlow from '@/components/ScanFlow';

export const dynamic = 'force-dynamic';

export default async function ScanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let trustScore = 0;

  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('user_profiles')
      .select('trust_score')
      .eq('id', user.id)
      .single();

    trustScore = profile?.trust_score ?? 0;
  }

  return (
    <main className="flex flex-col items-center gap-6 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold self-start">Scan</h1>
      <ScanFlow trustScore={trustScore} />
    </main>
  );
}
