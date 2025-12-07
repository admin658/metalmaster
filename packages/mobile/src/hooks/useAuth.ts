import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@metalmaster/shared-types';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          const { data: { user: u } } = await supabase.auth.getUser(token);
          if (u) setUser({ id: u.id, email: u.email || '', username: (u.user_metadata as any)?.username });
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '', username: (session.user.user_metadata as any)?.username });
        await SecureStore.setItemAsync('auth_token', session.access_token || '');
        await SecureStore.setItemAsync('refresh_token', session.refresh_token || '');
      } else {
        setUser(null);
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      await SecureStore.setItemAsync('auth_token', data.session.access_token || '');
      await SecureStore.setItemAsync('refresh_token', data.session.refresh_token || '');
    }
    return data;
  }, []);

  const signup = useCallback(async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }, []);

  return { user, isLoading, login, signup, logout } as const;
}
import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useApiMutation } from './useApi';
import { AuthRequestSchema, SignUpRequestSchema } from '@metalmaster/shared-validation';

interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const { mutate } = useApiMutation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userStr = await SecureStore.getItemAsync('auth_user');
        
        if (token && userStr) {
          setState({
            user: JSON.parse(userStr),
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Auth check failed',
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const validated = AuthRequestSchema.parse({ email, password });
      const response = await mutate('/auth/login', 'POST', validated);

      await SecureStore.setItemAsync('auth_token', response.data.tokens.access_token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(response.data.user));

      setState({
        user: response.data.user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, [mutate]);

  const signup = useCallback(async (
    email: string,
    password: string,
    username: string,
    confirmPassword: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const validated = SignUpRequestSchema.parse({
        email,
        password,
        username,
        confirm_password: confirmPassword,
      });

      const response = await mutate('/auth/signup', 'POST', validated);

      setState({
        user: response.data.user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, [mutate]);

  const logout = useCallback(async () => {
    try {
      await mutate('/auth/logout', 'POST');
      
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');

      setState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  }, [mutate]);

  return {
    ...state,
    login,
    signup,
    logout,
  };
};
