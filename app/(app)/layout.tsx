import Link from 'next/link';
import { logout } from '@/app/actions/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-green-600">
            🌱 Trustbin
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">{children}</div>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-around">
          <Link href="/dashboard"   className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">🏠</span>Home
          </Link>
          <Link href="/scan"        className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">📷</span>Scan
          </Link>
          <Link href="/trashcan"    className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">🗑️</span>Trashcan
          </Link>
          <Link href="/quiz"        className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">🧠</span>Quiz
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">🏆</span>Board
          </Link>
          <Link href="/profile"     className="flex flex-col items-center gap-0.5 text-xs text-gray-500 hover:text-green-600">
            <span className="text-xl">👤</span>Profile
          </Link>
        </div>
      </nav>
    </div>
  );
}
