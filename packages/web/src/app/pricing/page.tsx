import PricingCard from '@/components/billing/PricingCard';

export default function PricingPage() {
  const priceLabel = process.env.NEXT_PUBLIC_PRO_PRICE || '$9.99/mo';
  const trialEnabled = (process.env.NEXT_PUBLIC_TRIAL_ENABLED || 'true') === 'true';

  return (
    <div className="relative min-h-screen bg-metal-900 text-gray-100 pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-12">
        <header className="text-center space-y-3 mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Choose your lane</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Pricing</h1>
          <p className="text-gray-200">Keep it free, or unlock the full metal toolbox with PRO.</p>
        </header>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-2xl">
          <div className="absolute inset-0 blur-3xl opacity-60 bg-gradient-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
          <div className="relative">
            <PricingCard priceLabel={priceLabel} trialEnabled={trialEnabled} />
          </div>
        </div>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanCard
            title="Free"
            accent="bg-white/5 border-white/10"
            bullets={[
              'Limited daily riffs',
              'Basic stats',
              'Community access',
              'Local tab playback',
            ]}
          />
          <PlanCard
            title="PRO"
            accent="bg-metal-accent/10 border-metal-accent/60"
            highlight
            bullets={[
              'Unlimited daily riffs',
              'Full practice analytics + streaks',
              'AI Tone + feedback tools',
              'AlphaTab player with advanced controls',
              'Priority support',
            ]}
          />
        </section>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  bullets,
  accent,
  highlight,
}: {
  title: string;
  bullets: string[];
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${accent} p-5 shadow-xl ${
        highlight ? 'ring-1 ring-metal-accent/50' : ''
      }`}
    >
      <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-metal-accent/15 via-purple-700/15 to-black/70" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-white">{title}</h3>
          {highlight && (
            <span className="rounded-full bg-metal-accent px-3 py-1 text-xs font-semibold text-black">Best value</span>
          )}
        </div>
        <ul className="space-y-2 text-sm text-gray-200">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-metal-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
