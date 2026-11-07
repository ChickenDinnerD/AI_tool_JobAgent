'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/sources', label: 'Sources' },
  { href: '/profile', label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-900/70 p-5 md:block">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">PJI</div>
        <h1 className="mt-3 text-2xl font-semibold text-white">Job Intelligence</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-500">→</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">System status</p>
        <p className="mt-2 text-lg font-semibold text-emerald-300">Nominal</p>
        <p className="mt-2 text-sm text-slate-400">Source registry and collectors are staged for the next phase.</p>
      </div>
    </aside>
  );
}
