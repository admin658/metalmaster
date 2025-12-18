import type { ApiResponse, SubscriptionStatus, UserStats } from '@metalmaster/shared-types';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface UseSubscriptionReturn {
  status: SubscriptionStatus;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
  manageBilling: () => Promise<void>;
  upgradePending: boolean;
  portalPending: boolean;
}

/**
 * useSubscription hook for web (Next.js)
 * Fetches subscription status from /api/user-stats
 * Provides upgrade and billing management methods
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBase = useMemo(() => {
    const env = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
    if (env.startsWith('http') || env.startsWith('/')) return env;
    if (typeof window !== 'undefined') {
      return `${window.location.origin.replace(/\/$/, '')}/${env}`.replace(/\/{2,}/g, '/');
    }
    return `/${env}`.replace(/\/{2,}/g, '/');
  }, []);
  const withBase = useCallback((path: string) => `${apiBase}${path}`, [apiBase]);
  const [upgradePending, setUpgradePending] = useState(false);
  const [portalPending, setPortalPending] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setStatus('free');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setStatus('free');
        setIsLoading(false);
        return;
      }

      const url = withBase('/user-stats');
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const message = `Subscription status request failed (${res.status})`;
        setError(message);
        setStatus('free');
        setIsLoading(false);
        return;
      }

      const data = (await res.json()) as ApiResponse<UserStats>;
      const subscriptionStatus = data.data?.subscription_status || 'free';
      setStatus(subscriptionStatus);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('free');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user, withBase]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Refresh on window focus or periodically while not pro
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onFocus = () => {
      void fetchSubscriptionStatus();
    };

    window.addEventListener('focus', onFocus);

    // Poll modestly to keep status fresh without hammering
    const interval = status === 'pro' || status === 'lifetime'
      ? null
      : window.setInterval(() => void fetchSubscriptionStatus(), 300000);

    return () => {
      window.removeEventListener('focus', onFocus);
      if (interval) window.clearInterval(interval);
    };
  }, [fetchSubscriptionStatus, status]);

  const upgradeToPro = async () => {
    try {
      setUpgradePending(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        const msg = 'Not authenticated - no token found';
        setError(msg);
        return;
      }

      const url = withBase('/billing/create-checkout-session');
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let message = `Checkout session request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error?.message) {
            message = `${message}: ${body.error.message}`;
          }
        } catch (_) {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }

      const data = (await res.json()) as ApiResponse<{ url: string }>;
      
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        const msg = 'Checkout session missing URL';
        setError(msg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpgradePending(false);
    }
  };

  const manageBilling = async () => {
    try {
      setPortalPending(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const url = withBase('/billing/create-portal-session');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let message = `Billing portal request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error?.message) {
            message = `${message}: ${body.error.message}`;
          }
        } catch (_) {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }

      const data = (await res.json()) as ApiResponse<{ url: string }>;
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError('Billing portal missing URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setPortalPending(false);
    }
  };

  return {
    status,
    isPro: status === 'pro' || status === 'lifetime',
    isLoading,
    error,
    upgradeToPro,
    manageBilling,
    upgradePending,
    portalPending,
  };
};
