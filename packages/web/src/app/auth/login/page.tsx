import Link from 'next/link';
import LoginForm from '../../login/LoginForm';

const quickStats = [
  { label: 'Daily streak', value: '47 days' },
  { label: 'Current ramp', value: '140 -> 180 BPM' },
  { label: 'Last riff', value: 'Palm mute ladder' },
];

const benefits = ['Supabase-secured sessions', 'Syncs XP, logs, and streaks', 'Same account on web + mobile'];

export default function AuthLoginPage() {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-12 top-12 h-72 w-72 rounded-full bg-gradient-to-br from-amber-300/20 via-orange-500/10 to-amber-200/5 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-slate-700/30 via-slate-900/50 to-black/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1118] via-[#0c0d13] to-black p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,191,71,0.12),transparent_40%),radial-gradient(circle_at_70%_0%,rgba(255,255,255,0.04),transparent_45%)] opacity-80" />
          <div className="relative space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.26em] text-gray-400">Metal Master</p>
              <h1 className="font-display text-3xl sm:text-4xl">Log in</h1>
              <p className="text-sm text-gray-300">Pick up where your last session left off.</p>
            </div>

            <LoginForm />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-300">
              <div>
                Need an account?{' '}
                <Link href="/auth/signup" className="text-amber-200 hover:underline">
                  Sign up
                </Link>
              </div>
              <Link href="/auth/signup" className="inline-flex items-center gap-1 text-amber-200 hover:underline">
                Start free -&gt;
              </Link>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141721] via-[#0f1118] to-black p-8 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,191,71,0.12),transparent_40%)] opacity-80" />
          <div className="relative space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Session snapshot</p>
              <h2 className="font-display text-2xl">Stay synced, stay honest</h2>
              <p className="text-gray-300">
                Your Supabase-authenticated session carries streaks, XP, and practice history across every device.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickStats.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Why log in</p>
              <ul className="space-y-2 text-sm text-gray-200">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-300" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-50">
              Tip: stay logged in on this device to keep the practice console live and streak tracking automatic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
