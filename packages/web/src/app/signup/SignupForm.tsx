'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const baseUsername = (username || email.split('@')[0] || '').trim();
    const safeUsername =
      baseUsername.length >= 3
        ? baseUsername
        : `player-${Math.random().toString(36).slice(2, 6)}`;

    if (safeUsername.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, safeUsername, confirmPassword);
      router.push('/auth/login?message=Check your email to confirm your account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:border-metal-accent focus:outline-none"
        required
      />
      <input
        type="text"
        placeholder="Username (optional)"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:border-metal-accent focus:outline-none"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:border-metal-accent focus:outline-none"
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        className="p-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:border-metal-accent focus:outline-none"
        required
      />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="bg-metal-accent hover:bg-yellow-500 disabled:bg-gray-500 text-black font-bold py-2 rounded transition"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
      <p className="text-gray-400 text-sm text-center">
        Already have an account? <a href="/auth/login" className="text-metal-accent hover:underline">Log in</a>
      </p>
    </form>
  );
}
