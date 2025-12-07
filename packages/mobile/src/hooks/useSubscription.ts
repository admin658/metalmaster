import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './useAuth';
import type { ApiResponse, SubscriptionStatus } from '@metalmaster/shared-types';

const API_URL = 'http://localhost:3000/api'; // Default or from env

export interface UseSubscriptionReturn {
  status: SubscriptionStatus;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
  manageBilling: () => Promise<void>;
}

/**
 * useSubscription hook for React Native / Expo
 * Fetches subscription status from /api/user-stats
 * Returns current tier and loading/error states
 * Uses SecureStore to retrieve auth token
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (authLoading) return;

      if (!user) {
        setStatus('free');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync('auth_token');

        if (!token) {
          setStatus('free');
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/user-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch subscription status');
        }

        const data = (await res.json()) as ApiResponse<any>;
        const subscriptionStatus = (data.data?.subscription_status || 'free') as SubscriptionStatus;
        setStatus(subscriptionStatus);
        setError(null);
      } catch (err: any) {
        console.error('Subscription fetch error:', err);
        setError(err.message);
        setStatus('free');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, authLoading]);

  const upgradeToPro = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = (await res.json()) as ApiResponse<{ url: string }>;
      if (data.data?.url) {
        // For Expo, use Linking to open the Stripe checkout URL in native browser
        await Linking.openURL(data.data.url);
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.message);
    }
  };

  const manageBilling = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch(`${API_URL}/billing/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = (await res.json()) as ApiResponse<{ url: string }>;
      if (data.data?.url) {
        // For Expo, use Linking to open the billing portal URL in native browser
        await Linking.openURL(data.data.url);
      }
    } catch (err: any) {
      console.error('Billing portal error:', err);
      setError(err.message);
    }
  };

  return {
    status,
    isPro: status === 'pro' || status === 'lifetime',
    isLoading,
    error,
    upgradeToPro,
    manageBilling,
  };
};
