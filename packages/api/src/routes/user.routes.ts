import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { UpdateUserProfileSchema } from '@metalmaster/shared-validation';

export const userRoutes = express.Router();

userRoutes.get('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

userRoutes.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const validated = UpdateUserProfileSchema.parse(req.body);
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('users')
      .update(validated)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message,
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

userRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    next(error);
  }
});
