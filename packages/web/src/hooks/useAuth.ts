import { useState, useCallback, useEffect } from 'react';
import { useApiMutation } from './useApi';
import { AuthRequestSchema, SignUpRequestSchema } from '@metalmaster/shared-validation';
import type { AuthResponse } from '@metalmaster/shared-types';

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
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');
      
      if (token && user) {
        setState({
          user: JSON.parse(user),
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
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const validated = AuthRequestSchema.parse({ email, password });
      const resp = await mutate<AuthResponse>('/auth/login', 'POST', validated);

      // mutate unwraps the API `data` and returns the typed payload
      localStorage.setItem('auth_token', resp.tokens?.access_token || '');
      localStorage.setItem('auth_user', JSON.stringify(resp.user || null));

      setState({
        user: resp.user || null,
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

      // Call signup endpoint - response will just have user data, no tokens
      // (user must log in after signup)
      await mutate<Record<string, any>>('/auth/signup', 'POST', validated);

      setState({
        user: null,
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
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

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
