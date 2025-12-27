import express from 'express';
import { supabase } from '../index';
import { AuthRequestSchema, SignUpRequestSchema } from '@metalmaster/shared-validation';
import { buildApiError } from '../middleware/error-handler';

export const authRoutes = express.Router();

authRoutes.post('/login', async (req, res, next) => {
  try {
    const validated = AuthRequestSchema.parse(req.body);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      throw buildApiError(401, 'AUTH_ERROR', error.message);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: (data.user?.user_metadata as any)?.username,
        },
        tokens: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_in: data.session?.expires_in,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/signup', async (req, res, next) => {
  try {
    const validated = SignUpRequestSchema.parse(req.body);
    
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          username: validated.username,
        },
      },
    });

    if (error) {
      throw buildApiError(400, 'SIGNUP_ERROR', error.message);
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw buildApiError(400, 'LOGOUT_ERROR', error.message);
    }

    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      throw buildApiError(401, 'REFRESH_ERROR', error.message);
    }

    res.json({
      success: true,
      data: {
        tokens: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_in: data.session?.expires_in,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
