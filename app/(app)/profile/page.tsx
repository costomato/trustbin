export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import TrustScoreBar from '@/components/TrustScoreBar';
import StreakDisplay from '@/components/StreakDisplay';
import ImpactCard from '@/components/ImpactCard';
import ShareProfileButton from '@/components/ShareProfileButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  // Disposal history summary
  const { count: totalDisposals } = await admin
    .from('disposal_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: correctDisposals } = await admin
    .from('disposal_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_correct', true);

  // Leaderboard score and rank
  const { data: period } = await admin
    .from('leaderboard_periods')
    .select('id')
    .order('starts_at', { ascending: false })
    .limit(1)
    .single();

  let leaderboardScore = profile.leaderboard_score ?? 0;
  let leaderboardRank: number | null = null;

  if (period) {
    // Get all qualified entries sorted by score to compute rank
    const { data: entries } = await admin
      .from('leaderboard_entries')
      .select('user_id, score')
      .eq('period_id', period.id)
      .eq('qualified', true)
      .order('score', { ascending: false });

    if (entries) {
      const idx = entries.findIndex((e) => e.user_id === user.id);
      if (idx >= 0) {
        leaderboardRank = idx + 1;
        leaderboardScore = entries[idx].score;
      }
    }
  }

  const displayName = profile.display_name ?? user.email?.split('@')[0] ?? 'Recycler';

  return (
    <main className="flex flex-col gap-5 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Profile</h1>

      {profile.flag_active && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
          ⚠️ Your account is currently under review. Scoring is paused until an admin resolves the flag.
        </div>
      )}

      {/* Leaderboard score and rank */}
      <section className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-indigo-500 mb-2 uppercase tracking-wide">Leaderboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-3xl font-bold text-indigo-700">{leaderboardScore} <span className="text-base font-normal text-indigo-400">pts</span></p>
          </div>
          {leaderboardRank && (
            <div className="text-center px-4 py-2 bg-indigo-100 rounded-xl">
              <p className="text-2xl font-bold text-indigo-600">#{leaderboardRank}</p>
              <p className="text-xs text-indigo-400">Rank</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust score */}
      <section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Trust Score</h2>
        <TrustScoreBar score={profile.trust_score} />
      </section>

      <StreakDisplay
        streakDays={profile.streak_weeks}
        todayCorrect={profile.current_week_correct}
      />

      <ImpactCard impactScore={Number(profile.impact_score)} />

      {/* Disposal history */}
      <section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Disposal History</h2>
        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-gray-800">{totalDisposals ?? 0}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-green-600">{correctDisposals ?? 0}</p>
            <p className="text-xs text-gray-400">Correct</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {totalDisposals ? Math.round(((correctDisposals ?? 0) / totalDisposals) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
        </div>
      </section>

      {/* Share button */}
      <ShareProfileButton
        displayName={displayName}
        leaderboardScore={leaderboardScore}
        leaderboardRank={leaderboardRank}
        streakDays={profile.streak_weeks}
        impactScore={Number(profile.impact_score)}
      />
    </main>
  );
}
