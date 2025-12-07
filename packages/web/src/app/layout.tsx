import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';
import TopUserBadge from '@/components/TopUserBadge';

const navLinks = [
  { href: '/learn', label: 'Learn' },
  { href: '/riffs', label: 'Riffs' },
  { href: '/jam', label: 'Jam' },
  { href: '/tab-player', label: 'Tab Lab' },
  { href: '/daily-riff', label: 'Daily Riff' },
  { href: '/pricing', label: 'Pricing' },
];

export const metadata = {
  title: 'Metal Master',
  description: 'Learn metal guitar with lessons, riffs, and jam tracks',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-metal-900 text-gray-100 min-h-screen flex flex-col relative font-sans">
        <header className="bg-black/90 border-b border-gray-700 relative z-10 backdrop-blur-sm">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-display text-metal-accent">
              Metal Master
            </Link>
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
              <TopUserBadge />
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto no-scrollbar pr-1 md:pr-0">
                {navLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className="nav-pill nav-link-flame">
                    {label}
                  </Link>
                ))}
              </div>
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-metal-accent transition">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-semibold text-black bg-metal-accent hover:bg-amber-400 transition px-3 py-2 rounded-full shadow-[0_10px_30px_rgba(255,107,53,0.4)]"
              >
                Join
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full p-0 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
