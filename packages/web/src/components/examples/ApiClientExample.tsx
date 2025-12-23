'use client';

import { useCallback, useState } from 'react';
import { ApiClientError, apiGet, functionUrl } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';

type HealthResponse = { ok: boolean; ts: string };
type SecureResponse = { ok: true; userId: string; data: unknown };

const format = (value: unknown) => JSON.stringify(value, null, 2);

export function ApiClientExample() {
  const [healthStatus, setHealthStatus] = useState<string>('Not called yet');
  const [secureStatus, setSecureStatus] = useState<string>('Not called yet');

  const callHealth = useCallback(async () => {
    setHealthStatus('Loading...');
    try {
      const res = await apiGet<HealthResponse>(functionUrl('health'));
      setHealthStatus(format(res));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? `${err.message} (status ${err.status ?? 'n/a'})` : String(err);
      setHealthStatus(message);
    }
  }, []);

  const callSecure = useCallback(async () => {
    setSecureStatus('Loading...');
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) {
        throw new Error('No Supabase session token found. Log in first.');
      }

      const res = await apiGet<SecureResponse>(functionUrl('secure-example'), { token });
      setSecureStatus(format(res));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? `${err.message} (status ${err.status ?? 'n/a'})` : String(err);
      setSecureStatus(message);
    }
  }, []);

  return (
    <div style={{ border: '1px solid #333', padding: 16, borderRadius: 8 }}>
      <h3>Netlify Functions Demo</h3>
      <p>Calls go through `/.netlify/functions/*` using the shared apiClient.</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={callHealth}>Ping health</button>
        <button onClick={callSecure}>Call secure-example (requires Supabase session)</button>
      </div>
      <div>
        <strong>Health response:</strong>
        <pre>{healthStatus}</pre>
      </div>
      <div>
        <strong>Secure response:</strong>
        <pre>{secureStatus}</pre>
      </div>
    </div>
  );
}
