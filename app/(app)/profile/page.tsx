import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import TrustScoreBar from '@/components/TrustScoreBar';
import StreakDisplay from '@/components/StreakDisplay';
import ImpactCard from '@/components/ImpactCard';

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

  return (
    <main className="flex flex-col gap-5 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Account under review notice (Req 10.5) */}
      {profile.flag_active && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
          ⚠️ Your account is currently under review. Scoring is paused until an admin resolves the flag.
        </div>
      )}

      {/* Trust score */}
      <section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Trust Score</h2>
        <TrustScoreBar score={profile.trust_score} />
      </section>

      {/* Streak */}
      <StreakDisplay
        streakWeeks={profile.streak_weeks}
        currentWeekCorrect={profile.current_week_correct}
      />

      {/* Impact */}
      <ImpactCard impactScore={Number(profile.impact_score)} />

      {/* Disposal history summary (Req 13.3) */}
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
    </main>
  );
}
