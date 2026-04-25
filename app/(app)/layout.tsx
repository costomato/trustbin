'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/scan', label: 'Scan', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { href: '/trashcan', label: 'Trashcan', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )},
    { href: '/quiz', label: 'Quiz', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { href: '/leaderboard', label: 'Leaderboard', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C11.5 2 11 2.19 10.59 2.59C10.2 3 10 3.5 10 4H14C14 3.5 13.81 3 13.41 2.59C13 2.19 12.5 2 12 2M18 4H17V3C17 2.45 16.55 2 16 2H8C7.45 2 7 2.45 7 3V4H6C4.89 4 4 4.89 4 6V8C4 10.21 5.79 12 8 12H8.54C9.25 13.19 10.45 14 12 14C13.55 14 14.75 13.19 15.46 12H16C18.21 12 20 10.21 20 8V6C20 4.89 19.11 4 18 4M8 10C6.9 10 6 9.11 6 8V6H7V9C7 9.34 7.04 9.67 7.09 10H8M16 10H16.91C16.96 9.67 17 9.34 17 9V6H18V8C18 9.11 17.11 10 16 10M12 22C11.45 22 11 21.55 11 21V16H13V21C13 21.55 12.55 22 12 22Z" />
      </svg>
    )},
    { href: '/profile', label: 'Profile', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

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
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link 
                key={href}
                href={href} 
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive 
                    ? 'text-green-600 font-semibold' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <div className={isActive ? 'scale-110' : ''}>
                  {icon}
                </div>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
