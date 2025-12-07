'use client';

import { useLessons } from '@/hooks/useMetalMasterHooks';

export default function LearnPage() {
  const { lessons, loading } = useLessons();
  const featured = lessons?.[0];

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Guided path</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Learn</h1>
          <p className="text-gray-200 max-w-xl mt-2">
            Tighten your technique with focused lessons designed for metal players.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100">
          New drops weekly
        </span>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-5 shadow-2xl">
          <div className="absolute inset-0 blur-3xl opacity-60 bg-gradient-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
          <div className="relative space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-300">Featured lesson</p>
            <h2 className="font-display text-2xl text-white">
              {featured?.title ?? 'Modern palm-mute precision'}
            </h2>
            <p className="text-gray-200 text-sm max-w-xl">
              {featured?.description ?? 'Nail consistent attack and endurance with tight down-picking drills.'}
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              {featured?.videoUrl ? (
                <video width="100%" height="auto" controls className="block">
                  <source src={featured.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <video width="100%" height="auto" controls className="block">
                  <source src="/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-5 shadow-xl">
          <h3 className="font-display text-lg text-white mb-3">Focus stack</h3>
          <ul className="space-y-3 text-sm text-gray-200">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-metal-accent" />
              Alternate picking grids
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-metal-accent" />
              Gallops at ascending tempos
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-metal-accent" />
              Left-hand muting control
            </li>
          </ul>
          <div className="mt-6 rounded-xl border border-metal-accent/40 bg-metal-accent/10 px-4 py-3 text-sm text-metal-accent font-semibold">
            Up next: String skipping etudes (drops soon)
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-gray-400">Loading lessons...</p>
      ) : !lessons || lessons.length === 0 ? (
        <div className="text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          No lessons available yet.
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl text-white">Lesson vault</h3>
            <span className="text-sm text-gray-400">{lessons.length} lessons</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id || idx}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-4 shadow-lg transition hover:-translate-y-1 hover:border-metal-accent/50"
              >
                <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-white/0 opacity-60" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg text-white">{lesson.title}</h4>
                    {lesson.difficulty && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                        {lesson.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{lesson.description}</p>
                  {lesson.videoUrl ? (
                    <div className="space-y-2">
                      <div className="overflow-hidden rounded-xl border border-white/5 bg-black/30">
                        <video width="100%" height="auto" controls className="block">
                          <source src={lesson.videoUrl} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent">
                        Watch lesson
                        <span aria-hidden>-&gt;</span>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent">
                      Start lesson
                      <span aria-hidden>-&gt;</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
