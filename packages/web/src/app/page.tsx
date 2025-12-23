import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import {
  AchievementsIcon,
  DailyIcon,
  HistoryIcon,
  JamIcon,
  LearnIcon,
  LeaderboardIcon,
  LoginIcon,
  PricingIcon,
  ProfileIcon,
  SignupIcon,
  SpeedIcon,
  StatsIcon,
  TabIcon,
} from '../components/icons';

const pillars = [
  {
    title: 'Precision Engine',
    description: 'Tempo ramps, subdivision honesty, and instant loop recall built for downpick discipline.',
    metric: 'Ramp 140 -> 180 BPM',
    Icon: SpeedIcon,
  },
  {
    title: 'Sound + Feel',
    description: 'Jam decks with gain-stacked backings so your phrasing and pocket get tested, not hidden.',
    metric: 'Live tone notes',
    Icon: JamIcon,
  },
  {
    title: 'Proof of Work',
    description: 'Practice history, streaks, and XP that highlight what actually moved the needle.',
    metric: 'Daily streaks + logs',
    Icon: HistoryIcon,
  },
];

const featureLanes = [
  {
    href: '/learn',
    title: 'Guided Path',
    description: 'Technique ladders and fretboard control, sequenced for metal picking systems.',
    chip: 'Core track',
    Icon: LearnIcon,
  },
  {
    href: '/leaderboard',
    title: 'Leaderboard',
    description: 'Weekly XP race with streak multipliers and tone cred from the community.',
    chip: 'Competition',
    Icon: LeaderboardIcon,
  },
  {
    href: '/daily-riff',
    title: 'Daily Riff',
    description: 'A fresh challenge every day; keep the streak alive and export wins to stats.',
    chip: 'Streak',
    Icon: DailyIcon,
  },
  {
    href: '/jam',
    title: 'Jam Deck',
    description: 'Mix-ready backings to test pocket, groove, and your tone stack.',
    chip: 'Play',
    Icon: JamIcon,
  },
];

const tools = [
  {
    href: '/tab-player',
    title: 'Tab Lab',
    description: 'Fullscreen AlphaTab with loop, speed, and track isolation for surgical reps.',
    badge: 'New',
    Icon: TabIcon,
  },
  {
    href: '/leaderboard',
    title: 'Leaderboard',
    description: 'Climb weekly XP, streak, and tone ladders to see where you stand.',
    badge: 'New',
    Icon: LeaderboardIcon,
  },
  {
    href: '/stats',
    title: 'Progress Pulse',
    description: 'Heatmaps, XP, and trendlines so you see proof, not vibes.',
    badge: 'Stats',
    Icon: StatsIcon,
  },
  {
    href: '/practice-history',
    title: 'Practice History',
    description: 'Session receipts and filterable logs to know where time actually went.',
    badge: 'Logs',
    Icon: HistoryIcon,
  },
  {
    href: '/achievements',
    title: 'Achievements',
    description: 'Badges for streaks, tempo walls, and clean takes that stay verified.',
    badge: 'Badges',
    Icon: AchievementsIcon,
  },
  {
    href: '/pricing',
    title: 'Pricing',
    description: 'Stay on Free or unlock PRO vault, backings, and export options.',
    badge: 'Plans',
    Icon: PricingIcon,
  },
];

const testimonials = [
  {
    name: 'Avery M.',
    role: 'Touring rhythm guitarist',
    quote: '160->188 BPM downpicks without blowing up my wrist. The ramps force honesty.',
    tag: 'Tempo truth',
  },
  {
    name: 'Sasha T.',
    role: 'Bedroom shredder',
    quote: 'The weekly board keeps me grinding; streak multipliers make the XP jump feel real.',
    tag: 'Leaderboard',
  },
  {
    name: 'Diego R.',
    role: 'Session player',
    quote: 'The logs + streaks keep me accountable. Stats show where I->m actually weak.',
    tag: 'Proof',
  },
];

const accountLinks = [
  {
    href: '/auth/signup',
    title: 'Join the Forge',
    description: 'Create your profile and start collecting XP.',
    Icon: SignupIcon,
  },
  {
    href: '/auth/login',
    title: 'Return to Session',
    description: 'Sign in to resume your current track.',
    Icon: LoginIcon,
  },
  {
    href: '/profile',
    title: 'Profile',
    description: 'Tune your handle, avatar, and synced practice data.',
    Icon: ProfileIcon,
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0b0c10] via-[#0f1117] to-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-metal-accent/25 via-orange-500/15 to-amber-400/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-gradient-to-br from-slate-500/15 via-slate-800/30 to-black blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-5 pb-16 pt-12 sm:px-8">
        <Hero />
        <Pillars />
        <FeatureLanes />
        <ToolsGrid />
        <Proof />
        <Account />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-200">
          Built for brutal consistency
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            Sharpen your right hand.
            <br />
            Prove every rep.
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl leading-relaxed">
            Metal Master is an industrial-grade practice bunker: guided tracks, speed ramps, tab lab, and logs that show you the truth about your tempo and feel.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CTA href="/learn" tone="primary">
            Start the core path
          </CTA>
          <CTA href="/pricing" tone="ghost">
            Compare Free vs PRO
          </CTA>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Daily streak" value="47 days" accent />
          <Metric label="Current ramp" value="140 -> 180 BPM" />
          <Metric label="Session tag" value="Downpick endurance" />
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
          {['Downpicks only', '16th-note triplets', 'Noise gate tight', 'Pick attack +6dB'].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1 text-amber-100"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12141c] via-[#0f1016] to-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,53,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.04),transparent_40%)]" />
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-400">Session console</p>
            <p className="text-lg font-semibold text-white">Live practice rig</p>
          </div>
          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-200">Live</span>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <ConsoleCard
            title="Leaderboard"
            value="Top 10 weekly climb"
            sub="Streak bonus + tone score weighting"
            Icon={LeaderboardIcon}
          />
          <ConsoleCard
            title="Tab Lab"
            value="Loop bar 17-24"
            sub="75% speed - tone: tight crunch"
            Icon={TabIcon}
          />
          <ConsoleCard
            title="Jam Deck"
            value="Key: Dm - 110 BPM"
            sub="Gain-stacked - record enabled"
            Icon={JamIcon}
          />
          <ConsoleCard
            title="Logs + XP"
            value="Auto-tagging on"
            sub="Exports to streaks and stats"
            Icon={HistoryIcon}
          />
        </div>
        <div className="border-t border-white/5 bg-white/5 px-6 py-4 text-sm text-gray-200">
          Session goal: 12 clean takes with consistent pick attack. Keep gate tight, no palm mute float.
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">System</p>
          <h2 className="font-display text-2xl sm:text-3xl">Three pillars for modern metal practice</h2>
        </div>
        <Link
          href="/practice-history"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100 transition hover:border-amber-400/70"
        >
          See logs
          <span className="text-amber-300">-&gt;</span>
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171921] via-[#11121a] to-black p-5 transition hover:-translate-y-1 hover:border-amber-300/60"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <div className="relative flex items-start gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-amber-200 shadow-inner shadow-black/40">
                <pillar.Icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl">{pillar.title}</h3>
                <p className="text-gray-200 leading-relaxed">{pillar.description}</p>
                <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                  {pillar.metric}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureLanes() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Tracks</p>
          <h2 className="font-display text-2xl sm:text-3xl">Pick your lane for today&apos;s work</h2>
        </div>
        <Link
          href="/leaderboard"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100 transition hover:border-amber-400/70"
        >
          View leaderboard
          <span className="text-amber-300">-&gt;</span>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {featureLanes.map((lane) => (
          <Link
            key={lane.title}
            href={lane.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#14161e] via-[#0d0f15] to-black p-5 transition hover:-translate-y-1 hover:border-amber-300/50"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_35%)] opacity-60" />
            <div className="relative flex items-start gap-4">
              <div className="rounded-xl bg-white/5 p-3 text-amber-200 shadow-inner shadow-black/40">
                <lane.Icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-full bg-amber-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                    {lane.chip}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400 group-hover:text-amber-200 transition">
                    Practice-ready
                  </span>
                </div>
                <h3 className="font-display text-xl">{lane.title}</h3>
                <p className="text-gray-200 leading-relaxed">{lane.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition group-hover:translate-x-1">
                  Enter session
                  <span aria-hidden>-&gt;</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ToolsGrid() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Tools</p>
          <h2 className="font-display text-2xl sm:text-3xl">Everything that keeps you dialed in</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#13141b] via-[#0f1117] to-black p-5 transition hover:-translate-y-1 hover:border-amber-300/50"
          >
            <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-transparent opacity-60" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white/5 p-3 text-amber-200 shadow-inner shadow-black/40">
                  <tool.Icon className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-amber-200/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                  {tool.badge}
                </span>
              </div>
              <h3 className="font-display text-lg">{tool.title}</h3>
              <p className="text-gray-200 flex-1 leading-relaxed">{tool.description}</p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition group-hover:translate-x-1">
                Open tool
                <span aria-hidden>-&gt;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Proof</p>
          <h2 className="font-display text-2xl sm:text-3xl">Players using Metal Master in the wild</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300">
          4.8 / 5
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161821] via-[#10121a] to-black p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,53,0.08),transparent_40%)] opacity-70" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{item.role}</p>
                </div>
                <span className="rounded-full bg-amber-200/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                  {item.tag}
                </span>
              </div>
              <p className="text-gray-100 leading-relaxed">{item.quote}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                <span>5 / 5</span>
                <span className="text-gray-400 text-xs font-normal">Player score</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Account() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-center">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Get set up</p>
        <h2 className="font-display text-2xl sm:text-3xl">Dial in your account and keep the momentum</h2>
        <p className="text-gray-200 max-w-2xl">
          Create your profile, log a session, and keep the streak alive. Your Supabase-authenticated session syncs XP, history, and stats across devices.
        </p>
        <div className="flex flex-wrap gap-3">
          <CTA href="/auth/signup" tone="primary">
            Create account
          </CTA>
          <CTA href="/auth/login" tone="ghost">
            I already have one
          </CTA>
        </div>
      </div>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#14151d] via-[#0f1017] to-black p-5">
        {accountLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 transition hover:border-amber-300/50"
          >
            <div className="rounded-lg bg-white/5 p-2 text-amber-200 shadow-inner shadow-black/40">
              <item.Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold group-hover:text-amber-200 transition">{item.title}</span>
              <span className="text-sm text-gray-300">{item.description}</span>
            </div>
            <span className="ml-auto text-amber-200 opacity-0 transition group-hover:opacity-100">-&gt;</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CTA({ href, tone = 'primary', children }: { href: string; tone?: 'primary' | 'ghost'; children: ReactNode }) {
  const isPrimary = tone === 'primary';
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
        isPrimary
          ? 'bg-amber-300 text-black shadow-[0_14px_45px_rgba(255,191,71,0.35)] hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(255,191,71,0.45)]'
          : 'border border-white/15 bg-white/5 text-gray-100 hover:border-amber-300/70 hover:bg-white/10'
      }`}
    >
      {children}
      <span className={isPrimary ? 'text-black/70' : 'text-amber-200'}>-&gt;</span>
    </Link>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-white/10 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ${
        accent ? 'bg-gradient-to-br from-amber-300/15 via-amber-300/10 to-amber-200/5' : 'bg-white/5'
      }`}
    >
      <p className="text-gray-400 text-xs uppercase tracking-[0.22em]">{label}</p>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ConsoleCard({
  title,
  value,
  sub,
  Icon,
}: {
  title: string;
  value: string;
  sub: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-4 transition hover:border-amber-300/50">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,191,71,0.08),transparent)] opacity-70" />
      <div className="relative flex items-start gap-3">
        <div className="rounded-lg bg-black/40 p-2 text-amber-200 shadow-inner shadow-black/50">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{title}</p>
          <p className="text-base font-semibold text-white">{value}</p>
          <p className="text-sm text-gray-300">{sub}</p>
        </div>
      </div>
    </div>
  );
}
