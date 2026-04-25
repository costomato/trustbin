import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import TrustScoreBar from '@/components/TrustScoreBar';
import ImpactCard from '@/components/ImpactCard';
import StreakDisplay from '@/components/StreakDisplay';

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
  const streakWeeks = profile?.streak_weeks ?? 0;
  const weeklyCorrect = profile?.current_week_correct ?? 0;

  return (
    <main className="flex flex-col gap-6 p-4 max-w-md mx-auto pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
        <p className="text-green-100 text-sm mb-1">Welcome back,</p>
        <h1 className="text-3xl font-bold mb-4">
          {profile?.display_name ?? user.email?.split('@')[0] ?? 'Recycler'}
        </h1>
        
        {profile?.flag_active && (
          <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ Your account is under review. Scoring is paused.
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{trustScore}</div>
            <div className="text-xs text-green-100">Trust Score</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{streakWeeks}</div>
            <div className="text-xs text-green-100">Week Streak</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{weeklyCorrect}</div>
            <div className="text-xs text-green-100">This Week</div>
          </div>
        </div>
      </div>

      {/* Main Action Button */}
      <Link
        href="/scan"
        className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-center py-6 rounded-2xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Scan an Item</span>
        </div>
      </Link>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/trashcan"
          className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl p-4 transition-all hover:shadow-md"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Bins</p>
              <p className="text-xs text-gray-500">View items</p>
            </div>
          </div>
        </Link>

        <Link
          href="/quiz"
          className="bg-white border-2 border-gray-200 hover:border-purple-400 rounded-2xl p-4 transition-all hover:shadow-md"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Take Quiz</p>
              <p className="text-xs text-gray-500">Test knowledge</p>
            </div>
          </div>
        </Link>

        <Link
          href="/leaderboard"
          className="bg-white border-2 border-gray-200 hover:border-yellow-400 rounded-2xl p-4 transition-all hover:shadow-md"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C11.5 2 11 2.19 10.59 2.59C10.2 3 10 3.5 10 4H14C14 3.5 13.81 3 13.41 2.59C13 2.19 12.5 2 12 2M18 4H17V3C17 2.45 16.55 2 16 2H8C7.45 2 7 2.45 7 3V4H6C4.89 4 4 4.89 4 6V8C4 10.21 5.79 12 8 12H8.54C9.25 13.19 10.45 14 12 14C13.55 14 14.75 13.19 15.46 12H16C18.21 12 20 10.21 20 8V6C20 4.89 19.11 4 18 4M8 10C6.9 10 6 9.11 6 8V6H7V9C7 9.34 7.04 9.67 7.09 10H8M16 10H16.91C16.96 9.67 17 9.34 17 9V6H18V8C18 9.11 17.11 10 16 10M12 22C11.45 22 11 21.55 11 21V16H13V21C13 21.55 12.55 22 12 22Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Leaderboard</p>
              <p className="text-xs text-gray-500">See rankings</p>
            </div>
          </div>
        </Link>

        <Link
          href="/profile"
          className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-4 transition-all hover:shadow-md"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Profile</p>
              <p className="text-xs text-gray-500">View stats</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Impact Card */}
      <ImpactCard impactScore={impactScore} />

      {/* Streak Display */}
      <StreakDisplay streakDays={streakWeeks * 7} todayCorrect={weeklyCorrect} />
    </main>
  );
}
