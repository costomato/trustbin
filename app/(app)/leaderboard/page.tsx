import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Leaderboard from '@/components/Leaderboard';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Get current leaderboard period (most recent)
  const { data: period } = await admin
    .from('leaderboard_periods')
    .select('*')
    .order('starts_at', { ascending: false })
    .limit(1)
    .single();

  if (!period) {
    return (
      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        <p className="text-gray-400 text-sm text-center">No leaderboard period active yet.</p>
      </main>
    );
  }

  // Fetch qualified entries for this period, joined with user profiles
  const { data: entries } = await admin
    .from('leaderboard_entries')
    .select('score, user_id, user_profiles(display_name, email)')
    .eq('period_id', period.id)
    .eq('qualified', true)
    .order('score', { ascending: false });

  const ranked = (entries ?? []).map((e, i) => ({
    rank: i + 1,
    display_name: (e.user_profiles as { display_name: string | null; email: string } | null)?.display_name ?? null,
    email: (e.user_profiles as { display_name: string | null; email: string } | null)?.email ?? '',
    score: e.score,
  }));

  return (
    <main className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <Leaderboard entries={ranked} periodLabel={period.period_label} currentUserId={user.id} />
    </main>
  );
}
