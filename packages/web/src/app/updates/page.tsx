import Link from 'next/link';

const previousUpdates = [
  {
    title: 'Tab Lab: lesson demos + WebMIDI',
    description:
      'AlphaTab player now ships with built-in lesson demos, WebMIDI output, and a bright green UI tuned for readability.',
    tag: 'Feature',
    date: 'Dec 2025',
    href: '/tab-player',
  },
  {
    title: '7 new GP5 lessons',
    description:
      'Palm-muting, power chords, gallops, alternate picking, and fast downpicking drills now available as bundled GP5 files.',
    tag: 'Lessons',
    date: 'Dec 2025',
    href: '/learn',
  },
  {
    title: 'AlphaTab docs map',
    description:
      'Quick links to installation, API, settings, AlphaTex, and guides to speed up tab-player changes.',
    tag: 'Docs',
    date: 'Dec 2025',
    href: '/tab-player',
  },
  {
    title: 'Session coach accuracy meter',
    description:
      'Live hit tracking and accuracy scoring to keep practice honest and measurable.',
    tag: 'Coach',
    date: 'Nov 2025',
    href: '/tab-player',
  },
  {
    title: 'Practice history timelines',
    description:
      'Daily and weekly charts to show streaks, tempo gains, and time spent per track.',
    tag: 'Stats',
    date: 'Oct 2025',
    href: '/practice-history',
  },
  {
    title: 'Tone presets refresh',
    description:
      'Updated gain stacks, tighter noise gates, and punchier EQ curves for modern metal.',
    tag: 'Tone',
    date: 'Sep 2025',
    href: '/tab-player',
  },
  {
    title: 'AlphaTab loading optimizations',
    description:
      'Faster score parsing and reduced memory spikes on larger GP files.',
    tag: 'Perf',
    date: 'Aug 2025',
    href: '/tab-player',
  },
  {
    title: 'Profile XP badges',
    description:
      'New XP badge tiers with highlight colors to celebrate streaks and milestones.',
    tag: 'Profile',
    date: 'Jul 2025',
    href: '/profile',
  },
];

export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Previous updates</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white">Release archive</h1>
            <p className="text-gray-300 mt-2 max-w-2xl">
              Catch up on earlier drops, improvements, and feature rollouts across the Metal Master stack.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-metal-accent transition hover:border-metal-accent/50"
          >
            Back home
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {previousUpdates.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-60" />
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-200">
                    {item.tag}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{item.date}</span>
                </div>
                <h2 className="font-display text-lg text-white">{item.title}</h2>
                <p className="text-gray-200 leading-relaxed text-sm">{item.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent transition group-hover:translate-x-1">
                  View update
                  <span aria-hidden>-&gt;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
