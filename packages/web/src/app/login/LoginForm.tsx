'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-2 rounded bg-metal-900 text-gray-100 border border-metal-700"
        autoComplete="email"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-2 rounded bg-metal-900 text-gray-100 border border-metal-700"
        autoComplete="current-password"
        required
      />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="bg-metal-accent hover:bg-yellow-500 disabled:bg-gray-500 text-black font-bold py-2 rounded transition">{loading ? 'Logging in...' : 'Login'}</button>
    </form>
  );
}
