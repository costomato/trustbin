import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import TrustScoreBar from '@/components/TrustScoreBar';
import ImpactCard from '@/components/ImpactCard';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('user_profiles')
    .select('trust_score, impact_score, streak_weeks, current_week_correct, flag_active, display_name')
    .eq('id', user.id)
    .single();

  const trustScore = profile?.trust_score ?? 0;
  const impactScore = Number(profile?.impact_score ?? 0);

  return (
    <main className="flex flex-col gap-5 p-4 max-w-md mx-auto">
      <div>
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.display_name ?? user.email?.split('@')[0] ?? 'Recycler'}
        </h1>
      </div>

      {profile?.flag_active && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800">
          ⚠️ Your account is under review. Scoring is paused.
        </div>
      )}

      <TrustScoreBar score={trustScore} />

      <Link
        href="/scan"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-center py-4 rounded-2xl text-lg transition-colors"
      >
        📷 Scan an Item
      </Link>

      <ImpactCard impactScore={impactScore} />
    </main>
  );
}
