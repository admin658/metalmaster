import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import {
  LearnIcon,
  RiffsIcon,
  JamIcon,
  SpeedIcon,
  DailyIcon,
  AchievementsIcon,
  HistoryIcon,
  StatsIcon,
  ProfileIcon,
  LoginIcon,
  SignupIcon,
  TabIcon,
  PricingIcon,
} from '../components/icons';
import SplashVideo from '../components/SplashVideo';

const whatsNew = [
  {
    title: 'Tab player colors fixed',
    description:
      'Finally squashed the color issue so the AlphaTab UI is readable and consistent across sessions.',
    tag: 'Fix',
    date: 'Dec 2025',
    href: '/tab-player',
  },
  {
    title: 'API functions updated',
    description:
      'Refreshed our API helpers for cleaner data flow and more reliable feature wiring.',
    tag: 'Update',
    date: 'Dec 2025',
    href: '/tab-player',
  },
  {
    title: 'Coming soon: videos',
    description:
      'Lesson videos are in the pipeline to make technique demos and guided practice way easier.',
    tag: 'Coming soon',
    date: 'Soon',
    href: '/learn',
  },
];

const reviews = [
  {
    name: 'Avery M.',
    role: 'Touring rhythm guitarist',
    quote: 'Hit 180 BPM downpicking without blowing up my right hand. The speed trainer made me honest.',
    highlight: 'Stamina +40 BPM',
    tone: 'from-metal-accent/20 via-orange-500/10 to-black/60',
  },
  {
    name: 'Sasha T.',
    role: 'Bedroom shredder',
    quote: 'The riffs tab vault is wild. Loop + slow-down + tone tips = instant practice flow.',
    highlight: 'Cleaned sweep runs',
    tone: 'from-indigo-600/25 via-purple-700/15 to-black/60',
  },
  {
    name: 'Diego R.',
    role: 'Session player',
    quote: 'Love the daily riffs—tight phrases that actually translate on gigs. Stats keep me accountable.',
    highlight: 'Streak 47 days',
    tone: 'from-teal-500/25 via-emerald-500/15 to-black/60',
  },
];

const coreFeatures = [
  {
    href: '/learn',
    title: 'Guided Path',
    description: 'Technique ladders, theory, and fretboard control built for metal.',
    tag: 'Core',
    tone: 'from-metal-accent/70 via-orange-500/30 to-amber-400/30',
    Icon: LearnIcon,
  },
  {
    href: '/riffs',
    title: 'Riff Library',
    description: 'Tight, heavy phrases you can loop, slow down, and master.',
    tag: 'Library',
    tone: 'from-gray-500/30 via-gray-700/40 to-slate-900/60',
    Icon: RiffsIcon,
  },
  {
    href: '/jam',
    title: 'Jam Deck',
    description: 'Backings that hit hard so you can practice phrasing and tone.',
    tag: 'Play',
    tone: 'from-indigo-600/50 via-purple-700/40 to-black/50',
    Icon: JamIcon,
  },
  {
    href: '/daily-riff',
    title: 'Daily Riff',
    description: 'A fresh challenge every day to keep your streak alive.',
    tag: 'Daily',
    tone: 'from-rose-600/60 via-red-600/40 to-black/60',
    Icon: DailyIcon,
  },
];

const tools = [
  {
    href: '/tab-player',
    title: 'Tab Lab',
    description: 'AlphaTab playback with loop, speed, and track isolation.',
    badge: 'New',
    badgeTone: 'bg-red-500 text-white',
    Icon: TabIcon,
  },
  {
    href: '/speed-trainer',
    title: 'Speed Trainer',
    description: 'Tempo ramps, subdivisions, and session logging.',
    badge: 'Tempo',
    badgeTone: 'bg-yellow-400 text-black',
    Icon: SpeedIcon,
  },
  {
    href: '/practice-history',
    title: 'Practice History',
    description: 'See exactly where you spent time and how it moved the needle.',
    badge: 'Logs',
    badgeTone: 'bg-gray-700 text-gray-100',
    Icon: HistoryIcon,
  },
  {
    href: '/stats',
    title: 'Progress Pulse',
    description: 'Heatmaps and scores that spotlight what to tighten up next.',
    badge: 'Stats',
    badgeTone: 'bg-teal-500 text-black',
    Icon: StatsIcon,
  },
  {
    href: '/achievements',
    title: 'Achievements',
    description: 'Badges for streaks, tempo walls, and clean takes.',
    badge: 'Badges',
    badgeTone: 'bg-amber-400 text-black',
    Icon: AchievementsIcon,
  },
  {
    href: '/pricing',
    title: 'Pricing',
    description: 'Choose Free or go PRO for unlimited riff vault and backing tracks.',
    badge: 'Plans',
    badgeTone: 'bg-fuchsia-600 text-white',
    Icon: PricingIcon,
  },
  {
    href: '/profile',
    title: 'Profile',
    description: 'Dial in your handle, avatar, and synced practice data.',
    badge: 'User',
    badgeTone: 'bg-gray-700 text-gray-100',
    Icon: ProfileIcon,
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
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <SplashVideo src="/splash.mp4" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl animate-pulse-glow" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-800/30 via-slate-800/60 to-black/60 blur-3xl animate-pulse-glow delay-150" />
        <div className="absolute inset-x-0 top-28 mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-fade-slide" />
        <div className="absolute inset-x-0 top-6 h-64 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)] opacity-70" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-pan-lines absolute inset-x-0 top-0 h-[140%] rotate-2 bg-[linear-gradient(120deg,rgba(255,107,53,0.12)_8%,transparent_18%,rgba(143,148,255,0.08)_28%,transparent_40%)] blur-sm" />
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">What&apos;s New</p>
            <h2 className="font-display text-xl sm:text-2xl text-white">Fresh drops you can try now</h2>
          </div>
          <Link
            href="/updates"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-metal-accent transition hover:border-metal-accent/50"
          >
            View all updates
          </Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1">
          {whatsNew.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative min-w-[240px] sm:min-w-[260px] lg:min-w-[280px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-4 transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-metal-accent/10 via-transparent to-purple-700/10 opacity-70" />
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-200">
                    {item.tag}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{item.date}</span>
                </div>
                <h3 className="font-display text-lg text-white">{item.title}</h3>
                <p className="text-gray-200 leading-relaxed text-sm flex-1">{item.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent transition group-hover:translate-x-1">
                  View update
                  <span aria-hidden>-&gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-2 pb-10">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Player feedback</p>
            <h2 className="font-display text-xl sm:text-2xl text-white">Loved by metal players everywhere</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300">
            4.8 / 5
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-black/70 to-gray-900/70 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, idx) => (
              <div
                key={`${review.name}-${idx}`}
                className={`relative w-full rounded-2xl border border-white/10 bg-gradient-to-br ${review.tone} p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-60" />
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{review.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-300">{review.role}</p>
                    </div>
                    <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-metal-accent border border-white/10 whitespace-nowrap">
                      {review.highlight}
                    </span>
                  </div>
                  <p className="text-gray-100 leading-relaxed text-sm">{review.quote}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                    <span>5/5</span>
                    <span className="text-gray-300 text-xs font-normal">Player score</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-6 pb-16 md:pt-10">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-gray-200">
              Precision-first metal practice
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_10px_25px_rgba(255,107,53,0.3)]">
                Command your tone.
                <br />
                Level up the riffs that matter.
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                Metal Master is the practice bunker for modern players - guided lessons, riff vaults, and jam decks with tools that keep you honest and fast.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="group inline-flex items-center gap-2 rounded-full bg-metal-accent px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,107,53,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,53,0.65)]"
              >
                Start with the core path
                <span className="text-black/70 transition group-hover:translate-x-1">-&gt;</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:text-white hover:bg-white/10"
              >
                Compare Free vs PRO
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] animate-float-slow">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Daily streak</p>
                <p className="text-xl font-semibold text-white">Locked in</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] animate-float-slower delay-150">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Speed focus</p>
                <p className="text-xl font-semibold text-white">Alternate + Gallops</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] animate-float-slow delay-300">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Tone vibe</p>
                <p className="text-xl font-semibold text-white">Modern crunch</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-metal-accent">
              {['Downpicks only', '16th-note triplets', 'Noise gate tight', 'Pick attack +6dB'].map((chip) => (
                <span
                  key={chip}
                  className="animate-pill shimmer relative overflow-hidden rounded-full border border-metal-accent/50 bg-metal-accent/10 px-3 py-1 text-[11px] text-metal-accent shadow-[0_0_25px_rgba(255,107,53,0.25)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-metal-accent/30 via-purple-700/30 to-black/80 blur-2xl animate-pulse-glow" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 shadow-2xl">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-6 rounded-3xl border border-white/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,53,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(120,119,255,0.22),transparent_40%)] opacity-80" />
                <div className="animate-grid-shimmer absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
              </div>
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-metal-accent/20 text-metal-accent flex items-center justify-center">
                    <span className="font-display text-lg">MM</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-xs uppercase tracking-wide">Session Monitor</p>
                    <p className="text-lg font-semibold text-white">Active Practice Run</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                <SessionTile
                  title="Learn"
                  description="Palm-mute control + down-pick stamina"
                  href="/learn"
                  tone="bg-gradient-to-br from-metal-accent/25 via-orange-500/20 to-black/50"
                  Icon={LearnIcon}
                />
                <SessionTile
                  title="Riffs"
                  description="Loop and slow-down with tight sync"
                  href="/riffs"
                  tone="bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-black"
                  Icon={RiffsIcon}
                />
                <SessionTile
                  title="Jam Deck"
                  description="Select tempo and key, then hit record"
                  href="/jam"
                  tone="bg-gradient-to-br from-indigo-700/50 via-purple-800/40 to-black/60"
                  Icon={JamIcon}
                />
                <SessionTile
                  title="Speed"
                  description="Ramp 140 to 180 BPM over 6 rounds"
                  href="/speed-trainer"
                  tone="bg-gradient-to-br from-yellow-500/25 via-amber-500/15 to-black/60"
                  Icon={SpeedIcon}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Core tracks</p>
            <h2 className="font-display text-2xl sm:text-3xl text-white">Pick the lane you want to tighten up today</h2>
          </div>
          <Link
            href="/practice-history"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:bg-white/10"
          >
            View logbook
            <span className="text-metal-accent">-&gt;</span>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {coreFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className={`absolute inset-0 opacity-70 blur-2xl bg-gradient-to-br ${feature.tone}`} />
              <div className="relative flex items-start gap-4">
                <div className="rounded-xl bg-white/5 p-3 text-metal-accent shadow-inner shadow-black/40">
                  <feature.Icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200">
                      {feature.tag}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.24em] text-gray-400 group-hover:text-metal-accent transition">
                      Practice-ready
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-white">{feature.title}</h3>
                  <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent transition group-hover:translate-x-1">
                    Enter session
                    <span aria-hidden>-&gt;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Tools and profile</p>
            <h2 className="font-display text-2xl sm:text-3xl text-white">Everything else that keeps you dialed in</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-white/0 opacity-60" />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-white/5 p-3 text-metal-accent shadow-inner shadow-black/40">
                    <tool.Icon className="h-7 w-7" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tool.badgeTone}`}>{tool.badge}</span>
                </div>
                <h3 className="font-display text-lg text-white">{tool.title}</h3>
                <p className="text-gray-200 flex-1 leading-relaxed">{tool.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent transition group-hover:translate-x-1">
                  Open tool
                  <span aria-hidden>-&gt;</span>
                </div>
              </div>
            </Link>
          ))}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400 mb-3">Account</p>
            <div className="grid gap-3">
              {accountLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-metal-accent/50"
                >
                  <div className="rounded-lg bg-white/5 p-2 text-metal-accent shadow-inner shadow-black/40">
                    <item.Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white group-hover:text-metal-accent transition">{item.title}</span>
                    <span className="text-sm text-gray-300">{item.description}</span>
                  </div>
                  <span className="ml-auto text-metal-accent opacity-0 transition group-hover:opacity-100">-&gt;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type SessionTileProps = {
  title: string;
  description: string;
  href: string;
  tone: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function SessionTile({ title, description, href, tone, Icon }: SessionTileProps) {
  return (
    <Link
      href={href}
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/5 p-4 text-left transition hover:-translate-y-1 hover:border-metal-accent/60 ${tone}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-50" />
      <div className="relative flex items-center gap-3">
        <div className="rounded-lg bg-black/40 p-2 text-metal-accent shadow-inner shadow-black/50">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg text-white">{title}</h3>
      </div>
      <p className="relative mt-3 text-sm text-gray-100 leading-snug">{description}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-metal-accent transition group-hover:translate-x-1">
        Launch
        <span aria-hidden>-&gt;</span>
      </span>
    </Link>
  );
}
