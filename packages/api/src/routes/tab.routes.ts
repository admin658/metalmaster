import express from 'express';
import { supabase } from '../index';
import { authenticate } from '../middleware/auth';
import { CreateTabSchema, UpdateTabSchema } from '@metalmaster/shared-validation';

export const tabRoutes = express.Router();

tabRoutes.get('/riff/:riffId', async (req, res, next) => {
  try {
    const { riffId } = req.params;

    const { data, error } = await supabase
      .from('tabs')
      .select('*')
      .eq('riff_id', riffId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
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

tabRoutes.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tabs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tab not found',
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

tabRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = CreateTabSchema.parse(req.body);
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('tabs')
      .insert({
        ...validated,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
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

tabRoutes.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const validated = UpdateTabSchema.parse(req.body);
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { data, error } = await supabase
      .from('tabs')
      .update(validated)
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tab not found',
          },
        });
      }

      throw error;
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

tabRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { error } = await supabase
      .from('tabs')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Tab not found',
          },
        });
      }

      throw error;
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
