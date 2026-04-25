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
      <main className="p-4 max-w-md mx-auto pb-20">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 text-center border-2 border-yellow-200">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard</h1>
          <p className="text-gray-600">No leaderboard period active yet.</p>
        </div>
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

  const ranked = (entries ?? []).map((e, i) => {
    const profile = e.user_profiles as unknown as { display_name: string | null; email: string } | null;
    return {
      rank: i + 1,
      display_name: profile?.display_name ?? null,
      email: profile?.email ?? '',
      score: e.score,
    };
  });

  return (
    <main className="flex flex-col gap-6 p-4 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">Top recyclers this period</p>
      </div>

      <Leaderboard entries={ranked} periodLabel={period.period_label} currentUserId={user.id} />
    </main>
  );
}
