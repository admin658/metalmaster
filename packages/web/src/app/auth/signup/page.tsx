import Link from 'next/link';
import SignupForm from '../../signup/SignupForm';

export default function AuthSignupPage() {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-60 w-60 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-8 shadow-2xl">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">Metal Master</p>
          <h1 className="font-display text-3xl text-white">Create your account</h1>
          <p className="text-sm text-gray-300">Unlock riffs, tabs, jam decks, and practice tracking.</p>
        </div>

        <SignupForm />

        <div className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-metal-accent hover:underline">
            Log in
          </Link>
        </div>
        <p className="text-xs text-center uppercase tracking-[0.24em] text-gray-500">Join the shred</p>
      </div>
    </div>
  );
}
