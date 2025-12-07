import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-metal-900 text-gray-100 flex items-center">
      <div className="max-w-2xl mx-auto px-4 space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Billing</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Checkout canceled</h1>
          <p className="text-gray-200">
            No changes were made. You can retry whenever you&apos;re ready or keep exploring the free tier.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-metal-accent px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,107,53,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,53,0.65)]"
          >
            View plans
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:text-white hover:bg-white/10"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
